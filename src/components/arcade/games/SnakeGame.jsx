import { useEffect, useRef, useState } from "react";
import { GameFrame, useAutomaticLevelAdvance } from "../GameFrame";
import { DIR_VECTORS } from "../TouchControls";
import { directionFromKey, prepareCanvas } from "../arcadeKit";
import { HEIGHT, WIDTH, createSnakeWorld, queueTurn, snakeCarry, snakeHud, updateSnake } from "./snakeEngine";
import { drawSnake2d } from "./snakeRender";

const SWIPE_DISTANCE = 22;
const HUD_INTERVAL_MS = 100;

// Survives the remount the arcade page does on every level change.
let carryStore = null;

function readCarry(difficulty, level) {
  if (level <= 1) {
    carryStore = null;
    return null;
  }
  return carryStore && carryStore.difficulty === difficulty && carryStore.level === level ? carryStore : null;
}

const hiKey = (difficulty) => `code-arcade-snake-hi-${difficulty}`;

function loadHi(difficulty) {
  try {
    return Number(window.localStorage.getItem(hiKey(difficulty))) || 0;
  } catch {
    return 0;
  }
}

function saveHi(difficulty, value) {
  try {
    if (value > loadHi(difficulty)) window.localStorage.setItem(hiKey(difficulty), String(value));
  } catch {
    // storage unavailable (private mode / quota): the high score just lives for this session
  }
}

function sameHud(a, b) {
  return a.score === b.score && a.hi === b.hi && a.bytes === b.bytes && a.length === b.length && a.combo === b.combo && a.shield === b.shield && a.turbo === b.turbo && a.sleep === b.sleep && a.speed === b.speed;
}

export default function SnakeGame({ difficulty, level, onBack, onLevelAdvance }) {
  const canvasRef = useRef(null);
  const worldRef = useRef(null);
  const startCarryRef = useRef(null);
  const swipeRef = useRef(null);
  if (!worldRef.current) {
    startCarryRef.current = readCarry(difficulty, level);
    worldRef.current = createSnakeWorld({ difficulty, level, carry: startCarryRef.current, hi: loadHi(difficulty) });
  }
  const [status, setStatus] = useState("ready");
  const [hud, setHud] = useState(() => snakeHud(worldRef.current));
  const [version, setVersion] = useState(0);
  const statusRef = useRef(status);
  statusRef.current = status;
  useAutomaticLevelAdvance(status, onLevelAdvance);

  const reset = () => {
    saveHi(difficulty, worldRef.current.hi);
    worldRef.current = createSnakeWorld({ difficulty, level, carry: startCarryRef.current, hi: Math.max(worldRef.current.hi, loadHi(difficulty)) });
    swipeRef.current = null;
    setHud(snakeHud(worldRef.current));
    setStatus("ready");
    setVersion((current) => current + 1);
  };

  const steer = (dx, dy) => {
    const current = statusRef.current;
    if (current !== "ready" && current !== "running") return;
    if (queueTurn(worldRef.current, dx, dy) === "started") setStatus("running");
  };
  const togglePause = () => {
    const current = statusRef.current;
    if (current === "running") setStatus("paused");
    else if (current === "paused") setStatus("running");
  };

  const onKeyDown = (event) => {
    if (event.key.toLowerCase() === "p") {
      if (!event.repeat) togglePause();
      return;
    }
    const direction = directionFromKey(event.key);
    if (!direction) return;
    event.preventDefault();
    steer(direction.x, direction.y);
  };

  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    swipeRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
  };
  const onPointerMove = (event) => {
    const swipe = swipeRef.current;
    if (!swipe || swipe.id !== event.pointerId) return;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_DISTANCE) return;
    if (Math.abs(dx) > Math.abs(dy)) steer(dx > 0 ? 1 : -1, 0);
    else steer(0, dy > 0 ? 1 : -1);
    swipe.x = event.clientX;
    swipe.y = event.clientY;
    swipe.moved = true;
  };
  const onPointerUp = (event) => {
    const swipe = swipeRef.current;
    swipeRef.current = null;
    if (!swipe || swipe.moved || event.type === "pointercancel" || event.pointerType === "mouse") return;
    // A plain tap starts a ready game or toggles pause.
    if (statusRef.current === "ready") steer(1, 0);
    else togglePause();
  };

  useEffect(() => {
    const pause = () => {
      swipeRef.current = null;
      if (statusRef.current === "running") setStatus("paused");
    };
    const onVisibility = () => {
      if (document.hidden) pause();
    };
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => () => saveHi(difficulty, worldRef.current.hi), [difficulty]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = prepareCanvas(canvas, WIDTH, HEIGHT);
    const world = worldRef.current;
    if (status !== "running") {
      drawSnake2d(ctx, world, status);
      return undefined;
    }
    let frame = 0;
    let previous = 0;
    let lastHud = 0;
    const loop = (time) => {
      const dt = previous ? Math.min(time - previous, 50) : 0;
      previous = time;
      updateSnake(world, dt);
      drawSnake2d(ctx, world, null);
      if (world.status === "won" || world.status === "lost") {
        setHud(snakeHud(world));
        saveHi(difficulty, world.hi);
        if (world.status === "won") carryStore = { difficulty, level: level + 1, ...snakeCarry(world) };
        setStatus(world.status);
        return;
      }
      if (time - lastHud >= HUD_INTERVAL_MS) {
        lastHud = time;
        const snapshot = snakeHud(world);
        setHud((current) => (sameHud(current, snapshot) ? current : snapshot));
      }
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, [status, version, difficulty, level]);

  const world = worldRef.current;
  const fxText = hud.turbo > 0 ? `TURBO ${hud.turbo}s` : hud.sleep > 0 ? `SLEEP ${hud.sleep}s` : hud.shield > 0 ? "SHIELD" : "none";

  return (
    <GameFrame
      title="Snake"
      description={`Level ${level} · ${world.layoutName.toLowerCase()} · ${world.wrap ? "the edges wrap around" : "the walls are solid"}. Eat ${world.target} bytes to clear it.`}
      status={status}
      metrics={[
        { label: "LEVEL", value: level },
        { label: "BYTES", value: `${hud.bytes}/${hud.target}` },
        { label: "SCORE", value: hud.score },
        { label: "HI", value: hud.hi },
        { label: "LENGTH", value: hud.length },
        { label: "COMBO", value: `x${hud.combo}` },
        { label: "FX", value: fxText },
      ]}
      onBack={onBack}
      onRestart={reset}
      onKeyDown={onKeyDown}
      touch={{ dpad: { onPress: (direction) => steer(...DIR_VECTORS[direction]) }, onPause: togglePause }}
      controls="W A S D or the arrow keys steer (swipe the arena or use the on-screen D-pad on touch). Reversals are ignored and up to 3 turns are buffered. P pauses. Eat cyan bytes for combo points; golden BONUS is worth big points, TURBO speeds you up, SLEEP slows you down, GC trims 3 segments, and a GIT COMMIT gives a shield that absorbs one crash. Easy wraps through the edges; medium and hard have solid walls."
    >
      <div className="mx-auto max-w-[800px]">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          aria-label="Snake arena. Use W A S D or the arrow keys to steer, or swipe. P pauses."
          className="block h-auto w-full touch-none select-none border border-white/10"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          Snake arena
        </canvas>
        {status === "won" && <p role="status" className="mt-3 text-center font-mono text-xs text-emerald-300">level cleared — loading level {level + 1}…</p>}
      </div>
    </GameFrame>
  );
}
