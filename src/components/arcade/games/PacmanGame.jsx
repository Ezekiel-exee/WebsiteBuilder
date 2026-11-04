import { useEffect, useRef, useState } from "react";
import { directionFromKey, prepareCanvas, useGameLoop } from "../arcadeKit";
import { GamePad, GameFrame, useAutomaticLevelAdvance } from "../GameFrame";
import { DOWN, LEFT, RIGHT, STEP, UP, beginPlay, createGame, pacmanHud, pacmanStatus, queueDirection, startingLives, update } from "./pacmanEngine";
import { HEIGHT, WIDTH, createPacmanRenderer, drawPacman } from "./pacmanRender";

const HI_KEY = "arcade-pacman-hi";
const SWIPE_DISTANCE = 22;

// The page remounts the game on every level change, so score and lives travel through this module variable.
let carry = null;

function readHi() {
  try {
    return Number(window.localStorage.getItem(HI_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeHi(value) {
  try {
    if (value > readHi()) window.localStorage.setItem(HI_KEY, String(value));
  } catch {
    // Storage can be unavailable (private mode); the high score is then session-only.
  }
}

const dirIndex = (dx, dy) => (dy < 0 ? UP : dx < 0 ? LEFT : dy > 0 ? DOWN : RIGHT);

function newGame(level, difficulty, snapshot) {
  return createGame({ level, difficulty, score: snapshot.score, lives: snapshot.lives, hi: readHi() });
}

export default function PacmanGame({ difficulty = "medium", level = 1, onBack, onLevelAdvance }) {
  const canvasRef = useRef(null);
  const heldRef = useRef([]);
  const swipeRef = useRef(null);
  const rendererRef = useRef(null);
  const snapshotRef = useRef(null);
  const gameRef = useRef(null);
  const finishedRef = useRef(false);
  const lastHudRef = useRef({ score: -1, hi: -1, lives: -1, level: -1, left: -1, time: 0 });
  if (!gameRef.current) {
    if (level <= 1 || !carry || carry.difficulty !== difficulty) carry = { difficulty, score: 0, lives: startingLives(difficulty) };
    snapshotRef.current = { score: carry.score, lives: carry.lives };
    gameRef.current = newGame(level, difficulty, snapshotRef.current);
    rendererRef.current = createPacmanRenderer();
  }
  const [status, setStatus] = useState("ready");
  const [hud, setHud] = useState(() => pacmanHud(gameRef.current));
  const statusRef = useRef(status);
  statusRef.current = status;
  useAutomaticLevelAdvance(status, onLevelAdvance);

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawPacman(prepareCanvas(canvas, WIDTH, HEIGHT), rendererRef.current, gameRef.current, statusRef.current);
  };

  // React state only changes when a HUD value changes, and at most ten times per second.
  const syncHud = (force) => {
    const g = gameRef.current;
    const last = lastHudRef.current;
    if (last.score === g.score && last.hi === g.hi && last.lives === g.lives && last.level === g.level && last.left === g.dotsLeft) return;
    const now = performance.now();
    if (!force && now - last.time < 100) return;
    last.score = g.score;
    last.hi = g.hi;
    last.lives = g.lives;
    last.level = g.level;
    last.left = g.dotsLeft;
    last.time = now;
    setHud(pacmanHud(g));
  };

  const finish = (result) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const g = gameRef.current;
    writeHi(g.hi);
    if (result === "won") carry = { difficulty, score: g.score, lives: g.lives };
    syncHud(true);
    setStatus(result);
  };

  const stepGame = (dt) => {
    const g = gameRef.current;
    const held = heldRef.current;
    update(g, dt, held.length ? held[held.length - 1] : -1);
    const result = pacmanStatus(g);
    if (result === "running") syncHud(false);
    else finish(result);
  };

  useGameLoop({ running: status === "running", step: STEP, update: stepGame, render });

  const reset = () => {
    gameRef.current = newGame(level, difficulty, snapshotRef.current);
    heldRef.current.length = 0;
    finishedRef.current = false;
    lastHudRef.current.score = -1;
    statusRef.current = "ready";
    setHud(pacmanHud(gameRef.current));
    setStatus("ready");
    render();
  };

  const begin = () => {
    if (statusRef.current !== "ready") return;
    beginPlay(gameRef.current);
    setStatus("running");
  };
  const tap = (dir) => {
    if (statusRef.current === "won" || statusRef.current === "lost" || statusRef.current === "paused") return;
    queueDirection(gameRef.current, dir);
    begin();
  };
  const press = (dir) => {
    const held = heldRef.current;
    const at = held.indexOf(dir);
    if (at >= 0) held.splice(at, 1);
    held.push(dir);
    tap(dir);
  };
  const release = (dir) => {
    const held = heldRef.current;
    const at = held.indexOf(dir);
    if (at >= 0) held.splice(at, 1);
  };

  const onKeyDown = (event) => {
    const key = event.key.toLowerCase();
    const dir = directionFromKey(event.key);
    if (dir || key === " ") event.preventDefault();
    if (key === "p" && !event.repeat) {
      setStatus((current) => (current === "running" ? "paused" : current === "paused" ? "running" : current));
      return;
    }
    if (dir && !event.repeat) press(dirIndex(dir.x, dir.y));
  };
  const onKeyUp = (event) => {
    const dir = directionFromKey(event.key);
    if (dir) release(dirIndex(dir.x, dir.y));
  };

  const onPointerDown = (event) => {
    swipeRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = (event) => {
    const start = swipeRef.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_DISTANCE) return;
    tap(Math.abs(dx) > Math.abs(dy) ? dirIndex(dx, 0) : dirIndex(0, dy));
    start.x = event.clientX;
    start.y = event.clientY;
  };
  const onPointerEnd = () => {
    swipeRef.current = null;
  };

  useEffect(() => {
    const pause = () => {
      heldRef.current.length = 0;
      if (statusRef.current === "running") setStatus("paused");
    };
    const onVisibility = () => {
      if (document.hidden) pause();
    };
    const saveHi = () => writeHi(gameRef.current.hi);
    window.addEventListener("blur", pause);
    window.addEventListener("pagehide", saveHi);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", pause);
      window.removeEventListener("pagehide", saveHi);
      document.removeEventListener("visibilitychange", onVisibility);
      saveHi();
    };
  }, []);

  return (
    <GameFrame
      title="Pac-Man"
      description="Eat every dot, dodge Blinky, Pinky, Inky and Clyde, and grab a power pellet to turn the tables. Each level the ghosts get faster."
      status={status}
      metrics={[
        { label: "LEVEL", value: hud.level },
        { label: "SCORE", value: hud.score },
        { label: "HI", value: hud.hi },
        { label: "LIVES", value: hud.lives },
        { label: "DOTS LEFT", value: hud.left },
      ]}
      onBack={onBack}
      onRestart={reset}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      controls="WASD or arrow keys steer — queue a turn early and Pac-Man takes it at the next junction. P pauses. Swipe the maze on touch screens. Power pellets let you eat ghosts (200, 400, 800, 1600). Fruit appears twice a level, and you earn an extra life at 10,000 points."
    >
      <div className="mx-auto max-w-[560px]">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          aria-label="Pac-Man maze. Use W A S D or the arrow keys to steer, P to pause, or swipe on touch screens."
          className="block h-auto w-full touch-none select-none border border-white/10"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        >
          Pac-Man maze
        </canvas>
        <div className="flex justify-center">
          <GamePad onMove={(dx, dy) => tap(dirIndex(dx, dy))} />
        </div>
      </div>
    </GameFrame>
  );
}
