import Peer from "peerjs";

const ROOM_PREFIX = "blocksmith-bytebrawl-";
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const MAX_PLAYERS = 3;
export const CODE_LENGTH = 5;

function randomCode(length) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}

export function normalizeCode(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH);
}

// Room codes are PeerJS ids, so no HTTP id lookup is needed (the page CSP only allows ws/wss for connect-src).
export function openRoom({ onConnection, onError }) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const attempt = () => {
      const code = randomCode(CODE_LENGTH);
      const peer = new Peer(ROOM_PREFIX + code, { debug: 0 });
      let opened = false;
      const timeout = window.setTimeout(() => {
        peer.destroy();
        reject(new Error("Could not reach the matchmaking server. Check your connection and try again."));
      }, 12000);
      peer.on("open", () => {
        opened = true;
        window.clearTimeout(timeout);
        resolve({ code, peer });
      });
      peer.on("connection", onConnection);
      peer.on("error", (error) => {
        if (opened) {
          onError?.(error);
          return;
        }
        window.clearTimeout(timeout);
        peer.destroy();
        if (error.type === "unavailable-id" && attempts < 5) {
          attempts += 1;
          attempt();
          return;
        }
        reject(new Error("Could not create a room. Please try again."));
      });
    };
    attempt();
  });
}

export function joinRoom(code) {
  return new Promise((resolve, reject) => {
    const peer = new Peer(`${ROOM_PREFIX}guest-${randomCode(8)}`, { debug: 0 });
    let settled = false;
    let timer = 0;
    const fail = (message) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      peer.destroy();
      reject(new Error(message));
    };
    timer = window.setTimeout(() => fail("Could not connect to that room. Check the code and try again."), 15000);
    peer.on("error", (error) => fail(error.type === "peer-unavailable" ? "No room found with that code." : "Connection error. Please try again."));
    peer.on("open", () => {
      const connection = peer.connect(ROOM_PREFIX + code, { reliable: true, serialization: "json" });
      connection.on("open", () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve({ peer, connection });
      });
      connection.on("error", () => fail("Connection error. Please try again."));
    });
  });
}
