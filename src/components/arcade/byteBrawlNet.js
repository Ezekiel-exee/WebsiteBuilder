import Peer from "peerjs";

const ROOM_PREFIX = "blocksmith-bytebrawl-";
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const MAX_PLAYERS = 3;
export const CODE_LENGTH = 5;

// PeerJS replaces its built-in ICE list when `config` is passed, so its TURN relays are repeated here.
// Relays on port 443 let players on strict corporate/school networks connect, which STUN alone cannot do.
// Set VITE_ICE_SERVERS (a JSON array of RTCIceServer objects) to use your own TURN service instead.
const DEFAULT_ICE_SERVERS = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:global.stun.twilio.com:3478", "stun:stun.cloudflare.com:3478"] },
  { urls: ["turn:eu-0.turn.peerjs.com:3478", "turn:us-0.turn.peerjs.com:3478"], username: "peerjs", credential: "peerjsp" },
  {
    urls: ["turn:openrelay.metered.ca:80", "turn:openrelay.metered.ca:443", "turn:openrelay.metered.ca:443?transport=tcp", "turns:openrelay.metered.ca:443?transport=tcp"],
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

function readIceServers() {
  try {
    const custom = import.meta.env?.VITE_ICE_SERVERS;
    const parsed = custom ? JSON.parse(custom) : null;
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {
    // A malformed override falls back to the defaults.
  }
  return DEFAULT_ICE_SERVERS;
}

const PEER_OPTIONS = { debug: 0, config: { iceServers: readIceServers(), iceCandidatePoolSize: 4 } };

const SERVER_TIMEOUT_MS = 12000;
const CONNECT_TIMEOUT_MS = 18000;
const JOIN_ATTEMPTS = 3;
const MAX_RECONNECTS = 8;
const MAX_BUFFERED_BYTES = 128 * 1024;

const SIGNALING_MESSAGE = "Could not reach the matchmaking server. Check your internet connection — a VPN, firewall or school/work network may be blocking it.";
const DIRECT_LINK_MESSAGE = "Found the room, but could not open a direct connection. One of your networks is blocking peer-to-peer traffic — turn off any VPN or try another network (a phone hotspot works well), then ask the host for a fresh link.";

function randomCode(length) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}

export function normalizeCode(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH);
}

// Accepts a bare code or a whole pasted invite link.
export function extractCode(value) {
  const link = String(value).match(/join\/([A-Za-z0-9]+)/);
  return normalizeCode(link ? link[1] : String(value));
}

export function inviteLink(code) {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#/arcade/join/${code}`;
}

export function readInviteCode() {
  const match = window.location.hash.match(/^#\/arcade\/join\/([A-Za-z0-9]+)\/?$/);
  const code = match ? normalizeCode(match[1]) : "";
  return code.length === CODE_LENGTH ? code : "";
}

// Sending on a channel that is closing throws; callers treat a false result as "peer is gone".
export function safeSend(connection, message) {
  if (!connection?.open) return false;
  try {
    connection.send(message);
    return true;
  } catch {
    return false;
  }
}

// Snapshots are superseded by the next one, so skipping them while the channel is backed up keeps latency
// from growing on slow links.
export function sendLatest(connection, message) {
  if ((connection?.dataChannel?.bufferedAmount ?? 0) > MAX_BUFFERED_BYTES) return false;
  return safeSend(connection, message);
}

export function openRoom({ onConnection, onError, onStatus }) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const attempt = () => {
      const code = randomCode(CODE_LENGTH);
      const peer = new Peer(ROOM_PREFIX + code, PEER_OPTIONS);
      let opened = false;
      let reconnects = 0;
      let reconnectTimer = 0;
      const timeout = window.setTimeout(() => {
        peer.destroy();
        reject(new Error(SIGNALING_MESSAGE));
      }, SERVER_TIMEOUT_MS);

      peer.on("open", () => {
        reconnects = 0;
        onStatus?.("online");
        if (opened) return;
        opened = true;
        window.clearTimeout(timeout);
        resolve({ code, peer });
      });
      peer.on("connection", onConnection);

      // The signaling socket can drop (sleep, wifi change). Players already in the room keep playing because
      // gameplay is peer-to-peer, so re-register the room quietly instead of kicking everybody out.
      peer.on("disconnected", () => {
        if (!opened || peer.destroyed) return;
        const retry = () => {
          if (peer.destroyed || !peer.disconnected) return;
          if (reconnects >= MAX_RECONNECTS) {
            onError?.(new Error("lost-signaling"));
            return;
          }
          reconnects += 1;
          onStatus?.("reconnecting");
          try {
            peer.reconnect();
          } catch {
            return;
          }
          reconnectTimer = window.setTimeout(retry, 4000);
        };
        window.clearTimeout(reconnectTimer);
        reconnectTimer = window.setTimeout(retry, 1000);
      });
      peer.on("close", () => window.clearTimeout(reconnectTimer));

      peer.on("error", (error) => {
        // After the room is open, one guest failing to negotiate must never tear the room down.
        if (opened) {
          if (["browser-incompatible", "invalid-id", "invalid-key", "ssl-unavailable"].includes(error.type)) onError?.(error);
          return;
        }
        window.clearTimeout(timeout);
        peer.destroy();
        if (error.type === "unavailable-id") {
          if (attempts < 5) {
            attempts += 1;
            attempt();
          } else {
            reject(new Error("Could not create a room. Please try again."));
          }
          return;
        }
        reject(new Error(SIGNALING_MESSAGE));
      });
    };
    attempt();
  });
}

function connectOnce(peer, hostId, { onStatus, attempt }) {
  return new Promise((resolve, reject) => {
    onStatus?.(attempt === 1 ? "Connecting to the host…" : `Connecting to the host… (try ${attempt} of ${JOIN_ATTEMPTS})`);
    const connection = peer.connect(hostId, { reliable: true, serialization: "json" });
    let done = false;
    let timer = 0;
    const finish = (error) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      peer.off("error", onPeerError);
      if (!error) {
        resolve(connection);
        return;
      }
      try {
        connection.close();
      } catch {
        // Already closed.
      }
      reject(error);
    };
    const fail = (message, retryable = true) => finish(Object.assign(new Error(message), { retryable }));
    function onPeerError(error) {
      if (error.type === "peer-unavailable") fail("No room found with that code. Check the link or code, and make sure the host is still on the room screen.", false);
      else if (error.type === "webrtc" || error.type === "negotiation-failed") fail(DIRECT_LINK_MESSAGE);
    }
    timer = window.setTimeout(() => {
      const state = connection.peerConnection?.iceConnectionState;
      fail(state === undefined || state === "new" ? SIGNALING_MESSAGE : DIRECT_LINK_MESSAGE);
    }, CONNECT_TIMEOUT_MS);
    peer.on("error", onPeerError);
    connection.on("open", () => finish());
    connection.on("error", () => fail(DIRECT_LINK_MESSAGE));
    connection.on("close", () => fail(DIRECT_LINK_MESSAGE));
  });
}

export async function joinRoom(code, { onStatus } = {}) {
  onStatus?.("Contacting the matchmaking server…");
  const peer = await new Promise((resolve, reject) => {
    const candidate = new Peer(`${ROOM_PREFIX}guest-${randomCode(8)}`, PEER_OPTIONS);
    const timer = window.setTimeout(() => {
      candidate.destroy();
      reject(new Error(SIGNALING_MESSAGE));
    }, SERVER_TIMEOUT_MS);
    const onError = () => {
      window.clearTimeout(timer);
      candidate.destroy();
      reject(new Error(SIGNALING_MESSAGE));
    };
    candidate.once("error", onError);
    candidate.once("open", () => {
      window.clearTimeout(timer);
      candidate.off("error", onError);
      resolve(candidate);
    });
  });

  let lastError = new Error(DIRECT_LINK_MESSAGE);
  for (let attempt = 1; attempt <= JOIN_ATTEMPTS; attempt += 1) {
    try {
      const connection = await connectOnce(peer, ROOM_PREFIX + code, { onStatus, attempt });
      return { peer, connection };
    } catch (error) {
      lastError = error;
      if (error.retryable === false || peer.destroyed) break;
    }
  }
  peer.destroy();
  throw lastError;
}
