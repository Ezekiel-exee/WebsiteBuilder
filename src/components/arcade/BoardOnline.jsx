import { useCallback, useEffect, useRef, useState } from "react";
import { BOARD_KINDS, createBoardGame, isBoardKind, playBoardMove } from "./boardEngine";
import { BoardSurface, PlayerChips, ResultPanel, SeatBadge, digitMove, useDelayed } from "./BoardParts";
import { GameFrame } from "./GameFrame";
import { broadcast as sendToGuests, extractCode, inviteLink, isOnlineConfigured, joinRoom, openRoom, safeSend } from "./byteBrawlNet";
import { copyToClipboard } from "../../utils/clipboard";

// One room serves every board game. The host's browser owns the state and broadcasts the whole (tiny) room view
// after each change, so players can finish a game and return to the lobby — or switch games — without reconnecting.

const ROOM_CHANNEL = "arcadeboard";
const MAX_PLAYERS = 2;
const NAME_STORAGE_KEY = "blocksmith-bytebrawl-name";
const PING_INTERVAL_MS = 3000;
const SILENCE_TIMEOUT_MS = 15000;
const WELCOME_TIMEOUT_MS = 8000;
const RESULT_DELAY_MS = 800;
const FRESH_SCORES = { 0: 0, 1: 0, draw: 0 };

function cleanName(value) {
  return value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 10).toUpperCase() || "PLAYER";
}

function readSavedName() {
  try {
    return cleanName(window.localStorage.getItem(NAME_STORAGE_KEY) || "");
  } catch {
    return "PLAYER";
  }
}

function RoomHeader({ kind, title, subtitle, onBack, backLabel }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="mb-2 flex items-center gap-2 font-mono text-xs text-zinc-500">
          <span className="text-emerald-400">~/arcade</span><span>/</span><span>{kind}</span><span>/</span><span>online</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
        <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
      </div>
      <button type="button" onClick={onBack} className="rounded-lg border border-white/10 px-3 py-2 font-mono text-xs text-zinc-300 transition hover:border-white/20 hover:bg-white/5">
        {backLabel}
      </button>
    </div>
  );
}

function OnlineMenu({ kind, name, setName, joinCode, setJoinCode, busy, status, inviteCode, error, configured, onHost, onJoin, onBack }) {
  const joiningInvite = busy && inviteCode;
  return (
    <div>
      <RoomHeader kind={kind} title="Play online" subtitle="Create a room and send your friend the invite link — they open it and join automatically. Two players." onBack={onBack} backLabel="< modes" />
      {joiningInvite && (
        <p role="status" className="mb-5 rounded-lg border border-cyan-300/30 bg-cyan-300/5 px-3 py-3 font-mono text-xs text-cyan-100">
          joining room <span className="font-bold tracking-[0.25em]">{inviteCode}</span> · {status || "connecting…"}
        </p>
      )}
      <div className="mb-5 max-w-sm">
        <label className="grid gap-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          Your name
          <input
            value={name}
            onChange={(event) => setName(cleanName(event.target.value))}
            maxLength={10}
            className="h-10 rounded-lg border border-white/10 bg-[#0b0d12] px-3 text-sm normal-case tracking-normal text-zinc-200 outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-[#0b0d12] p-5">
          <h3 className="font-mono text-sm font-semibold text-zinc-100">$ host a room</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">You get an invite link to send to a friend. Once they join you can pick any board game, and keep playing in the same room.</p>
          <button type="button" disabled={busy || !configured} onClick={onHost} className="mt-4 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 font-mono text-xs font-semibold text-cyan-100 transition enabled:hover:bg-cyan-300/20 disabled:opacity-50">
            {busy && !inviteCode ? status || "connecting…" : "$ create room"}
          </button>
        </section>
        <form
          className="rounded-xl border border-white/10 bg-[#0b0d12] p-5"
          onSubmit={(event) => {
            event.preventDefault();
            onJoin();
          }}
        >
          <h3 className="font-mono text-sm font-semibold text-zinc-100">$ join a room</h3>
          <label className="mt-3 grid gap-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            Room code or invite link
            <input
              value={joinCode}
              onChange={(event) => setJoinCode(extractCode(event.target.value))}
              onPaste={(event) => {
                event.preventDefault();
                setJoinCode(extractCode(event.clipboardData.getData("text")));
              }}
              placeholder="ABCDE"
              autoComplete="off"
              spellCheck={false}
              className="h-10 rounded-lg border border-white/10 bg-[#080a0f] px-3 font-mono text-lg tracking-[0.35em] text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
            />
          </label>
          <button type="submit" disabled={busy || !configured || joinCode.length < 5} className="mt-4 rounded-lg border border-lime-300/30 bg-lime-300/10 px-4 py-2 font-mono text-xs font-semibold text-lime-100 transition enabled:hover:bg-lime-300/20 disabled:opacity-50">
            {busy ? "connecting…" : "$ join room"}
          </button>
        </form>
      </div>
      {!configured && <p role="alert" className="mt-5 rounded-lg border border-amber-300/30 bg-amber-300/5 px-3 py-2 font-mono text-xs leading-5 text-amber-200">Online play isn't set up on this site yet. The site owner needs to add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see the README).</p>}
      {error && <p role="alert" className="mt-4 rounded-lg border border-rose-400/30 bg-rose-400/5 px-3 py-2 font-mono text-xs leading-5 text-rose-200">{error}</p>}
    </div>
  );
}

function Lobby({ role, code, view, myId, signal, onKind, onStart, onLeave }) {
  const host = role === "host";
  const [copied, setCopied] = useState("");
  const link = inviteLink(code, view.kind);
  const ready = view.players.length >= MAX_PLAYERS;
  const played = view.scores[0] + view.scores[1] + view.scores.draw > 0;
  const nameOf = (id) => view.players.find((player) => player.id === id)?.name || "—";
  const copy = async (kind, text) => {
    if (await copyToClipboard(text)) {
      setCopied(kind);
      window.setTimeout(() => setCopied(""), 1800);
    }
  };
  return (
    <div>
      <RoomHeader kind={view.kind} title={host ? "Your room" : "Room lobby"} subtitle={host ? "Send the invite link to a friend, pick a game, and start." : "Connected! Waiting for the host to start a game."} onBack={onLeave} backLabel="< leave room" />
      {view.notice && <p role="status" className="mb-4 rounded-lg border border-amber-300/30 bg-amber-300/5 px-3 py-2 font-mono text-xs text-amber-200">{view.notice}</p>}
      {host && signal === "reconnecting" && (
        <p role="status" className="mb-4 rounded-lg border border-amber-300/30 bg-amber-300/5 px-3 py-2 font-mono text-xs text-amber-200">reconnecting to the online server… the game pauses and new players can't join until it's back.</p>
      )}
      <div className="mb-5 grid gap-4 rounded-xl border border-white/10 bg-[#0b0d12] p-4 md:grid-cols-[auto_1fr]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Room code</p>
          <p className="font-mono text-3xl font-bold tracking-[0.35em] text-cyan-200" aria-label={`Room code ${code.split("").join(" ")}`}>{code}</p>
        </div>
        {host && (
          <div className="min-w-0">
            <label className="grid gap-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Invite link
              <input readOnly value={link} onFocus={(event) => event.target.select()} className="h-10 w-full min-w-0 truncate rounded-lg border border-white/10 bg-[#080a0f] px-3 font-mono text-xs normal-case tracking-normal text-zinc-200 outline-none focus:border-cyan-400/40" />
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => copy("link", link)} className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 font-mono text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/20">
                {copied === "link" ? "link copied!" : "$ copy invite link"}
              </button>
              <button type="button" onClick={() => copy("code", code)} className="rounded-lg border border-white/10 px-3 py-2 font-mono text-xs text-zinc-300 transition hover:bg-white/5">
                {copied === "code" ? "code copied!" : "$ copy code"}
              </button>
            </div>
          </div>
        )}
      </div>

      <section aria-label="Players" className="mb-5 grid gap-2 sm:grid-cols-2">
        {Array.from({ length: MAX_PLAYERS }, (_, slot) => {
          const player = view.players[slot];
          return (
            <div key={slot} className={`rounded-lg border px-3 py-3 font-mono text-xs ${player ? "border-white/15 bg-white/[0.03]" : "border-dashed border-white/10 text-zinc-600"}`}>
              {player ? (
                <span className="flex items-center gap-2 text-zinc-100">
                  <SeatBadge kind={view.kind} seat={slot} />
                  {player.name}
                  {player.id === 0 && <span className="text-[10px] text-amber-300">HOST</span>}
                  {player.id === myId && <span className="text-[10px] text-cyan-300">YOU</span>}
                </span>
              ) : (
                "waiting for player…"
              )}
            </div>
          );
        })}
      </section>

      {played && (
        <p className="mb-5 font-mono text-xs text-zinc-400">
          <span className="text-zinc-600">SERIES </span>
          {nameOf(0)} <span className="text-white">{view.scores[0]}</span> – <span className="text-white">{view.scores[1]}</span> {nameOf(1)} · draws <span className="text-white">{view.scores.draw}</span>
        </p>
      )}

      <section aria-label="Game" className="mb-5">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Game</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.values(BOARD_KINDS).map((spec) => (
            <button
              key={spec.id}
              type="button"
              disabled={!host}
              aria-pressed={view.kind === spec.id}
              onClick={() => onKind(spec.id)}
              className={`rounded-xl border p-4 text-left font-mono transition disabled:cursor-default ${view.kind === spec.id ? "border-cyan-300/50 bg-cyan-300/10" : "border-white/10 bg-[#0b0d12] enabled:hover:border-white/20"}`}
            >
              <span className={`flex items-center gap-2 text-sm font-semibold ${view.kind === spec.id ? "text-cyan-200" : "text-zinc-200"}`}>
                <SeatBadge kind={spec.id} seat={0} /><SeatBadge kind={spec.id} seat={1} /> {spec.name}
              </span>
              <span className="mt-1 block text-xs text-zinc-500">Get {spec.need} in a row on a {spec.cols}×{spec.rows} board.</span>
            </button>
          ))}
        </div>
      </section>

      {host ? (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={!ready} onClick={onStart} className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-5 py-2.5 font-mono text-sm font-semibold text-cyan-100 transition enabled:hover:bg-cyan-300/20 disabled:opacity-50">
            $ start game
          </button>
          {!ready && <p className="font-mono text-xs text-amber-300">Waiting for a friend to join.</p>}
        </div>
      ) : (
        <p className="font-mono text-xs text-zinc-500">// only the host picks the game and starts it</p>
      )}
    </div>
  );
}

function OnlineMatch({ view, myId, code, onMove, onRematch, onLobby, onLeave }) {
  const { game, kind } = view;
  const spec = BOARD_KINDS[kind];
  const names = [0, 1].map((seat) => view.players.find((player) => player.id === seat)?.name || "—");
  const opponent = 1 - myId;
  const myTurn = game.winner === null && game.turn === myId;
  const showResult = useDelayed(game.winner !== null, RESULT_DELAY_MS);

  let tone = "draw";
  let title = "It's a draw";
  let subtitle = "The board is full — nobody connected.";
  if (game.winner === 0 || game.winner === 1) {
    const won = game.winner === myId;
    tone = won ? "win" : "lose";
    title = won ? "You win!" : `${names[game.winner]} wins`;
    subtitle = `${spec.marks[game.winner]} connected ${spec.need} in a row.`;
  }

  const onKeyDown = (event) => {
    const value = digitMove(kind, event.key);
    if (value !== null && myTurn) onMove(value);
  };

  return (
    <GameFrame
      title={spec.name}
      description={`Room ${code} · you are ${spec.marks[myId]} against ${names[opponent]}.`}
      status={game.winner === null ? "running" : "won"}
      metrics={[{ label: "ROOM", value: code }, { label: "YOU", value: spec.marks[myId] }, { label: "MOVES", value: game.moves }, { label: names[0], value: view.scores[0] }, { label: names[1], value: view.scores[1] }, { label: "DRAWS", value: view.scores.draw }]}
      onBack={onLobby}
      backLabel="< lobby"
      extraActions={
        <button type="button" onClick={onLeave} className="rounded-lg border border-white/10 px-3 py-2 font-mono text-xs text-zinc-300 transition hover:border-white/20 hover:bg-white/5">
          leave room
        </button>
      }
      onRestart={onRematch}
      canRestart={game.winner !== null}
      onKeyDown={onKeyDown}
      controls={`Click ${spec.gravity ? "a column" : "a square"} or press ${spec.gravity ? "1–7" : "1–9"} to place a piece on your turn. "< lobby" takes both of you back to the room lobby to pick another game — nobody has to reconnect.`}
    >
      <PlayerChips game={game} players={names.map((name, seat) => ({ name, tag: seat === myId ? "YOU" : "" }))} />
      <BoardSurface game={game} onMove={onMove} disabled={!myTurn} />
      <p role="status" className="mt-4 text-center font-mono text-xs text-zinc-500">
        {game.winner !== null ? "game finished" : myTurn ? "your turn" : `waiting for ${names[opponent]}…`}
      </p>
      {showResult && (
        <ResultPanel
          key={view.round}
          tone={tone}
          title={title}
          subtitle={subtitle}
          badge={game.winner === 0 || game.winner === 1 ? <SeatBadge kind={kind} seat={game.winner} size="h-7 w-7" /> : null}
          scores={[{ label: names[myId], value: view.scores[myId] }, { label: "Draws", value: view.scores.draw }, { label: names[opponent], value: view.scores[opponent] }]}
          actions={[
            { label: "$ rematch", onClick: onRematch, primary: true },
            { label: "$ back to lobby", onClick: onLobby },
            { label: "leave room", onClick: onLeave },
          ]}
          note="Back to lobby keeps the room open so you can pick another game."
        />
      )}
    </GameFrame>
  );
}

export default function BoardOnline({ kind, onKindChange, onExit, invite }) {
  const [name, setName] = useState(readSavedName);
  const [joinCode, setJoinCode] = useState(invite?.code || "");
  const [busy, setBusy] = useState(Boolean(invite?.code));
  const [status, setStatus] = useState("");
  const [signal, setSignal] = useState("online");
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);
  const [code, setCode] = useState("");
  const [myId, setMyId] = useState(0);
  const [view, setView] = useState(null);
  const net = useRef({ peer: null, conns: new Map(), hostConn: null, lastSeen: 0, code: "" }).current;
  const viewRef = useRef(null);
  // Bumped whenever a host/join attempt starts or is torn down, so a slow attempt that finishes late can tell it is stale.
  const attemptRef = useRef(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(NAME_STORAGE_KEY, name);
    } catch {
      // Storage can be unavailable (private mode); the name just isn't remembered.
    }
  }, [name]);

  // The host publishes every change to everyone; guests only ever render what they are sent.
  const publish = useCallback(
    (patch) => {
      const next = { ...viewRef.current, notice: "", ...patch };
      viewRef.current = next;
      setView(next);
      sendToGuests(net.conns.values(), { t: "sync", view: next });
    },
    [net],
  );

  const teardown = useCallback(() => {
    attemptRef.current += 1;
    net.conns.forEach((connection) => connection.close());
    net.conns.clear();
    net.hostConn?.close();
    net.hostConn = null;
    net.peer?.destroy();
    net.peer = null;
  }, [net]);

  useEffect(() => teardown, [teardown]);

  const resetToMenu = useCallback(
    (message = "") => {
      teardown();
      viewRef.current = null;
      setView(null);
      setRole(null);
      setCode("");
      setBusy(false);
      setSignal("online");
      setError(message);
    },
    [teardown],
  );

  const nameOf = (id) => viewRef.current?.players.find((player) => player.id === id)?.name || "Your opponent";

  const startGame = useCallback(
    (nextKind) => {
      const current = viewRef.current;
      if (!current || current.players.length < MAX_PLAYERS) return;
      const gameKind = isBoardKind(nextKind) ? nextKind : current.kind;
      publish({ kind: gameKind, phase: "playing", round: current.round + 1, game: createBoardGame(gameKind, current.round % 2) });
    },
    [publish],
  );

  const applyMove = useCallback(
    (fromId, move) => {
      const current = viewRef.current;
      if (!current || current.phase !== "playing" || !current.game || current.game.turn !== fromId) return;
      const next = playBoardMove(current.game, move);
      if (!next) return;
      const scores = next.winner === null ? current.scores : { ...current.scores, [next.winner]: current.scores[next.winner] + 1 };
      publish({ game: next, scores });
    },
    [publish],
  );

  const returnToLobby = useCallback(
    (fromId) => {
      const current = viewRef.current;
      if (!current || current.phase === "lobby") return;
      publish({ phase: "lobby", game: null, notice: fromId === 0 ? "" : `${nameOf(fromId)} took everyone back to the lobby.` });
    },
    [publish],
  );

  const removePlayer = useCallback(
    (id) => {
      if (id === undefined) return;
      net.conns.delete(id);
      const current = viewRef.current;
      const gone = current?.players.find((player) => player.id === id);
      if (!gone) return;
      publish({ players: current.players.filter((player) => player.id !== id), phase: "lobby", game: null, scores: { ...FRESH_SCORES }, notice: `${gone.name} left the room.` });
    },
    [net, publish],
  );

  // Players that go silent (closed laptop, dropped wifi) never fire a clean close event, so ping both ways and time them out.
  useEffect(() => {
    if (!role) return undefined;
    const timer = window.setInterval(() => {
      const now = Date.now();
      if (role === "host") {
        for (const [id, connection] of [...net.conns]) {
          safeSend(connection, { t: "ping" });
          if (now - (connection.lastSeen || now) > SILENCE_TIMEOUT_MS) {
            connection.close();
            removePlayer(id);
          }
        }
      } else if (net.hostConn) {
        safeSend(net.hostConn, { t: "ping" });
        if (net.lastSeen && now - net.lastSeen > SILENCE_TIMEOUT_MS) resetToMenu("Lost connection to the host.");
      }
    }, PING_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [net, removePlayer, resetToMenu, role]);

  // Guests follow the game the host picked, so the arcade header always names the game being played.
  useEffect(() => {
    if (view?.kind && view.kind !== kind && isBoardKind(view.kind)) onKindChange?.(view.kind);
  }, [kind, onKindChange, view?.kind]);

  const handleGuestConnection = useCallback(
    (connection) => {
      connection.lastSeen = Date.now();
      const reject = (reason) => {
        safeSend(connection, { t: "rejected", reason });
        window.setTimeout(() => connection.close(), 300);
      };
      connection.on("data", (message) => {
        if (!message || typeof message !== "object") return;
        connection.lastSeen = Date.now();
        const current = viewRef.current;
        if (!current) return;
        if (message.t === "hello") {
          if (connection.playerId !== undefined) return;
          if (current.players.length >= MAX_PLAYERS) return reject("That room is full.");
          let guestName = cleanName(String(message.name || "PLAYER"));
          if (current.players.some((player) => player.name === guestName)) guestName = `${guestName.slice(0, 8)}_2`;
          connection.playerId = 1;
          net.conns.set(1, connection);
          safeSend(connection, { t: "welcome", id: 1, code: net.code });
          publish({ players: [...current.players, { id: 1, name: guestName }], scores: { ...FRESH_SCORES } });
        } else if (connection.playerId === undefined) {
          return;
        } else if (message.t === "move") {
          applyMove(connection.playerId, message.move);
        } else if (message.t === "lobby") {
          returnToLobby(connection.playerId);
        } else if (message.t === "rematch") {
          if (current.phase === "playing" && current.game?.winner !== null) startGame();
        }
      });
      connection.on("close", () => removePlayer(connection.playerId));
    },
    [applyMove, net, publish, removePlayer, returnToLobby, startGame],
  );

  const hostRoom = async () => {
    const attempt = attemptRef.current + 1;
    attemptRef.current = attempt;
    setBusy(true);
    setError("");
    setStatus("Contacting the online server…");
    const initial = { players: [{ id: 0, name: cleanName(name) }], kind, phase: "lobby", game: null, scores: { ...FRESH_SCORES }, round: 0, notice: "" };
    viewRef.current = initial;
    try {
      const { code: newCode, peer } = await openRoom({
        channelName: ROOM_CHANNEL,
        onConnection: handleGuestConnection,
        onStatus: (state) => {
          if (attemptRef.current === attempt) setSignal(state);
        },
        onError: () => {
          if (attemptRef.current === attempt) resetToMenu("The connection to the online server was lost. Create a new room to keep playing.");
        },
      });
      if (attemptRef.current !== attempt) {
        peer.destroy();
        return;
      }
      net.peer = peer;
      net.code = newCode;
      setRole("host");
      setCode(newCode);
      setMyId(0);
      setView(viewRef.current);
    } catch (failure) {
      if (attemptRef.current !== attempt) return;
      viewRef.current = null;
      setError(failure.message);
    }
    setBusy(false);
  };

  const joinExistingRoom = async (roomCode = joinCode) => {
    const attempt = attemptRef.current + 1;
    attemptRef.current = attempt;
    setBusy(true);
    setError("");
    setStatus("Contacting the online server…");
    try {
      const { peer, connection } = await joinRoom(roomCode, {
        channelName: ROOM_CHANNEL,
        onStatus: (message) => {
          if (attemptRef.current === attempt) setStatus(message);
        },
      });
      if (attemptRef.current !== attempt) {
        connection.close();
        peer.destroy();
        return;
      }
      net.peer = peer;
      net.hostConn = connection;
      net.lastSeen = Date.now();
      let welcomed = false;
      connection.on("data", (message) => {
        if (!message || typeof message !== "object") return;
        net.lastSeen = Date.now();
        if (message.t === "welcome") {
          welcomed = true;
          setMyId(message.id);
          setCode(message.code);
          setRole("guest");
        } else if (message.t === "sync" && message.view && Array.isArray(message.view.players)) {
          viewRef.current = message.view;
          setView(message.view);
        } else if (message.t === "rejected") {
          resetToMenu(message.reason);
        }
      });
      connection.on("close", () => {
        if (attemptRef.current === attempt) resetToMenu("The host closed the room.");
      });
      safeSend(connection, { t: "hello", name: cleanName(name) });
      // A stale room (host gone but still listed) never answers, so don't leave the guest waiting forever.
      window.setTimeout(() => {
        if (attemptRef.current === attempt && !welcomed) resetToMenu("The host didn't respond. Ask them for a fresh invite link.");
      }, WELCOME_TIMEOUT_MS);
    } catch (failure) {
      if (attemptRef.current !== attempt) return;
      setError(failure.message);
    }
    setBusy(false);
  };

  // Opening an invite link joins straight away, with no code to type.
  useEffect(() => {
    if (invite?.code) joinExistingRoom(invite.code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invite?.code, invite?.nonce]);

  const host = role === "host";
  const move = (value) => {
    if (host) applyMove(0, value);
    else safeSend(net.hostConn, { t: "move", move: value });
  };
  const toLobby = () => {
    if (host) returnToLobby(0);
    else safeSend(net.hostConn, { t: "lobby" });
  };
  const rematch = () => {
    if (host) startGame();
    else safeSend(net.hostConn, { t: "rematch" });
  };
  const changeKind = (next) => {
    if (!host || !isBoardKind(next) || viewRef.current.kind === next) return;
    publish({ kind: next, scores: { ...FRESH_SCORES } });
    onKindChange?.(next);
  };

  if (!role) {
    return <OnlineMenu kind={kind} name={name} setName={setName} joinCode={joinCode} setJoinCode={setJoinCode} busy={busy} status={status} inviteCode={invite?.code} error={error} configured={isOnlineConfigured()} onHost={hostRoom} onJoin={() => joinExistingRoom()} onBack={onExit} />;
  }
  if (!view) return <p role="status" className="font-mono text-xs text-zinc-500">joining room…</p>;
  if (view.phase === "playing" && view.game) {
    return <OnlineMatch view={view} myId={myId} code={code} onMove={move} onRematch={rematch} onLobby={toLobby} onLeave={() => resetToMenu("")} />;
  }
  return <Lobby role={role} code={code} view={view} myId={myId} signal={signal} onKind={changeKind} onStart={() => startGame()} onLeave={() => resetToMenu("")} />;
}
