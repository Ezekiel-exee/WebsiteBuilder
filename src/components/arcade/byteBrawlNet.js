import { RealtimeClient } from "@supabase/realtime-js";

// Online play runs over Supabase Realtime. Every player joins one Broadcast channel per room; the host's browser
// still runs the match, and Presence tells everyone when a player or the host leaves. Links expose the small
// connection-like surface (`send`, `close`, `on("data" | "close")`, `open`) the lobby and match code use.

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DEFAULT_CHANNEL = "bytebrawl";
const EVENT = "m";
const HOST = "host";
const EVERYONE = "*";

export const MAX_PLAYERS = 3;
export const CODE_LENGTH = 5;

const SUBSCRIBE_TIMEOUT_MS = 12000;
const PRESENCE_WAIT_MS = 6000;
const RECONNECT_GIVE_UP_MS = 45000;
const MAX_BUFFERED_BYTES = 64 * 1024;

const NOT_CONFIGURED_MESSAGE = "Online play isn't set up on this site yet (missing Supabase settings).";
const SERVER_MESSAGE = "Could not reach the online server. Check your internet connection — a VPN, firewall or school/work network may be blocking it.";
const NO_ROOM_MESSAGE = "No room found with that code. Check the link or code, and make sure the host is still on the room screen.";

const env = import.meta.env || {};
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;

// Tests inject a fake Realtime client; production always uses the real one.
let clientFactory = null;
export function setRealtimeClientFactory(factory) {
  clientFactory = factory;
}

export function isOnlineConfigured() {
  return Boolean(clientFactory || (SUPABASE_URL && SUPABASE_KEY));
}

// Older Safari/iOS throws "The string did not match the expected pattern" for https:// URLs in the WebSocket
// constructor (newer Chrome/Firefox accept them), so the endpoint must be wss://.
export function realtimeEndpoint(baseUrl) {
  const url = new URL("realtime/v1", `${baseUrl.trim().replace(/\/+$/, "")}/`);
  url.protocol = url.protocol.replace(/^http/, "ws");
  return url.toString();
}

function createClient() {
  if (clientFactory) return clientFactory();
  if (!isOnlineConfigured()) throw new Error(NOT_CONFIGURED_MESSAGE);
  return new RealtimeClient(realtimeEndpoint(SUPABASE_URL), {
    params: { apikey: SUPABASE_KEY.trim(), eventsPerSecond: 60 },
  });
}

function randomCode(length) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}

export function normalizeCode(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH);
}

// Accepts a bare code or a whole pasted invite link.
export function extractCode(value) {
  const link = String(value).match(/(?:join|play)\/([A-Za-z0-9]+)/);
  return normalizeCode(link ? link[1] : String(value));
}

// Byte Brawl rooms use `#/arcade/join/CODE`; the board-game room uses `#/arcade/play/CODE/GAME`.
export function inviteLink(code, game = "") {
  const { origin, pathname } = window.location;
  return game ? `${origin}${pathname}#/arcade/play/${code}/${game}` : `${origin}${pathname}#/arcade/join/${code}`;
}

export function readInviteCode() {
  const match = window.location.hash.match(/^#\/arcade\/join\/([A-Za-z0-9]+)\/?$/);
  const code = match ? normalizeCode(match[1]) : "";
  return code.length === CODE_LENGTH ? code : "";
}

export function readBoardInvite() {
  const match = window.location.hash.match(/^#\/arcade\/play\/([A-Za-z0-9]+)(?:\/([a-z0-9-]+))?\/?$/);
  const code = match ? normalizeCode(match[1]) : "";
  return code.length === CODE_LENGTH ? { code, game: match[2] || "" } : null;
}

// Sending on a closed link throws; callers treat a false result as "peer is gone".
export function safeSend(connection, message) {
  if (!connection?.open) return false;
  try {
    connection.send(message);
    return true;
  } catch {
    return false;
  }
}

// Snapshots are superseded by the next one, so skipping them while the socket is backed up keeps latency
// from growing on slow links.
export function sendLatest(connection, message) {
  if (connection?.congested?.()) return false;
  return safeSend(connection, message);
}

// Sends one message to every open link. The host's links share a channel, so a single broadcast reaches all
// guests and counts once against the Realtime quota instead of once per guest.
export function broadcast(connections, message, { droppable = false } = {}) {
  const open = [...connections].filter((connection) => connection.open);
  if (!open.length) return;
  const shared = open.find((connection) => connection.sendToAll);
  if (shared) {
    if (droppable && shared.congested?.()) return;
    try {
      shared.sendToAll(message);
    } catch {
      // The channel is closing; links report it through their close events.
    }
    return;
  }
  for (const connection of open) (droppable ? sendLatest : safeSend)(connection, message);
}

// One peer's side of the conversation, shaped like the connection objects the game code expects.
class Link {
  constructor({ transmit, congested, sendToAll }) {
    this.open = true;
    this.transmit = transmit;
    this.congested = congested;
    this.sendToAll = sendToAll;
    this.handlers = { data: [], close: [] };
  }

  on(event, handler) {
    this.handlers[event]?.push(handler);
    return this;
  }

  emit(event, value) {
    for (const handler of [...(this.handlers[event] || [])]) handler(value);
  }

  send(message) {
    if (!this.open) throw new Error("Connection closed");
    this.transmit({ d: message });
  }

  // `notify` tells the other side; it is skipped when the other side is the one that left.
  close(notify = true) {
    if (!this.open) return;
    this.open = false;
    if (notify) {
      try {
        this.transmit({ k: "bye" });
      } catch {
        // The channel may already be gone.
      }
    }
    this.emit("close");
  }
}

// Joins the room's channel. Resolves once subscribed; `onStatus` reports later connection drops and recoveries.
function joinChannel(client, channelName, code, presenceKey, { onBroadcast, onLeave, onStatus }) {
  return new Promise((resolve, reject) => {
    const channel = client.channel(`${channelName}:${code}`, {
      config: { broadcast: { self: false, ack: false }, presence: { key: presenceKey, enabled: true } },
    });
    let resolveSynced;
    const synced = new Promise((done) => {
      resolveSynced = done;
    });
    let settled = false;
    let everSubscribed = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(SERVER_MESSAGE));
    }, SUBSCRIBE_TIMEOUT_MS);

    channel.on("broadcast", { event: EVENT }, ({ payload }) => {
      if (payload && typeof payload === "object") onBroadcast(payload);
    });
    channel.on("presence", { event: "sync" }, () => resolveSynced());
    channel.on("presence", { event: "leave" }, ({ key }) => onLeave?.(key));

    try {
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          window.clearTimeout(timer);
          if (everSubscribed) {
            // Presence is dropped when the socket reconnects, so announce ourselves again.
            channel.track({ role: presenceKey === HOST ? HOST : "guest" });
            onStatus?.("online");
          }
          everSubscribed = true;
          if (!settled) {
            settled = true;
            resolve({ channel, synced });
          }
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          if (!settled) {
            settled = true;
            window.clearTimeout(timer);
            reject(new Error(SERVER_MESSAGE));
          } else {
            onStatus?.("reconnecting");
          }
        }
      });
    } catch (error) {
      // Some browsers refuse to open the socket at all; keep their message so the cause is visible.
      settled = true;
      window.clearTimeout(timer);
      reject(new Error(`${SERVER_MESSAGE} (${error.message})`));
    }
  });
}

function hostIsPresent(channel) {
  return Object.keys(channel.presenceState()).includes(HOST);
}

async function waitFor(condition, timeoutMs, stepMs = 300) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    if (condition()) return true;
    await new Promise((resolve) => window.setTimeout(resolve, stepMs));
  }
  return condition();
}

function makeDestroy(client, channel, beforeClose) {
  let destroyed = false;
  return () => {
    if (destroyed) return;
    destroyed = true;
    beforeClose?.();
    Promise.resolve(client.removeChannel(channel))
      .catch(() => {})
      .finally(() => Promise.resolve(client.disconnect()).catch(() => {}));
  };
}

const waitForSync = (synced) => Promise.race([synced, new Promise((resolve) => window.setTimeout(resolve, PRESENCE_WAIT_MS))]);

export async function openRoom({ onConnection, onError, onStatus, channelName = DEFAULT_CHANNEL }) {
  if (!isOnlineConfigured()) throw new Error(NOT_CONFIGURED_MESSAGE);
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const code = randomCode(CODE_LENGTH);
    const client = createClient();
    const links = new Map();
    let channel;
    let giveUpTimer = 0;
    let current = "online";
    const send = (envelope) => {
      channel?.send({ type: "broadcast", event: EVENT, payload: { from: HOST, ...envelope } });
    };
    const congested = () => (client.conn?.bufferedAmount ?? 0) > MAX_BUFFERED_BYTES;
    const reportStatus = (state) => {
      if (state === current) return;
      current = state;
      window.clearTimeout(giveUpTimer);
      if (state === "reconnecting") giveUpTimer = window.setTimeout(() => onError?.(new Error("lost-signaling")), RECONNECT_GIVE_UP_MS);
      onStatus?.(state);
    };
    const linkFor = (guestId) => {
      let link = links.get(guestId);
      if (link) return link;
      link = new Link({
        transmit: (envelope) => send({ to: guestId, ...envelope }),
        congested,
        sendToAll: (message) => send({ to: EVERYONE, d: message }),
      });
      link.on("close", () => links.delete(guestId));
      links.set(guestId, link);
      onConnection(link);
      return link;
    };

    let joined;
    try {
      joined = await joinChannel(client, channelName, code, HOST, {
        onBroadcast: (payload) => {
          if (payload.to !== HOST || typeof payload.from !== "string" || payload.from === HOST) return;
          if (payload.k === "bye") links.get(payload.from)?.close(false);
          // The first message from an unknown guest opens its link.
          else if (payload.d && typeof payload.d === "object") linkFor(payload.from).emit("data", payload.d);
        },
        onLeave: (key) => links.get(key)?.close(false),
        onStatus: reportStatus,
      });
    } catch (error) {
      client.disconnect();
      throw error;
    }
    channel = joined.channel;
    const destroy = makeDestroy(client, channel, () => {
      window.clearTimeout(giveUpTimer);
      for (const link of [...links.values()]) link.close();
    });

    await waitForSync(joined.synced);
    if (hostIsPresent(channel)) {
      // Another host already owns this code; try a different one.
      destroy();
      continue;
    }
    channel.track({ role: HOST });
    return { code, peer: { destroy } };
  }
  throw new Error("Could not create a room. Please try again.");
}

export async function joinRoom(code, { onStatus, channelName = DEFAULT_CHANNEL } = {}) {
  if (!isOnlineConfigured()) throw new Error(NOT_CONFIGURED_MESSAGE);
  onStatus?.("Contacting the online server…");
  const client = createClient();
  const guestId = randomCode(10);
  let link = null;
  let channel;
  const congested = () => (client.conn?.bufferedAmount ?? 0) > MAX_BUFFERED_BYTES;
  const transmit = (envelope) => {
    channel?.send({ type: "broadcast", event: EVENT, payload: { from: guestId, to: HOST, ...envelope } });
  };
  let joined;
  try {
    joined = await joinChannel(client, channelName, code, guestId, {
      onBroadcast: (payload) => {
        if (!link || payload.from !== HOST || (payload.to !== guestId && payload.to !== EVERYONE)) return;
        if (payload.k === "bye") link.close(false);
        else if (payload.d && typeof payload.d === "object") link.emit("data", payload.d);
      },
      onLeave: (key) => {
        if (key === HOST) link?.close(false);
      },
      onStatus: (state) => {
        if (state === "reconnecting") onStatus?.("Reconnecting…");
      },
    });
  } catch (error) {
    client.disconnect();
    throw error;
  }
  channel = joined.channel;
  const destroy = makeDestroy(client, channel, () => link?.close());

  onStatus?.("Looking for the room…");
  await waitForSync(joined.synced);
  if (!(await waitFor(() => hostIsPresent(channel), 4000))) {
    destroy();
    throw Object.assign(new Error(NO_ROOM_MESSAGE), { retryable: false });
  }
  channel.track({ role: "guest" });
  link = new Link({ transmit, congested });
  return { peer: { destroy }, connection: link };
}
