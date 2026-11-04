import { useEffect, useRef, useState } from "react";
import { ByteControlButton, GameFrame, useAutomaticLevelAdvance } from "../GameFrame";
import { prepareCanvas, useGameLoop } from "../arcadeKit";
import { CANVAS_H, CANVAS_W, ENEMY_TYPES, POWERUPS, POWERUP_ORDER, bomberHud, carryFromWorld, cloneCarry, createBomberman, freshCarry, stageLabel, stepBomberman } from "./bombermanEngine";
import { drawBomberman } from "./bombermanRender";

const HI_KEY = "arcade-bomberman-hi";
const NO_ADVANCE = () => {};
const NO_RELEASE = () => {};
const DIR_BY_KEY = {
  w: [0, -1],
  arrowup: [0, -1],
  s: [0, 1],
  arrowdown: [0, 1],
  a: [-1, 0],
  arrowleft: [-1, 0],
  d: [1, 0],
  arrowright: [1, 0],
  "touch-up": [0, -1],
  "touch-down": [0, 1],
  "touch-left": [-1, 0],
  "touch-right": [1, 0],
};

// Score, lives and permanent power-ups survive the page remounting the game for the next stage.
let runCarry = null;

function carryForStage(level, difficulty) {
  if (level > 1 && runCarry && runCarry.level === level && runCarry.difficulty === difficulty) return cloneCarry(runCarry.state);
  return freshCarry(difficulty);
}

function readHi() {
  try {
    return Number(window.localStorage.getItem(HI_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeHi(score) {
  try {
    if (score > readHi()) window.localStorage.setItem(HI_KEY, String(score));
  } catch {
    // storage unavailable: the high score just is not persisted
  }
}

function hudSignature(hud) {
  return `${hud.score}|${hud.lives}|${hud.time}|${hud.fire}|${hud.bombs}|${hud.speed}|${hud.foes}|${hud.detonator}|${hud.mystery}`;
}

export default function BombermanGame({ difficulty = "medium", level = 1, onBack, onLevelAdvance }) {
  const canvasRef = useRef(null);
  const startRef = useRef(null);
  const worldRef = useRef(null);
  const keysRef = useRef([]);
  const inputRef = useRef({ dx: 0, dy: 0, bomb: false, det: false });
  const hudClockRef = useRef(0);
  const hudSigRef = useRef("");
  const hiRef = useRef(0);
  if (!startRef.current) {
    startRef.current = carryForStage(level, difficulty);
    worldRef.current = createBomberman(level, difficulty, cloneCarry(startRef.current));
    hiRef.current = readHi();
  }
  const [status, setStatus] = useState("ready");
  const [version, setVersion] = useState(0);
  const [hud, setHud] = useState(() => bomberHud(worldRef.current));
  useAutomaticLevelAdvance(status, onLevelAdvance || NO_ADVANCE);

  const info = worldRef.current.info;

  const syncHud = () => {
    const current = worldRef.current;
    const snapshot = bomberHud(current);
    const signature = hudSignature(snapshot);
    if (current.score > hiRef.current) {
      hiRef.current = current.score;
      writeHi(hiRef.current);
    }
    if (signature !== hudSigRef.current) {
      hudSigRef.current = signature;
      setHud(snapshot);
    }
  };

  const reset = () => {
    worldRef.current = createBomberman(level, difficulty, cloneCarry(startRef.current));
    keysRef.current.length = 0;
    inputRef.current.bomb = false;
    inputRef.current.det = false;
    hudSigRef.current = "";
    hudClockRef.current = 0;
    setHud(bomberHud(worldRef.current));
    setStatus("ready");
    setVersion((current) => current + 1);
  };

  const begin = () => setStatus((current) => (current === "ready" ? "running" : current));
  const togglePause = () => setStatus((current) => (current === "running" ? "paused" : current === "paused" ? "running" : current));

  const pressKey = (key) => {
    if (!keysRef.current.includes(key)) keysRef.current.push(key);
  };
  const releaseKey = (key) => {
    const at = keysRef.current.indexOf(key);
    if (at >= 0) keysRef.current.splice(at, 1);
  };
  const queueBomb = () => {
    inputRef.current.bomb = true;
    begin();
  };
  const queueDetonate = () => {
    inputRef.current.det = true;
    begin();
  };

  const onKeyDown = (event) => {
    const key = event.key.toLowerCase();
    if (key === "p") {
      if (!event.repeat) togglePause();
      return;
    }
    if (status === "won" || status === "lost") return;
    if (DIR_BY_KEY[key]) {
      event.preventDefault();
      pressKey(key);
      begin();
      return;
    }
    if (event.target instanceof HTMLButtonElement) return;
    if (key === " " || key === "j") {
      event.preventDefault();
      if (!event.repeat) queueBomb();
    } else if (key === "k" || key === "enter") {
      event.preventDefault();
      if (!event.repeat) queueDetonate();
    }
  };
  const onKeyUp = (event) => releaseKey(event.key.toLowerCase());

  useEffect(() => {
    const pauseAndRelease = () => {
      keysRef.current.length = 0;
      setStatus((current) => (current === "running" ? "paused" : current));
    };
    const onVisibility = () => {
      if (document.hidden) pauseAndRelease();
    };
    window.addEventListener("blur", pauseAndRelease);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", pauseAndRelease);
      document.removeEventListener("visibilitychange", onVisibility);
      writeHi(Math.max(hiRef.current, worldRef.current.score));
    };
  }, []);

  const update = (dt) => {
    const current = worldRef.current;
    if (current.result !== "running") return;
    const input = inputRef.current;
    const keys = keysRef.current;
    const dir = keys.length ? DIR_BY_KEY[keys[keys.length - 1]] : null;
    input.dx = dir ? dir[0] : 0;
    input.dy = dir ? dir[1] : 0;
    stepBomberman(current, dt, input);
    input.bomb = false;
    input.det = false;
    if (current.result !== "running") {
      if (current.result === "won") runCarry = { level: level + 1, difficulty, state: carryFromWorld(current) };
      keysRef.current.length = 0;
      syncHud();
      writeHi(Math.max(hiRef.current, current.score));
      setStatus(current.result);
      return;
    }
    hudClockRef.current += dt;
    if (hudClockRef.current >= 0.12) {
      hudClockRef.current = 0;
      syncHud();
    }
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = prepareCanvas(canvas, CANVAS_W, CANVAS_H);
    const overlay = status === "ready" || status === "paused" || status === "won" || status === "lost" ? status : null;
    drawBomberman(ctx, worldRef.current, overlay, hiRef.current, stageLabel(level + 1));
  };

  useGameLoop({ running: status === "running", update, render, deps: [status, version] });

  const enemyTypes = [...new Set([...info.roster.map((entry) => entry[0]), "daemon"])];
  const touchDir = (name) => ({
    onPress: () => {
      pressKey(`touch-${name}`);
      begin();
    },
    onRelease: () => releaseKey(`touch-${name}`),
  });

  return (
    <GameFrame
      title="Bomberman"
      description={`Stage ${info.label} · ${info.areaName} area — find the hidden exit door, blast every enemy, then step into the door before time runs out.`}
      status={status}
      metrics={[
        { label: "STAGE", value: hud.stage },
        { label: "SCORE", value: hud.score },
        { label: "HI", value: Math.max(hiRef.current, hud.score) },
        { label: "LIVES", value: hud.lives },
        { label: "TIME", value: `${hud.time}s` },
        { label: "FIRE", value: hud.fire },
        { label: "BOMBS", value: hud.bombs },
        { label: "SPEED", value: hud.speed + 1 },
        { label: "FOES", value: hud.foes },
      ]}
      onBack={onBack}
      onRestart={reset}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      controls="WASD or arrows move. Space or J drops a bomb. K or Enter detonates (needs the Detonator). P pauses. Blow up soft blocks to find the exit door and the stage's hidden power-up, kill every enemy, then walk into the door. Bombing the exposed door releases more enemies. When the timer hits zero, fast DAEMONS hunt you down."
    >
      <div className="mx-auto max-w-[680px]">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          aria-label="Bomberman arena. Use W A S D to move, Space to place a bomb, K to detonate, P to pause."
          className="block h-auto w-full border border-white/10"
        >
          Bomberman arena
        </canvas>
        <ul className="mt-3 flex flex-wrap gap-2 font-mono text-[11px]" aria-label="Enemies in this stage">
          {enemyTypes.map((id) => (
            <li key={id} className="rounded border bg-white/[0.02] px-2 py-1" style={{ borderColor: `${ENEMY_TYPES[id].color}66`, color: ENEMY_TYPES[id].color }}>
              ◆ {ENEMY_TYPES[id].name} <span className="text-zinc-500">— {ENEMY_TYPES[id].blurb} · {ENEMY_TYPES[id].score} pts</span>
            </li>
          ))}
        </ul>
        <ul className="mt-2 flex flex-wrap gap-2 font-mono text-[11px]" aria-label="Power-up guide">
          {POWERUP_ORDER.map((id) => (
            <li key={id} className="rounded border bg-white/[0.02] px-2 py-1" style={{ borderColor: `${POWERUPS[id].color}66`, color: POWERUPS[id].color }}>
              ◇ {POWERUPS[id].glyph} {POWERUPS[id].label} <span className="text-zinc-500">— {POWERUPS[id].blurb}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-end justify-between gap-3 sm:hidden" aria-label="Touch controls">
          <div className="grid w-40 grid-cols-3 gap-1.5">
            <span />
            <ByteControlButton label="▲" {...touchDir("up")} />
            <span />
            <ByteControlButton label="◀" {...touchDir("left")} />
            <span />
            <ByteControlButton label="▶" {...touchDir("right")} />
            <span />
            <ByteControlButton label="▼" {...touchDir("down")} />
            <span />
          </div>
          <div className="flex flex-col gap-2">
            <ByteControlButton label="BOMB" onPress={queueBomb} onRelease={NO_RELEASE} />
            {hud.detonator && <ByteControlButton label="DET" onPress={queueDetonate} onRelease={NO_RELEASE} />}
          </div>
        </div>
        {status === "won" && (
          <p role="status" className="mt-3 font-mono text-xs text-emerald-300">
            stage clear — loading stage {stageLabel(level + 1)}…
          </p>
        )}
      </div>
    </GameFrame>
  );
}
