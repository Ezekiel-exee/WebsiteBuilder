import { useEffect, useMemo, useRef, useState } from "react";
import { directionFromKey, prepareCanvas } from "../arcadeKit";
import { GameFrame, GamePad, useAutomaticLevelAdvance } from "../GameFrame";
import { OPEN, boardLayout, boardSpec, chordCell, createGame, formatTime, levelBonus, moveIndex, revealCell, tickTimer, toggleFlag } from "./minesweeperEngine";
import { REVEAL_MS, drawMinesweeper } from "./minesweeperRender";
import { loadBestTime, saveBestTime } from "./minesweeperStorage";

// The page remounts the game for every level, so the running total lives at module level.
let carriedScore = 0;

const HINT = "LEFT CLICK REVEAL · RIGHT CLICK FLAG · MIDDLE / DOUBLE CLICK CHORD";
const LONG_PRESS_MS = 400;
const POINTS_PER_TILE = 10;
const WAVE_MS_PER_STEP = 22;
const WAVE_MAX_MS = 400;

export default function MinesweeperGame({ difficulty = "easy", level = 1, onBack, onLevelAdvance }) {
  const spec = useMemo(() => boardSpec(difficulty, level), [difficulty, level]);
  const layout = useMemo(() => boardLayout(spec.rows, spec.cols), [spec]);
  const canvasRef = useRef(null);
  const startScoreRef = useRef(null);
  if (startScoreRef.current === null) {
    if (level <= 1) carriedScore = 0;
    startScoreRef.current = carriedScore;
  }
  const startScore = startScoreRef.current;
  const centerIndex = Math.floor(spec.rows / 2) * spec.cols + Math.floor(spec.cols / 2);

  const gameRef = useRef(null);
  if (!gameRef.current) gameRef.current = createGame(spec.rows, spec.cols, spec.mines);
  const animRef = useRef(null);
  if (!animRef.current) animRef.current = new Float32Array(spec.rows * spec.cols);
  const statusRef = useRef("ready");
  const hoverRef = useRef(-1);
  const cursorRef = useRef(centerIndex);
  const bestRef = useRef(null);
  if (bestRef.current === null) bestRef.current = { value: loadBestTime(difficulty, spec.rows, spec.cols, spec.mines) };
  const bonusRef = useRef(0);
  const messageRef = useRef(HINT);
  const fxUntilRef = useRef(0);
  const endedAtRef = useRef(0);
  const loopRef = useRef({ raf: 0, last: 0 });
  const pointerRef = useRef({ leftDown: -1, chorded: false, ignore: false, touchIndex: -1, longPressed: false, timer: 0 });
  const viewRef = useRef({ game: null, layout, anim: null, hover: -1, cursor: 0, now: 0, mode: null, difficulty, level, score: 0, startScore, best: null, message: HINT });
  const hudRef = useRef(null);

  const scoreNow = () => startScore + gameRef.current.revealed * POINTS_PER_TILE + bonusRef.current;
  const readHud = () => {
    const game = gameRef.current;
    return { left: game.mines - game.flags, time: Math.floor(game.elapsed), best: bestRef.current.value, score: scoreNow() };
  };
  const [status, setStatusState] = useState("ready");
  const [hud, setHud] = useState(readHud);
  hudRef.current = hud;
  useAutomaticLevelAdvance(status, onLevelAdvance);

  // React state only changes when a displayed value changes (about once a second while the timer runs).
  const syncHud = () => {
    const next = readHud();
    const prev = hudRef.current;
    if (prev.left === next.left && prev.time === next.time && prev.best === next.best && prev.score === next.score) return;
    hudRef.current = next;
    setHud(next);
  };

  const draw = (now) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const view = viewRef.current;
    const current = statusRef.current;
    view.game = gameRef.current;
    view.layout = layout;
    view.anim = animRef.current;
    view.hover = hoverRef.current;
    view.cursor = cursorRef.current;
    view.now = now;
    view.mode = current === "ready" ? "ready" : current === "paused" ? "paused" : null;
    view.score = scoreNow();
    view.best = bestRef.current.value;
    view.message = messageRef.current;
    drawMinesweeper(prepareCanvas(canvas, layout.width, layout.height), view);
  };

  // The loop only keeps itself alive while the timer ticks or an animation is playing.
  const frame = () => {
    const loop = loopRef.current;
    loop.raf = 0;
    const now = performance.now();
    const game = gameRef.current;
    const ticking = statusRef.current === "running" && game.placed && game.result === "playing";
    if (ticking) {
      tickTimer(game, loop.last ? Math.min((now - loop.last) / 1000, 0.25) : 0);
      loop.last = now;
      syncHud();
    } else {
      loop.last = 0;
    }
    draw(now);
    const finished = game.result !== "playing" && now < endedAtRef.current + 2500;
    if (ticking || finished || now < fxUntilRef.current) loop.raf = window.requestAnimationFrame(frame);
  };
  const invalidate = () => {
    if (!loopRef.current.raf) loopRef.current.raf = window.requestAnimationFrame(frame);
  };
  const setStatus = (next) => {
    statusRef.current = next;
    setStatusState(next);
    invalidate();
  };

  const clearPointer = () => {
    const pointer = pointerRef.current;
    window.clearTimeout(pointer.timer);
    pointer.leftDown = -1;
    pointer.chorded = false;
    pointer.touchIndex = -1;
    pointer.longPressed = false;
  };

  // Restart after a loss: same board size, score back to the snapshot taken when this level began.
  const reset = () => {
    clearPointer();
    gameRef.current = createGame(spec.rows, spec.cols, spec.mines);
    animRef.current.fill(0);
    hoverRef.current = -1;
    cursorRef.current = centerIndex;
    bonusRef.current = 0;
    messageRef.current = HINT;
    fxUntilRef.current = 0;
    endedAtRef.current = 0;
    bestRef.current = { value: loadBestTime(difficulty, spec.rows, spec.cols, spec.mines) };
    const next = readHud();
    hudRef.current = next;
    setHud(next);
    setStatus("ready");
  };

  // Newly opened tiles appear as a short wave radiating from the clicked tile.
  const stampFresh = (origin) => {
    const game = gameRef.current;
    const anim = animRef.current;
    const now = performance.now();
    const ox = origin % game.cols;
    const oy = (origin - ox) / game.cols;
    for (let k = 0; k < game.freshCount; k += 1) {
      const index = game.fresh[k];
      const x = index % game.cols;
      const y = (index - x) / game.cols;
      const delay = Math.min(Math.max(Math.abs(x - ox), Math.abs(y - oy)) * WAVE_MS_PER_STEP, WAVE_MAX_MS);
      anim[index] = now + delay;
      if (now + delay + REVEAL_MS > fxUntilRef.current) fxUntilRef.current = now + delay + REVEAL_MS;
    }
  };

  const finishOutcome = (outcome) => {
    const game = gameRef.current;
    if (outcome === "boom") {
      endedAtRef.current = performance.now();
      const x = game.exploded % game.cols;
      messageRef.current = `BOOM · MINE TRIPPED AT COLUMN ${x + 1}, ROW ${(game.exploded - x) / game.cols + 1}`;
      syncHud();
      setStatus("lost");
    } else if (outcome === "won") {
      endedAtRef.current = performance.now();
      bonusRef.current = levelBonus(game);
      carriedScore = scoreNow();
      const previous = bestRef.current.value;
      const best = saveBestTime(difficulty, spec.rows, spec.cols, spec.mines, game.elapsed);
      bestRef.current = { value: best };
      const record = previous === null || best < previous;
      messageRef.current = `SECTOR CLEARED IN ${formatTime(game.elapsed, true)}${record ? " · NEW BEST" : ""} · LOADING LEVEL ${level + 1}`;
      syncHud();
      setStatus("won");
    }
  };

  const begin = () => {
    if (statusRef.current === "ready") setStatus("running");
  };
  const playing = () => statusRef.current === "running" && gameRef.current.result === "playing";

  const act = (kind, index) => {
    if (!playing() || index < 0) return;
    const game = gameRef.current;
    if (kind === "flag") {
      if (toggleFlag(game, index)) {
        syncHud();
        invalidate();
      }
      return;
    }
    const outcome = kind === "chord" ? chordCell(game, index) : revealCell(game, index);
    if (outcome === "noop") return;
    stampFresh(index);
    finishOutcome(outcome);
    syncHud();
    invalidate();
  };
  const smartReveal = (index) => act(gameRef.current.cell[index] === OPEN ? "chord" : "reveal", index);

  const togglePause = () => {
    if (statusRef.current === "running") setStatus("paused");
    else if (statusRef.current === "paused" || statusRef.current === "ready") setStatus("running");
  };

  const moveCursor = (dx, dy) => {
    if (statusRef.current === "won" || statusRef.current === "lost") return;
    begin();
    if (statusRef.current !== "running") return;
    cursorRef.current = moveIndex(gameRef.current, cursorRef.current, dx, dy);
    invalidate();
  };
  const press = (kind) => {
    begin();
    if (kind === "reveal") smartReveal(cursorRef.current);
    else act(kind, cursorRef.current);
  };

  const onKeyDown = (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest?.("button")) return;
    const key = event.key.toLowerCase();
    const direction = directionFromKey(key);
    const handled = Boolean(direction) || ["enter", " ", "f", "c", "p"].includes(key);
    if (handled) event.preventDefault();
    if (key === "p") {
      if (!event.repeat) togglePause();
      return;
    }
    const current = statusRef.current;
    if (current === "won" || current === "lost") return;
    if (current === "ready" && key.length > 1 && !handled) return;
    if (current === "ready") begin();
    if (!handled) return;
    if (direction) moveCursor(direction.x, direction.y);
    else if (key === "enter" || key === " ") press("reveal");
    else if (key === "f") press("flag");
    else if (key === "c") press("chord");
  };

  const indexAt = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return -1;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return -1;
    const scale = layout.width / rect.width;
    const col = Math.floor(((event.clientX - rect.left) * scale - layout.ox) / layout.cell);
    const row = Math.floor(((event.clientY - rect.top) * scale - layout.oy) / layout.cell);
    return col < 0 || row < 0 || col >= spec.cols || row >= spec.rows ? -1 : row * spec.cols + col;
  };

  const onPointerDown = (event) => {
    event.currentTarget.closest("[tabindex]")?.focus({ preventScroll: true });
    const pointer = pointerRef.current;
    const current = statusRef.current;
    if (current === "ready" || current === "paused") {
      event.preventDefault();
      pointer.ignore = true;
      setStatus("running");
      return;
    }
    if (current !== "running") return;
    const index = indexAt(event);
    if (index < 0) return;
    event.preventDefault();
    cursorRef.current = index;
    hoverRef.current = event.pointerType === "mouse" ? index : -1;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // capture is only a nicety
    }
    if (event.pointerType === "mouse") {
      if (event.button === 1) act("chord", index);
      else if (event.button === 2) {
        if (event.buttons & 1) {
          pointer.chorded = true;
          act("chord", index);
        } else act("flag", index);
      } else if (event.button === 0) {
        if (event.buttons & 2) {
          pointer.chorded = true;
          act("chord", index);
        } else pointer.leftDown = index;
      }
    } else {
      window.clearTimeout(pointer.timer);
      pointer.touchIndex = index;
      pointer.longPressed = false;
      pointer.timer = window.setTimeout(() => {
        pointer.longPressed = true;
        act("flag", pointer.touchIndex);
        navigator.vibrate?.(15);
      }, LONG_PRESS_MS);
    }
    invalidate();
  };

  const onPointerMove = (event) => {
    const index = indexAt(event);
    const pointer = pointerRef.current;
    if (event.pointerType === "mouse") {
      if (hoverRef.current !== index) {
        hoverRef.current = index;
        invalidate();
      }
    } else if (pointer.touchIndex >= 0 && index !== pointer.touchIndex) {
      window.clearTimeout(pointer.timer);
      pointer.touchIndex = -1;
    }
  };

  const onPointerUp = (event) => {
    const pointer = pointerRef.current;
    if (pointer.ignore) {
      if (!event.buttons) pointer.ignore = false;
      return;
    }
    if (event.pointerType !== "mouse") {
      window.clearTimeout(pointer.timer);
      const index = pointer.touchIndex;
      const long = pointer.longPressed;
      pointer.touchIndex = -1;
      pointer.longPressed = false;
      if (index >= 0 && !long) smartReveal(index);
      return;
    }
    if (event.button === 0) {
      const index = pointer.leftDown >= 0 && !pointer.chorded ? indexAt(event) : -1;
      pointer.leftDown = -1;
      if (index >= 0) act("reveal", index);
    }
    if (!event.buttons) pointer.chorded = false;
  };

  const onPointerLeave = (event) => {
    if (event.pointerType === "mouse" && hoverRef.current !== -1) {
      hoverRef.current = -1;
      invalidate();
    }
  };
  const onDoubleClick = (event) => {
    const index = indexAt(event);
    if (index >= 0 && event.button === 0) act("chord", index);
  };

  useEffect(() => {
    invalidate();
    const loop = loopRef.current;
    const pointer = pointerRef.current;
    const onBlur = () => clearPointer();
    const onVisibility = () => {
      if (document.hidden && statusRef.current === "running" && gameRef.current.placed) setStatus("paused");
    };
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
      window.cancelAnimationFrame(loop.raf);
      loop.raf = 0;
      window.clearTimeout(pointer.timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sizeLabel = `${spec.rows}×${spec.cols}`;
  return (
    <GameFrame
      title="Minesweeper"
      description={`Level ${level}: ${sizeLabel} board with ${spec.mines} mines. Clear every safe tile — each level grows the board.`}
      status={status}
      metrics={[
        { label: "LEVEL", value: level },
        { label: "BOARD", value: sizeLabel },
        { label: "MINES", value: hud.left },
        { label: "TIME", value: formatTime(hud.time) },
        { label: "BEST", value: hud.best === null ? "--:--" : formatTime(hud.best, true) },
        { label: "SCORE", value: hud.score },
      ]}
      onBack={onBack}
      onRestart={reset}
      onKeyDown={onKeyDown}
      controls="Click or press a key to start. Left click or Enter/Space reveals, right click or F flags, middle click, double click, left+right, or C chords around a satisfied number. WASD or arrows move the cursor. On touch: tap reveals (or chords a number), press and hold flags. P pauses. The first tile is always safe; every cleared level starts a bigger board."
    >
      <div className="mx-auto" style={{ maxWidth: layout.width }}>
        <canvas
          ref={canvasRef}
          width={layout.width}
          height={layout.height}
          aria-label={`Minesweeper board, ${sizeLabel} with ${spec.mines} mines. Use WASD or arrow keys to move, Enter to reveal, F to flag, C to chord.`}
          className="block h-auto w-full touch-none select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={clearPointer}
          onPointerLeave={onPointerLeave}
          onDoubleClick={onDoubleClick}
          onContextMenu={(event) => event.preventDefault()}
        >
          Minesweeper board
        </canvas>
        <div className="flex flex-wrap items-start gap-4 sm:hidden">
          <GamePad onMove={moveCursor} onAction={() => press("reveal")} actionLabel="OPEN" />
          <div className="mt-4 flex gap-2 font-mono text-xs">
            <button type="button" onClick={() => press("flag")} className="touch-manipulation rounded border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-amber-200 active:scale-95">FLAG</button>
            <button type="button" onClick={() => press("chord")} className="touch-manipulation rounded border border-violet-300/30 bg-violet-300/10 px-3 py-2 text-violet-200 active:scale-95">CHORD</button>
            <button type="button" onClick={togglePause} className="touch-manipulation rounded border border-white/10 bg-white/5 px-3 py-2 text-zinc-300 active:scale-95">PAUSE</button>
          </div>
        </div>
        {status === "won" && <p role="status" className="mt-3 font-mono text-xs text-emerald-300">sector cleared — loading level {level + 1} with a larger board…</p>}
      </div>
    </GameFrame>
  );
}
