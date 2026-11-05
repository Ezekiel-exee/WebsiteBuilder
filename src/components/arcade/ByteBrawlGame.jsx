import { useEffect, useRef, useState } from "react";
import { ARENA_H, ARENA_W, CAMPAIGN, STEP, brawlHud, brawlResult, createBrawl, drawBrawl, enemyTypes, stepBrawl } from "./byteBrawlEngine";
import ByteBrawlSetup, { DropsGuide, saveCampaignProgress } from "./ByteBrawlSetup";
import ByteBrawlOnline from "./ByteBrawlOnline";
import { ByteControlButton, GameFrame, useAutomaticLevelAdvance } from "./GameFrame";

const NO_LEVEL_ADVANCE = () => {};

function ByteBrawlMatch({ setup, difficulty, level, onMenu, onLevelAdvance }) {
  const campaign = setup.mode === "campaign";
  const finalMission = campaign && level >= CAMPAIGN.length;
  const canvasRef = useRef(null);
  const keysRef = useRef(new Set());
  const jumpQueuedRef = useRef(false);
  const worldRef = useRef(null);
  if (!worldRef.current) worldRef.current = createBrawl(level, difficulty, setup);
  const [status, setStatus] = useState("ready");
  const [hud, setHud] = useState(() => brawlHud(worldRef.current));
  useAutomaticLevelAdvance(status, finalMission ? NO_LEVEL_ADVANCE : onLevelAdvance);
  useEffect(() => {
    if (campaign && status === "won") saveCampaignProgress(level + 1);
  }, [campaign, level, status]);

  const reset = () => {
    worldRef.current = createBrawl(level, difficulty, setup);
    keysRef.current.clear();
    jumpQueuedRef.current = false;
    setHud(brawlHud(worldRef.current));
    setStatus("ready");
  };
  const begin = () => setStatus((current) => (current === "ready" ? "running" : current));
  const queueJump = () => {
    jumpQueuedRef.current = true;
  };
  const controlKeys = ["a", "d", "w", "s", "j", "k", "z", "enter", " ", "arrowleft", "arrowright", "arrowup", "arrowdown"];
  const onKeyDown = (event) => {
    const key = event.key.toLowerCase();
    if ([" ", "arrowleft", "arrowright", "arrowup", "arrowdown"].includes(key)) event.preventDefault();
    if (key === "p" && !event.repeat) {
      setStatus((current) => (current === "running" ? "paused" : current === "paused" ? "running" : current));
      return;
    }
    if (status === "won" || status === "lost" || !controlKeys.includes(key)) return;
    keysRef.current.add(key);
    begin();
    if (!event.repeat && ["w", " ", "arrowup"].includes(key)) queueJump();
  };
  const onKeyUp = (event) => keysRef.current.delete(event.key.toLowerCase());
  const holdKey = (key) => {
    if (status === "won" || status === "lost") return;
    keysRef.current.add(key);
    begin();
    if (key === "w") queueJump();
  };
  const releaseKey = (key) => keysRef.current.delete(key);

  useEffect(() => {
    const clearKeys = () => keysRef.current.clear();
    window.addEventListener("blur", clearKeys);
    return () => window.removeEventListener("blur", clearKeys);
  }, []);

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return undefined;
    const world = worldRef.current;
    if (status !== "running") {
      drawBrawl(context, world, status === "ready" ? "ready" : status === "paused" ? "paused" : null);
      return undefined;
    }
    let animationFrame;
    let previousTime = 0;
    let accumulator = 0;
    let frameCount = 0;
    let lastHud = "";
    const frame = (time) => {
      accumulator += previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
      previousTime = time;
      const keys = keysRef.current;
      while (accumulator >= STEP) {
        stepBrawl(world, STEP, {
          0: {
            dir: Number(keys.has("d") || keys.has("arrowright")) - Number(keys.has("a") || keys.has("arrowleft")),
            jump: jumpQueuedRef.current,
            down: keys.has("s") || keys.has("arrowdown"),
            fire: keys.has("j") || keys.has("k") || keys.has("z") || keys.has("enter"),
          },
        });
        jumpQueuedRef.current = false;
        accumulator -= STEP;
      }
      drawBrawl(context, world, null);
      frameCount += 1;
      const snapshot = brawlHud(world);
      const serialized = JSON.stringify(snapshot);
      if (frameCount % 6 === 0 && serialized !== lastHud) {
        lastHud = serialized;
        setHud(snapshot);
      }
      const result = brawlResult(world);
      if (result !== "running") {
        setHud(snapshot);
        setStatus(result);
        return;
      }
      animationFrame = window.requestAnimationFrame(frame);
    };
    animationFrame = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [status]);

  return (
    <GameFrame
      title="Byte Brawl"
      description={campaign ? `Mission ${level}/${CAMPAIGN.length} — ${worldRef.current.mission.title}: ${worldRef.current.mission.brief}` : `Versus on ${worldRef.current.map.name}. Damage makes hits fly farther — knock every bot off the screen.`}
      status={status}
      metrics={[campaign ? { label: "MISSION", value: `${level}/${CAMPAIGN.length}` } : { label: "ROUND", value: level }, { label: "STOCKS", value: hud.stocks }, { label: "DAMAGE", value: `${hud.damage}%` }, { label: "BOT STOCKS", value: hud.foes }, { label: "K.O.s", value: hud.knockouts }, { label: "SCORE", value: hud.score }]}
      onBack={onMenu}
      backLabel="< menu"
      onRestart={reset}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      controls="A/D or ←/→ move. W, ↑, or Space jumps (twice in the air). S or ↓ drops through a platform. Hold J, K, Z, or Enter to fire. P pauses. Hits add damage, and more damage means more knockback — lose a stock when you leave the screen. Pick up gun crates (square) and power-ups (diamond)."
    >
      <div className="mx-auto max-w-[800px]">
        <canvas
          ref={canvasRef}
          width={ARENA_W}
          height={ARENA_H}
          aria-label="Byte Brawl platform arena. Use A and D to move, W to jump, S to drop, and J to fire."
          className="block h-auto w-full border border-white/10"
        >
          Byte Brawl platform arena
        </canvas>
        <ul className="mt-3 flex flex-wrap gap-2 font-mono text-[11px]" aria-label="Enemy types in this match">
          {enemyTypes(worldRef.current).map((type) => (
            <li key={type.name} className="rounded border bg-white/[0.02] px-2 py-1" style={{ borderColor: `${type.color}66`, color: type.color }}>
              ◆ {type.name} <span className="text-zinc-500">— {type.blurb}</span>
            </li>
          ))}
        </ul>
        <DropsGuide />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 sm:hidden" aria-label="Movement controls">
            <ByteControlButton label="◀" onPress={() => holdKey("a")} onRelease={() => releaseKey("a")} />
            <ByteControlButton label="▶" onPress={() => holdKey("d")} onRelease={() => releaseKey("d")} />
            <ByteControlButton label="▼" onPress={() => holdKey("s")} onRelease={() => releaseKey("s")} />
          </div>
          <div className="flex gap-2 sm:hidden">
            <ByteControlButton label="JUMP" onPress={() => holdKey("w")} onRelease={() => releaseKey("w")} />
            <ByteControlButton label="FIRE" onPress={() => holdKey("j")} onRelease={() => releaseKey("j")} />
          </div>
          {status === "won" && !finalMission && <p role="status" className="w-full font-mono text-xs text-emerald-300">{campaign ? `mission complete — loading mission ${level + 1}…` : `round won — loading round ${level + 1}${level % 3 === 0 ? " · new enemy type incoming" : ""}…`}</p>}
          {status === "won" && finalMission && (
            <div role="status" className="w-full rounded-xl border border-orange-300/30 bg-orange-300/5 p-4 text-center">
              <p className="font-mono text-xs font-semibold tracking-[0.2em] text-orange-300">CAMPAIGN COMPLETE</p>
              <p className="mt-1 text-sm text-zinc-300">Root Access is down. Every mission is cleared.</p>
              <button type="button" onClick={onMenu} className="mt-3 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 font-mono text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/20">
                $ back to menu
              </button>
            </div>
          )}
        </div>
      </div>
    </GameFrame>
  );
}

export default function ByteBrawl({ setup, onSetup, onMenu, difficulty, onBack, level, onLevelAdvance }) {
  if (!setup) return <ByteBrawlSetup onStart={onSetup} onBack={onBack} />;
  if (setup.mode === "online") return <ByteBrawlOnline ui={{ GameFrame, ByteControlButton }} difficulty={difficulty} onExit={onMenu} invite={setup.invite} />;
  return <ByteBrawlMatch setup={setup} difficulty={difficulty} level={level} onMenu={onMenu} onLevelAdvance={onLevelAdvance} />;
}
