import { useCallback, useEffect, useRef, useState } from "react";
import { ENEMY_TYPES, MAPS, STEP, advanceView, applySnapshot, ARENA_H, ARENA_W, brawlHud, createBrawl, createViewWorld, describeFighters, drawBrawl, matchOutcome, snapshotBrawl, stepBrawl } from "./byteBrawlEngine";
import { MAX_PLAYERS, broadcast as sendToGuests, extractCode, inviteLink, isOnlineConfigured, joinRoom, openRoom, safeSend } from "./byteBrawlNet";
import { StagePreview, DropsGuide } from "./ByteBrawlSetup";
import { brawlTouch } from "./TouchControls";
import { copyToClipboard } from "../../utils/clipboard";

const DEFAULT_SETTINGS = { teamMode: "coop", stage: 0, opponents: 2, round: 1 };
const ROUND_CHOICES = ENEMY_TYPES.map((_, index) => index * 3 + 1);
const CONTROL_KEYS = ["a", "d", "w", "s", "j", "k", "z", "enter", " ", "arrowleft", "arrowright", "arrowup", "arrowdown"];
const PLAYER_SWATCHES = ["#a3e635", "#f1f5f9", "#818cf8"];
const NAME_STORAGE_KEY = "blocksmith-bytebrawl-name";
const PING_INTERVAL_MS = 3000;
const SILENCE_TIMEOUT_MS = 15000;
const WELCOME_TIMEOUT_MS = 8000;

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

function OnlineHeader({ title, subtitle, onBack, backLabel = "< back" }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="mb-2 flex items-center gap-2 font-mono text-xs text-zinc-500">
          <span className="text-emerald-400">~/arcade</span><span>/</span><span>byte-brawl</span><span>/</span><span>online</span>
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

function OnlineMenu({ name, setName, joinCode, setJoinCode, busy, status, inviteCode, error, configured, onHost, onJoin, onBack }) {
  const joiningInvite = busy && inviteCode;
  return (
    <div>
      <OnlineHeader title="Play online" subtitle="Create a room and send your friend the invite link — they open it and join automatically. Up to 3 players." onBack={onBack} backLabel="< menu" />
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
          <p className="mt-2 text-sm leading-6 text-zinc-400">You get an invite link to send to friends. They open it and land straight in your lobby, where you choose allies or rivals and the stage.</p>
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
      {!configured && <p role="alert" className="mb-5 rounded-lg border border-amber-300/30 bg-amber-300/5 px-3 py-2 font-mono text-xs leading-5 text-amber-200">Online play isn't set up on this site yet. The site owner needs to add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see the README).</p>}
      {error && <p role="alert" className="mt-4 rounded-lg border border-rose-400/30 bg-rose-400/5 px-3 py-2 font-mono text-xs leading-5 text-rose-200">{error}</p>}
      <p className="mt-5 font-mono text-[11px] leading-5 text-zinc-500">// rooms run over a free realtime relay (Supabase) that only passes messages between players — the host's browser runs the match.</p>
    </div>
  );
}

function Lobby({ role, code, players, settings, difficulty, myId, signal, onChange, onStart, onLeave }) {
  const host = role === "host";
  const [copied, setCopied] = useState("");
  const link = inviteLink(code);
  const rivals = settings.teamMode === "rivals";
  const canStart = host && (rivals ? players.length >= 2 : players.length >= 1);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const copy = async (kind, text) => {
    if (await copyToClipboard(text)) {
      setCopied(kind);
      window.setTimeout(() => setCopied(""), 1800);
    }
  };
  const share = () => navigator.share({ title: "Byte Brawl", text: "Join my Byte Brawl room!", url: link }).catch(() => {});
  return (
    <div>
      <OnlineHeader title={host ? "Your room" : "Room lobby"} subtitle={host ? "Send the invite link to your friends. Start when everyone is in." : "Connected! Waiting for the host to start the match."} onBack={onLeave} backLabel="< leave" />
      {host && signal === "reconnecting" && (
        <p role="status" className="mb-4 rounded-lg border border-amber-300/30 bg-amber-300/5 px-3 py-2 font-mono text-xs text-amber-200">reconnecting to the online server… players already inside keep their place, but gameplay pauses and new players can't join until it's back.</p>
      )}
      <div className="mb-5 grid gap-4 rounded-xl border border-white/10 bg-[#0b0d12] p-4 md:grid-cols-[auto_1fr]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Room code</p>
          <p className="font-mono text-3xl font-bold tracking-[0.35em] text-cyan-200" aria-label={`Room code ${code.split("").join(" ")}`}>{code}</p>
          <p className="mt-1 font-mono text-xs text-zinc-500">DIFFICULTY <span className="text-zinc-200">{difficulty.toUpperCase()}</span></p>
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
              {canShare && (
                <button type="button" onClick={share} className="rounded-lg border border-white/10 px-3 py-2 font-mono text-xs text-zinc-300 transition hover:bg-white/5">
                  $ share…
                </button>
              )}
              <button type="button" onClick={() => copy("code", code)} className="rounded-lg border border-white/10 px-3 py-2 font-mono text-xs text-zinc-300 transition hover:bg-white/5">
                {copied === "code" ? "code copied!" : "$ copy code"}
              </button>
            </div>
          </div>
        )}
      </div>

      <section aria-label="Players" className="mb-5 grid gap-2 sm:grid-cols-3">
        {Array.from({ length: MAX_PLAYERS }, (_, slot) => {
          const player = players[slot];
          return (
            <div key={slot} className={`rounded-lg border px-3 py-3 font-mono text-xs ${player ? "border-white/15 bg-white/[0.03]" : "border-dashed border-white/10 text-zinc-600"}`}>
              {player ? (
                <span className="flex items-center gap-2 text-zinc-100">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PLAYER_SWATCHES[slot] }} aria-hidden="true" />
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

      <section aria-label="Match settings" className="mb-5">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Mode</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { id: "coop", title: "$ allies", text: "Team up against bots. Win when every bot is knocked out." },
            { id: "rivals", title: "$ rivals", text: "Fight each other. Last player standing wins." },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={!host}
              aria-pressed={settings.teamMode === option.id}
              onClick={() => onChange({ teamMode: option.id })}
              className={`rounded-xl border p-4 text-left font-mono transition disabled:cursor-default ${settings.teamMode === option.id ? "border-cyan-300/50 bg-cyan-300/10" : "border-white/10 bg-[#0b0d12] enabled:hover:border-white/20"}`}
            >
              <span className={`block text-sm font-semibold ${settings.teamMode === option.id ? "text-cyan-200" : "text-zinc-200"}`}>{option.title}</span>
              <span className="mt-1 block text-xs text-zinc-500">{option.text}</span>
            </button>
          ))}
        </div>

        {!rivals && (
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs text-zinc-400">
            <div className="flex items-center gap-2" role="group" aria-label="Number of bots">
              <span className="text-zinc-500">BOTS</span>
              {[1, 2, 3].map((count) => (
                <button key={count} type="button" disabled={!host} aria-pressed={settings.opponents === count} onClick={() => onChange({ opponents: count })} className={`h-8 w-8 rounded-lg border transition ${settings.opponents === count ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-100" : "border-white/10 enabled:hover:bg-white/5"}`}>
                  {count}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2">
              <span className="text-zinc-500">ENEMY TYPE</span>
              <select disabled={!host} value={settings.round} onChange={(event) => onChange({ round: Number(event.target.value) })} className="h-8 rounded-lg border border-white/10 bg-[#0b0d12] px-2 text-xs text-zinc-200 outline-none focus:border-cyan-400/40">
                {ROUND_CHOICES.map((round, index) => (
                  <option key={round} value={round}>{ENEMY_TYPES[index].name}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        <p className="mb-2 mt-5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Stage</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {MAPS.map((map, index) => (
            <button
              key={map.name}
              type="button"
              disabled={!host}
              aria-pressed={settings.stage === index}
              onClick={() => onChange({ stage: index })}
              className={`rounded-xl border p-3 text-left transition disabled:cursor-default ${settings.stage === index ? "border-lime-300/60 bg-lime-300/5" : "border-white/10 bg-[#0b0d12] enabled:hover:border-cyan-400/30"}`}
            >
              <StagePreview map={map} active={settings.stage === index} />
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">{map.name}</p>
              <p className={`mt-1 font-mono text-sm font-semibold ${settings.stage === index ? "text-lime-200" : "text-zinc-100"}`}>{map.title}</p>
            </button>
          ))}
        </div>
      </section>

      {host ? (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={!canStart} onClick={onStart} className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-5 py-2.5 font-mono text-sm font-semibold text-cyan-100 transition enabled:hover:bg-cyan-300/20 disabled:opacity-50">
            $ start match
          </button>
          {rivals && players.length < 2 && <p className="font-mono text-xs text-amber-300">Rivals needs at least 2 players.</p>}
        </div>
      ) : (
        <p className="font-mono text-xs text-zinc-500">// only the host can change settings and start the match</p>
      )}
    </div>
  );
}

function OnlineMatch({ ui, role, scene, myId, code, net, handlerRef, onRematch, onLobby, onLeave }) {
  const { GameFrame } = ui;
  const canvasRef = useRef(null);
  const keysRef = useRef(new Set());
  const jumpSeqRef = useRef(0);
  const sentRef = useRef("");
  const inputsRef = useRef(new Map());
  const [status, setStatus] = useState("running");
  const [banner, setBanner] = useState("");
  const rosterOf = useCallback((world) => world.fighters.filter((fighter) => fighter.human).map((fighter) => ({ id: fighter.id, name: fighter.name, color: fighter.color, stocks: fighter.stocks, points: fighter.points })), []);
  const [hud, setHud] = useState(() => ({ ...brawlHud(scene, myId), roster: rosterOf(scene) }));
  const host = role === "host";

  const finish = useCallback(
    (outcome) => {
      const rivals = scene.rivals;
      const won = rivals ? outcome.winnerId === myId : Boolean(outcome.won);
      const winner = rivals ? scene.fighters.find((fighter) => fighter.id === outcome.winnerId) : null;
      setBanner(rivals ? (winner ? `${winner.name} wins the match.` : "Everyone was knocked out — draw.") : outcome.won ? "Allies win — every bot was knocked out." : "All players are out — the bots win.");
      setStatus(won ? "won" : "lost");
    },
    [myId, scene],
  );

  const pushInput = useCallback(() => {
    const keys = keysRef.current;
    const dir = Number(keys.has("d") || keys.has("arrowright")) - Number(keys.has("a") || keys.has("arrowleft"));
    const down = keys.has("s") || keys.has("arrowdown");
    const fire = keys.has("j") || keys.has("k") || keys.has("z") || keys.has("enter");
    if (host) {
      const entry = inputsRef.current.get(0) || { dir: 0, down: false, fire: false, jumpSeq: 0, jumpSeen: 0 };
      Object.assign(entry, { dir, down, fire, jumpSeq: jumpSeqRef.current });
      inputsRef.current.set(0, entry);
      return;
    }
    const signature = `${dir}|${down}|${fire}|${jumpSeqRef.current}`;
    if (signature !== sentRef.current) {
      sentRef.current = signature;
      safeSend(net.hostConn, { t: "input", dir, down, fire, jumpSeq: jumpSeqRef.current });
    }
  }, [host, net]);

  useEffect(() => {
    handlerRef.current = (fromId, message) => {
      if (host) {
        if (message.t === "input") {
          const entry = inputsRef.current.get(fromId) || { dir: 0, down: false, fire: false, jumpSeq: 0, jumpSeen: 0 };
          entry.dir = Math.max(-1, Math.min(1, Math.round(Number(message.dir) || 0)));
          entry.down = Boolean(message.down);
          entry.fire = Boolean(message.fire);
          entry.jumpSeq = Number(message.jumpSeq) || 0;
          inputsRef.current.set(fromId, entry);
        } else if (message.t === "left") {
          inputsRef.current.delete(fromId);
          const fighter = scene.fighters.find((candidate) => candidate.id === fromId);
          if (fighter) fighter.stocks = 0;
        }
      } else if (message.t === "snap") {
        applySnapshot(scene, message.s, performance.now());
      } else if (message.t === "end") {
        finish(message.outcome);
      }
    };
    return () => {
      handlerRef.current = null;
    };
  }, [finish, handlerRef, host, scene]);

  useEffect(() => {
    const clear = () => {
      keysRef.current.clear();
      pushInput();
    };
    window.addEventListener("blur", clear);
    return () => window.removeEventListener("blur", clear);
  }, [pushInput]);

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return undefined;
    if (status !== "running") {
      drawBrawl(context, scene, null);
      setHud({ ...brawlHud(scene, myId), roster: rosterOf(scene) });
      return undefined;
    }
    let animationFrame;
    let previousTime = 0;
    let accumulator = 0;
    let sinceSnapshot = 0;
    let frameCount = 0;
    let lastHud = "";
    const broadcast = (message, droppable) => sendToGuests(net.conns.values(), message, { droppable });
    const frame = (time) => {
      const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
      previousTime = time;
      if (host) {
        if (scene.countdown > 0) {
          scene.countdown = Math.max(0, scene.countdown - delta);
        } else {
          accumulator += delta;
          while (accumulator >= STEP) {
            const controls = {};
            for (const [id, input] of inputsRef.current) controls[id] = { dir: input.dir, down: input.down, fire: input.fire, jump: input.jumpSeq !== input.jumpSeen };
            stepBrawl(scene, STEP, controls);
            for (const input of inputsRef.current.values()) input.jumpSeen = input.jumpSeq;
            accumulator -= STEP;
          }
        }
        sinceSnapshot += delta;
        const outcome = scene.countdown > 0 ? null : matchOutcome(scene);
        // 20 snapshots a second keeps motion smooth while staying inside the free Realtime message quota.
        if (sinceSnapshot >= 1 / 20 || outcome) {
          sinceSnapshot = 0;
          broadcast({ t: "snap", s: snapshotBrawl(scene) }, !outcome);
        }
        if (outcome) {
          broadcast({ t: "end", outcome });
          drawBrawl(context, scene, null);
          finish(outcome);
          return;
        }
      } else {
        advanceView(scene, delta);
      }
      drawBrawl(context, scene, scene.countdown > 0 ? "countdown" : null);
      frameCount += 1;
      if (frameCount % 6 === 0) {
        const snapshot = { ...brawlHud(scene, myId), roster: rosterOf(scene) };
        const serialized = JSON.stringify(snapshot);
        if (serialized !== lastHud) {
          lastHud = serialized;
          setHud(snapshot);
        }
      }
      animationFrame = window.requestAnimationFrame(frame);
    };
    animationFrame = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [finish, host, myId, net, rosterOf, scene, status]);

  const onKeyDown = (event) => {
    const key = event.key.toLowerCase();
    if ([" ", "arrowleft", "arrowright", "arrowup", "arrowdown"].includes(key)) event.preventDefault();
    if (status !== "running" || !CONTROL_KEYS.includes(key)) return;
    keysRef.current.add(key);
    if (!event.repeat && ["w", " ", "arrowup"].includes(key)) jumpSeqRef.current += 1;
    pushInput();
  };
  const onKeyUp = (event) => {
    keysRef.current.delete(event.key.toLowerCase());
    pushInput();
  };
  const holdKey = (key) => {
    if (status !== "running") return;
    keysRef.current.add(key);
    if (key === "w") jumpSeqRef.current += 1;
    pushInput();
  };
  const releaseKey = (key) => {
    keysRef.current.delete(key);
    pushInput();
  };

  const rivals = scene.rivals;
  const out = hud.stocks <= 0 && status === "running";
  return (
    <GameFrame
      title="Byte Brawl Online"
      description={`Room ${code} · ${rivals ? "Rivals: last player standing wins." : "Allies: knock out every bot together."}`}
      status={status}
      metrics={[{ label: "ROOM", value: code }, { label: "STOCKS", value: hud.stocks }, { label: "DAMAGE", value: `${hud.damage}%` }, { label: rivals ? "RIVAL STOCKS" : "BOT STOCKS", value: hud.foes }, { label: "K.O.s", value: hud.knockouts }, { label: "SCORE", value: hud.score }]}
      onBack={onLobby}
      backLabel="< lobby"
      extraActions={
        <button type="button" onClick={onLeave} className="rounded-lg border border-white/10 px-3 py-2 font-mono text-xs text-zinc-300 transition hover:border-white/20 hover:bg-white/5">
          leave room
        </button>
      }
      onRestart={onRematch}
      canRestart={host}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      touch={brawlTouch(holdKey, releaseKey)}
      controls="A/D or ←/→ move. W, ↑, or Space jumps (twice in the air). S or ↓ drops through a platform. Hold J, K, Z, or Enter to fire. Hits add damage; more damage means more knockback. Pick up crates for better weapons."
    >
      <div className="mx-auto max-w-[800px]">
        <canvas ref={canvasRef} width={ARENA_W} height={ARENA_H} aria-label="Byte Brawl online arena. Use A and D to move, W to jump, S to drop, and J to fire." className="block h-auto w-full border border-white/10">
          Byte Brawl online arena
        </canvas>
        <ul className="mt-3 flex flex-wrap gap-2 font-mono text-[11px]" aria-label="Players">
          {hud.roster.map((player) => (
            <li key={player.id} className="rounded border bg-white/[0.02] px-2 py-1" style={{ borderColor: `${player.color}66`, color: player.color }}>
              {player.name}{player.id === myId ? " (you)" : ""} <span className="text-zinc-500">· {player.stocks > 0 ? `${player.stocks} stocks` : "out"} · {player.points} pts</span>
            </li>
          ))}
        </ul>
        <DropsGuide />
        {out &&  <p role="status" className="mt-3 font-mono text-xs text-amber-300">you are out — spectating until the match ends…</p>}
        {status !== "running" && (
          <div role="status" className="mt-3 rounded-xl border border-white/10 bg-[#0b0d12] p-4 text-center">
            <p className={`font-mono text-sm font-semibold ${status === "won" ? "text-emerald-300" : "text-rose-300"}`}>{banner}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {host ? (
                <>
                  <button type="button" onClick={onRematch} className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 font-mono text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/20">$ rematch</button>
                  <button type="button" onClick={onLobby} className="rounded-lg border border-white/10 px-4 py-2 font-mono text-xs text-zinc-300 transition hover:bg-white/5">$ back to lobby</button>
                </>
              ) : (
                <>
                  <p className="w-full font-mono text-xs text-zinc-500">waiting for the host to start a rematch…</p>
                  <button type="button" onClick={onLobby} className="rounded-lg border border-white/10 px-4 py-2 font-mono text-xs text-zinc-300 transition hover:bg-white/5">$ back to lobby</button>
                  <button type="button" onClick={onLeave} className="rounded-lg border border-white/10 px-4 py-2 font-mono text-xs text-zinc-300 transition hover:bg-white/5">leave room</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </GameFrame>
  );
}

export default function ByteBrawlOnline({ ui, difficulty, onExit, invite }) {
  const [phase, setPhase] = useState("menu");
  const [name, setName] = useState(readSavedName);
  const [joinCode, setJoinCode] = useState(invite?.code || "");
  const [busy, setBusy] = useState(Boolean(invite?.code));
  const [status, setStatus] = useState("");
  const [signal, setSignal] = useState("online");
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);
  const [code, setCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [roomDifficulty, setRoomDifficulty] = useState(difficulty);
  const [myId, setMyId] = useState(0);
  const [match, setMatch] = useState(null);
  const net = useRef({ peer: null, conns: new Map(), hostConn: null, lastSeen: 0 }).current;
  const room = useRef({ players: [], settings: DEFAULT_SETTINGS, difficulty, phase: "menu" }).current;
  const handlerRef = useRef(null);
  const lobbyRef = useRef(null);
  // Bumped whenever a host/join attempt starts or is torn down, so a slow attempt that finishes late can tell it is stale.
  const attemptRef = useRef(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(NAME_STORAGE_KEY, name);
    } catch {
      // Storage can be unavailable (private mode); the name just isn't remembered.
    }
  }, [name]);

  const commit = useCallback((patch) => {
    Object.assign(room, patch);
    if ("players" in patch) setPlayers(patch.players);
    if ("settings" in patch) setSettings(patch.settings);
    if ("difficulty" in patch) setRoomDifficulty(patch.difficulty);
    if ("phase" in patch) setPhase(patch.phase);
  }, [room]);

  const sendAll = useCallback((message) => {
    sendToGuests(net.conns.values(), message);
  }, [net]);

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
      handlerRef.current = null;
      commit({ players: [], settings: DEFAULT_SETTINGS, phase: "menu" });
      setMatch(null);
      setRole(null);
      setCode("");
      setBusy(false);
      setSignal("online");
      setError(message);
    },
    [commit, teardown],
  );

  const removePlayer = useCallback(
    (id) => {
      if (id === undefined) return;
      net.conns.delete(id);
      const remaining = room.players.filter((player) => player.id !== id);
      if (remaining.length === room.players.length) return;
      commit({ players: remaining });
      if (room.phase === "lobby") sendAll({ t: "lobby", players: remaining, settings: room.settings, difficulty: room.difficulty });
      handlerRef.current?.(id, { t: "left" });
    },
    [commit, net, room, sendAll],
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

  const handleGuestConnection = useCallback(
    (connection) => {
      connection.lastSeen = Date.now();
      const reject = (reason) => {
        const send = () => {
          safeSend(connection, { t: "rejected", reason });
          window.setTimeout(() => connection.close(), 300);
        };
        if (connection.open) send();
        else connection.on("open", send);
      };
      connection.on("data", (message) => {
        if (!message || typeof message !== "object") return;
        connection.lastSeen = Date.now();
        if (message.t === "hello") {
          if (connection.playerId !== undefined) return;
          if (room.phase !== "lobby") return reject("That match has already started.");
          const used = new Set(room.players.map((player) => player.id));
          const id = [1, 2].find((candidate) => !used.has(candidate));
          if (id === undefined) return reject("That room is full.");
          let guestName = cleanName(String(message.name || "PLAYER"));
          if (room.players.some((player) => player.name === guestName)) guestName = `${guestName.slice(0, 8)}_${id}`;
          connection.playerId = id;
          net.conns.set(id, connection);
          commit({ players: [...room.players, { id, name: guestName }] });
          safeSend(connection, { t: "welcome", id, code: net.code });
          sendAll({ t: "lobby", players: room.players, settings: room.settings, difficulty: room.difficulty });
        } else if (message.t === "input" && connection.playerId !== undefined) {
          handlerRef.current?.(connection.playerId, message);
        } else if (message.t === "lobby" && connection.playerId !== undefined && room.phase === "playing") {
          lobbyRef.current?.();
        }
      });
      connection.on("close", () => removePlayer(connection.playerId));
      connection.on("error", () => removePlayer(connection.playerId));
    },
    [commit, net, removePlayer, room, sendAll],
  );

  const hostRoom = async () => {
    const attempt = attemptRef.current + 1;
    attemptRef.current = attempt;
    setBusy(true);
    setError("");
    setStatus("Contacting the online server…");
    try {
      const { code: newCode, peer } = await openRoom({
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
      commit({ players: [{ id: 0, name: cleanName(name) }], settings: DEFAULT_SETTINGS, difficulty, phase: "lobby" });
    } catch (failure) {
      if (attemptRef.current !== attempt) return;
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
          commit({ phase: "lobby" });
        } else if (message.t === "lobby") {
          commit({ players: message.players, settings: message.settings, difficulty: message.difficulty });
        } else if (message.t === "rejected") {
          resetToMenu(message.reason);
        } else if (message.t === "start") {
          const view = createViewWorld(message);
          setMatch({ scene: view, key: Date.now() });
          commit({ phase: "playing" });
        } else if (message.t === "toLobby") {
          setMatch(null);
          commit({ phase: "lobby" });
        } else if (message.t === "snap" || message.t === "end") {
          handlerRef.current?.(0, message);
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

  const changeSettings = (patch) => {
    const next = { ...room.settings, ...patch };
    commit({ settings: next });
    sendAll({ t: "lobby", players: room.players, settings: next, difficulty: room.difficulty });
  };

  const startMatch = () => {
    const world = createBrawl(room.settings.round, room.difficulty, { mode: "online", teamMode: room.settings.teamMode, stage: room.settings.stage, opponents: room.settings.opponents, players: room.players });
    world.countdown = 3;
    const fighters = describeFighters(world);
    for (const [id, connection] of net.conns) {
      safeSend(connection, { t: "start", me: id, stage: room.settings.stage, level: room.settings.round, teamMode: room.settings.teamMode, fighters });
    }
    setMatch({ scene: world, key: Date.now() });
    commit({ phase: "playing" });
  };

  const backToLobby = () => {
    setMatch(null);
    commit({ phase: "lobby" });
    sendAll({ t: "toLobby" });
    sendAll({ t: "lobby", players: room.players, settings: room.settings, difficulty: room.difficulty });
  };
  lobbyRef.current = backToLobby;
  const requestLobby = () => {
    safeSend(net.hostConn, { t: "lobby" });
  };

  if (phase === "menu") {
    return <OnlineMenu name={name} setName={setName} joinCode={joinCode} setJoinCode={setJoinCode} busy={busy} status={status} inviteCode={invite?.code} error={error} configured={isOnlineConfigured()} onHost={hostRoom} onJoin={() => joinExistingRoom()} onBack={onExit} />;
  }
  if (phase === "lobby") {
    return <Lobby role={role} code={code} players={players} settings={settings} difficulty={roomDifficulty} myId={myId} signal={signal} onChange={changeSettings} onStart={startMatch} onLeave={() => resetToMenu("")} />;
  }
  return match ? (
    <OnlineMatch key={match.key} ui={ui} role={role} scene={match.scene} myId={myId} code={code} net={net} handlerRef={handlerRef} onRematch={startMatch} onLobby={role === "host" ? backToLobby : requestLobby} onLeave={() => resetToMenu("")} />
  ) : null;
}
