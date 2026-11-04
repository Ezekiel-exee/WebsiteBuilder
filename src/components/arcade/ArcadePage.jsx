import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "../builder/Icon";
import { ARENA_H, ARENA_W, CAMPAIGN, STEP, brawlHud, brawlResult, createBrawl, drawBrawl, enemyTypes, stepBrawl } from "./byteBrawlEngine";
import ByteBrawlSetup, { DropsGuide, saveCampaignProgress } from "./ByteBrawlSetup";
import ByteBrawlOnline from "./ByteBrawlOnline";

const NO_LEVEL_ADVANCE = () => {};

const GAMES = [
  { id: "minesweeper", name: "Minesweeper", icon: "terminal", description: "Clear the board without tripping a mine.", controls: "WASD to move · Enter to reveal · F to flag" },
  { id: "bomberman", name: "Bomberman", icon: "bomb", description: "Blast through soft blocks, collect hidden upgrades, and outlast the enemy crew.", controls: "WASD to move · Space to place a bomb" },
  { id: "pacman", name: "Pac-Man", icon: "pacman", description: "Clear the maze, evade four ghosts, and use power pellets to turn the chase around.", controls: "WASD to move · P to pause" },
  { id: "snake", name: "Snake", icon: "snake", description: "Collect bytes, grow your process, and avoid collisions.", controls: "WASD to move" },
  { id: "code-arena", name: "Byte Brawl", icon: "platform", description: "Gun Mayhem-style brawler with a 15-mission campaign, bosses, and 7 stages for versus. Every 3 levels a new enemy type with its own skill appears.", controls: "A/D move · W jump · S drop · J fire · P pause" },
];

const DIFFICULTIES = [
  { id: "easy", label: "Easy", color: "text-emerald-300" },
  { id: "medium", label: "Medium", color: "text-amber-300" },
  { id: "hard", label: "Hard", color: "text-rose-300" },
];

function randomPosition(width, height, occupied) {
  const occupiedKeys = new Set(occupied.map((item) => `${item.x},${item.y}`));
  const available = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!occupiedKeys.has(`${x},${y}`)) available.push({ x, y });
    }
  }
  return available.length ? available[Math.floor(Math.random() * available.length)] : null;
}

function GameFrame({ title, description, status, metrics, onBack, backLabel = "< games", onRestart, canRestart = true, onKeyDown, onKeyUp, controls, children }) {
  const frameRef = useRef(null);
  const restartRef = useRef(null);
  const statusLabel = { ready: "READY", running: "RUNNING", won: "COMPLETED", lost: "GAME OVER" }[status] || status.toUpperCase();
  const statusColor = status === "running" ? "text-emerald-300" : status === "won" ? "text-cyan-300" : status === "lost" ? "text-rose-300" : status === "paused" ? "text-amber-300" : "text-zinc-400";
  useEffect(() => frameRef.current?.focus(), [title]);
  useEffect(() => {
    if (status === "lost") restartRef.current?.focus();
  }, [status]);
  return (
    <div
      ref={frameRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      className="outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
      aria-label={`${title} game area`}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-xs text-zinc-500">
            <span className="text-emerald-400">~/arcade</span><span>/</span><span>{title.toLowerCase().replaceAll(" ", "-")}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
          <p className="mt-1 text-sm text-zinc-400">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} className="rounded-lg border border-white/10 px-3 py-2 font-mono text-xs text-zinc-300 transition hover:border-white/20 hover:bg-white/5">
            {backLabel}
          </button>
          {canRestart && (
            <button type="button" onClick={onRestart} className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 font-mono text-xs text-cyan-200 transition hover:bg-cyan-400/15">
              $ restart
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-3 font-mono text-xs">
        <span className="text-zinc-500">STATUS</span>
        <span className={`font-semibold ${statusColor}`}>{statusLabel}</span>
        <span className="hidden text-zinc-700 sm:inline">|</span>
        {metrics.map((metric) => (
          <span key={metric.label} className="text-zinc-400">
            <span className="text-zinc-600">{metric.label} </span><span className="text-white">{metric.value}</span>
          </span>
        ))}
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="relative min-w-0 overflow-x-auto rounded-xl border border-white/10 bg-[#080a0f] p-3 sm:p-5">
          {children}
          {status === "lost" && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-[#080a0f]/85 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="arcade-game-over-title">
              <div className="w-full max-w-sm rounded-xl border border-rose-400/30 bg-[#0b0d12] p-6 text-center shadow-xl shadow-rose-950/30">
                <p className="font-mono text-xs font-semibold tracking-[0.2em] text-rose-300">PROCESS TERMINATED</p>
                <h3 id="arcade-game-over-title" className="mt-2 text-2xl font-bold tracking-tight text-white">Game over</h3>
                {canRestart ? (
                  <>
                    <p className="mt-2 font-mono text-xs text-zinc-400">Your run has ended. Restart this level to try again.</p>
                    <button
                      ref={restartRef}
                      type="button"
                      onClick={onRestart}
                      className="mt-5 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-5 py-2.5 font-mono text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                    >
                      $ restart game
                    </button>
                  </>
                ) : (
                  <p className="mt-2 font-mono text-xs text-zinc-400">The host can start a rematch.</p>
                )}
              </div>
            </div>
          )}
        </div>
        <aside className="rounded-xl border border-white/10 bg-[#0b0d12] p-4">
          <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Controls</p>
          <p className="font-mono text-xs leading-6 text-zinc-400">{controls}</p>
          <div className="mt-4 border-t border-white/10 pt-3 font-mono text-[11px] leading-5 text-zinc-600">
            <p><span className="text-cyan-400">const</span> mode = "local";</p>
            <p><span className="text-cyan-400">const</span> fun = true;</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function useAutomaticLevelAdvance(status, onLevelAdvance) {
  useEffect(() => {
    if (status !== "won") return undefined;
    const timer = window.setTimeout(onLevelAdvance, 1400);
    return () => window.clearTimeout(timer);
  }, [status, onLevelAdvance]);
}

function GamePad({ onMove, onAction, actionLabel = "ACTION" }) {
  return (
    <div className="mt-4 grid w-36 grid-cols-3 gap-1.5 sm:hidden" aria-label="Touch controls">
      <span />
      <button type="button" aria-label="Move up" onClick={() => onMove(0, -1)} className="touch-manipulation select-none rounded border border-white/10 bg-white/5 py-2 font-mono text-sm text-zinc-200 transition duration-75 active:scale-95">↑</button>
      <span />
      <button type="button" aria-label="Move left" onClick={() => onMove(-1, 0)} className="touch-manipulation select-none rounded border border-white/10 bg-white/5 py-2 font-mono text-sm text-zinc-200 transition duration-75 active:scale-95">←</button>
      {onAction ? (
        <button type="button" aria-label={actionLabel} onClick={onAction} className="rounded border border-cyan-400/20 bg-cyan-400/10 py-2 font-mono text-[9px] text-cyan-200">{actionLabel}</button>
      ) : (
        <span className="grid place-items-center font-mono text-[10px] text-zinc-700">+</span>
      )}
      <button type="button" aria-label="Move right" onClick={() => onMove(1, 0)} className="touch-manipulation select-none rounded border border-white/10 bg-white/5 py-2 font-mono text-sm text-zinc-200 transition duration-75 active:scale-95">→</button>
      <span />
      <button type="button" aria-label="Move down" onClick={() => onMove(0, 1)} className="touch-manipulation select-none rounded border border-white/10 bg-white/5 py-2 font-mono text-sm text-zinc-200 transition duration-75 active:scale-95">↓</button>
      <span />
    </div>
  );
}

function blankMines(rows, columns) {
  return Array.from({ length: rows * columns }, () => ({ mine: false, adjacent: 0, opened: false, flagged: false }));
}

function createMineBoard(rows, columns, mineCount, safeIndex, previous = []) {
  const excluded = new Set();
  if (safeIndex >= 0) {
    const x = safeIndex % columns;
    const y = Math.floor(safeIndex / columns);
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < columns && ny >= 0 && ny < rows) excluded.add(ny * columns + nx);
      }
    }
  }
  const candidates = Array.from({ length: rows * columns }, (_, index) => index).filter((index) => !excluded.has(index));
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [candidates[index], candidates[swap]] = [candidates[swap], candidates[index]];
  }
  const mines = new Set(candidates.slice(0, mineCount));
  const board = Array.from({ length: rows * columns }, (_, index) => ({
    mine: mines.has(index),
    adjacent: 0,
    opened: false,
    flagged: previous[index]?.flagged || false,
  }));
  board.forEach((cell, index) => {
    if (!cell.mine) return;
    const x = index % columns;
    const y = Math.floor(index / columns);
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < columns && ny >= 0 && ny < rows) board[ny * columns + nx].adjacent += 1;
      }
    }
  });
  return board;
}

function revealMineCells(board, start, columns, rows) {
  const next = board.map((cell) => ({ ...cell }));
  const queue = [start];
  const seen = new Set();
  while (queue.length) {
    const index = queue.pop();
    if (seen.has(index)) continue;
    seen.add(index);
    const cell = next[index];
    if (!cell || cell.opened || cell.flagged || cell.mine) continue;
    cell.opened = true;
    if (cell.adjacent === 0) {
      const x = index % columns;
      const y = Math.floor(index / columns);
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < columns && ny >= 0 && ny < rows) queue.push(ny * columns + nx);
        }
      }
    }
  }
  return next;
}

function Minesweeper({ difficulty, level, onBack, onLevelAdvance }) {
  const dimensions = { easy: [9, 9, 9], medium: [12, 12, 20], hard: [14, 14, 32] }[difficulty];
  const [baseRows, baseColumns, baseMines] = dimensions;
  const rows = baseRows + level - 1;
  const columns = baseColumns + level - 1;
  const mineCount = Math.min(rows * columns - 9, baseMines + (level - 1) * 4);
  const [board, setBoard] = useState(() => blankMines(rows, columns));
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState("ready");
  const [flagMode, setFlagMode] = useState(false);
  const [activeCell, setActiveCell] = useState(0);
  const boardRef = useRef(null);
  useAutomaticLevelAdvance(status, onLevelAdvance);
  const reset = () => {
    setBoard(blankMines(rows, columns));
    setStarted(false);
    setStatus("ready");
    setFlagMode(false);
  };
  useEffect(reset, [rows, columns, mineCount]);

  const reveal = (index) => {
    if (status === "won" || status === "lost") return;
    let activeBoard = board;
    if (!started) {
      activeBoard = createMineBoard(rows, columns, mineCount, index, board);
      setStarted(true);
    }
    if (activeBoard[index]?.flagged || activeBoard[index]?.opened) return;
    if (activeBoard[index]?.mine) {
      setBoard(activeBoard.map((cell) => ({ ...cell, opened: cell.opened || cell.mine })));
      setStatus("lost");
      return;
    }
    const next = revealMineCells(activeBoard, index, columns, rows);
    const opened = next.filter((cell) => cell.opened && !cell.mine).length;
    setBoard(next);
    setStatus(opened === rows * columns - mineCount ? "won" : "running");
  };
  const toggleFlag = (index) => {
    if (status === "won" || status === "lost" || board[index]?.opened) return;
    setBoard((current) => current.map((cell, cellIndex) => cellIndex === index ? { ...cell, flagged: !cell.flagged } : cell));
    if (status === "ready") setStatus("running");
  };
  const handleKeyDown = (event) => {
    const key = event.key.toLowerCase();
    const directions = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
    if (directions[key]) {
      event.preventDefault();
      const [dx, dy] = directions[key];
      const x = activeCell % columns;
      const y = Math.floor(activeCell / columns);
      const nextX = Math.max(0, Math.min(columns - 1, x + dx));
      const nextY = Math.max(0, Math.min(rows - 1, y + dy));
      const nextIndex = nextY * columns + nextX;
      setActiveCell(nextIndex);
      boardRef.current?.querySelector(`[data-cell-index="${nextIndex}"]`)?.focus();
    } else if (key === "f") {
      event.preventDefault();
      toggleFlag(activeCell);
    } else if (key === "enter" || key === " ") {
      event.preventDefault();
      flagMode ? toggleFlag(activeCell) : reveal(activeCell);
    }
  };
  const flagCount = board.filter((cell) => cell.flagged).length;
  const numberColor = ["", "text-sky-300", "text-emerald-300", "text-amber-300", "text-violet-300", "text-rose-300", "text-cyan-300", "text-white", "text-zinc-500"];
  return (
    <GameFrame
      title="Minesweeper"
      description="Clear each expanding field to advance. Your first reveal on every board is always safe."
      status={status}
      metrics={[{ label: "LEVEL", value: level }, { label: "MINES", value: mineCount }, { label: "FLAGS", value: flagCount }]}
      onBack={onBack}
      onRestart={reset}
      onKeyDown={handleKeyDown}
      controls="Use WASD or arrow keys to select a tile. Enter/Space reveals it; F flags it. Click and right-click also work."
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <span className="text-zinc-500">{rows} × {columns} memory blocks</span>
        <button type="button" onClick={() => setFlagMode((current) => !current)} aria-pressed={flagMode} className={`rounded border px-2.5 py-1.5 transition ${flagMode ? "border-amber-300/40 bg-amber-300/10 text-amber-200" : "border-white/10 text-zinc-400 hover:bg-white/5"}`}>
          {flagMode ? "[x] flag mode" : "[ ] flag mode"}
        </button>
      </div>
      <div ref={boardRef} className="mx-auto grid w-fit gap-1" role="grid" aria-label="Minesweeper board" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 2rem))` }}>
        {board.map((cell, index) => (
          <button
            key={index}
            type="button"
            role="gridcell"
            data-cell-index={index}
            tabIndex={activeCell === index ? 0 : -1}
            aria-label={`Row ${Math.floor(index / columns) + 1}, column ${index % columns + 1}${cell.opened ? cell.mine ? ", mine" : `, ${cell.adjacent} adjacent mines` : cell.flagged ? ", flagged" : ", hidden"}`}
            onFocus={() => setActiveCell(index)}
            onClick={() => flagMode ? toggleFlag(index) : reveal(index)}
            onContextMenu={(event) => { event.preventDefault(); toggleFlag(index); }}
            className={`grid h-8 w-8 place-items-center border font-mono text-xs transition focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 sm:h-9 sm:w-9 ${
              cell.opened ? cell.mine ? "border-rose-500/40 bg-rose-500/15 text-rose-300" : "border-white/5 bg-white/[0.035] " + numberColor[cell.adjacent] : "border-white/10 bg-zinc-900 text-zinc-500 hover:border-cyan-400/40 hover:bg-cyan-400/5"
            }`}
          >
            {cell.flagged && !cell.opened ? <span className="text-amber-300">F</span> : cell.opened ? cell.mine ? "*" : cell.adjacent || "" : ""}
          </button>
        ))}
      </div>
      {status === "ready" && <p className="mt-4 text-center font-mono text-xs text-zinc-600">// click any block to initialize the scan</p>}
      {status === "won" && (
        <div role="status" className="mt-5 text-center font-mono text-sm">
          <p className="text-emerald-300">level {level} cleared — {rows * columns} blocks scanned</p>
          <p className="mt-1 text-xs text-zinc-500">// loading the expanded level {level + 1} field…</p>
        </div>
      )}
    </GameFrame>
  );
}

const SNAKE_WIDTH = 20;
const SNAKE_HEIGHT = 13;
const SNAKE_CELL_SIZE = 18;
const SNAKE_CELL_STEP = SNAKE_CELL_SIZE + 1;
const SNAKE_CELLS = Array.from({ length: SNAKE_WIDTH * SNAKE_HEIGHT }, (_, index) => (
  <span key={index} role="gridcell" className="h-[18px] w-[18px] bg-[#0a0c11] text-center font-mono text-[10px] leading-[18px] text-zinc-800">·</span>
));

function createSnakeState() {
  const snake = [{ x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }];
  return { snake, food: randomPosition(SNAKE_WIDTH, SNAKE_HEIGHT, snake), score: 0, status: "ready" };
}

function SnakeGame({ difficulty, level, onBack, onLevelAdvance }) {
  const speeds = { easy: 160, medium: 115, hard: 85 };
  const tickMs = Math.max(55, speeds[difficulty] - (level - 1) * 8);
  const target = level * 4 + 4;
  const [game, setGame] = useState(createSnakeState);
  useAutomaticLevelAdvance(game.status, onLevelAdvance);
  const directionRef = useRef({ x: 1, y: 0 });
  const directionQueueRef = useRef([]);
  const stateRef = useRef(game);
  stateRef.current = game;
  const reset = () => {
    setGame(createSnakeState());
    directionRef.current = { x: 1, y: 0 };
    directionQueueRef.current = [];
  };
  useEffect(reset, [difficulty, level]);

  const move = (x, y) => {
    if (stateRef.current.status === "lost" || stateRef.current.status === "won") return;
    const current = directionQueueRef.current.at(-1) || directionRef.current;
    if ((x === current.x && y === current.y) || (x + current.x === 0 && y + current.y === 0)) {
      if (stateRef.current.status === "ready") setGame((state) => ({ ...state, status: "running" }));
      return;
    }
    if (directionQueueRef.current.length < 2) directionQueueRef.current.push({ x, y });
    if (stateRef.current.status === "ready") setGame((state) => ({ ...state, status: "running" }));
  };
  const onKeyDown = (event) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const directions = {
      ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1],
      ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0],
    };
    if (directions[key]) {
      event.preventDefault();
      move(...directions[key]);
    }
  };
  useEffect(() => {
    if (game.status !== "running") return undefined;
    const timer = window.setInterval(() => {
      const current = stateRef.current;
      if (current.status !== "running") return;
      const queuedDirection = directionQueueRef.current.shift();
      if (queuedDirection) directionRef.current = queuedDirection;
      const direction = directionRef.current;
      const head = { x: current.snake[0].x + direction.x, y: current.snake[0].y + direction.y };
      const eating = current.food && head.x === current.food.x && head.y === current.food.y;
      const body = eating ? current.snake : current.snake.slice(0, -1);
      if (head.x < 0 || head.x >= SNAKE_WIDTH || head.y < 0 || head.y >= SNAKE_HEIGHT || body.some((part) => part.x === head.x && part.y === head.y)) {
        setGame({ ...current, status: "lost" });
        return;
      }
      const nextScore = current.score + Number(eating);
      const nextFood = eating ? randomPosition(SNAKE_WIDTH, SNAKE_HEIGHT, [head, ...body]) : current.food;
      const won = eating && (nextScore >= target || !nextFood);
      setGame({
        ...current,
        snake: [head, ...body],
        food: won ? null : nextFood,
        score: nextScore,
        status: won ? "won" : "running",
      });
    }, tickMs);
    return () => window.clearInterval(timer);
  }, [game.status, tickMs, target]);

  return (
    <GameFrame title="Snake" description="Eat bytes, grow the process, and do not collide with yourself." status={game.status} metrics={[{ label: "BYTES", value: game.score }, { label: "TARGET", value: target }]} onBack={onBack} onRestart={reset} onKeyDown={onKeyDown} controls="Press an arrow key or WASD to start. Collect the cyan byte. Avoid the walls and your own tail.">
      <div className="mx-auto w-fit">
        <div role="grid" aria-label="Snake game board" className="relative grid gap-px border border-white/10 bg-white/10 p-px" style={{ gridTemplateColumns: `repeat(${SNAKE_WIDTH}, ${SNAKE_CELL_SIZE}px)` }}>
          {SNAKE_CELLS}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {game.food && <span
              className="absolute left-px top-px grid h-[18px] w-[18px] place-items-center bg-cyan-400/20 font-mono text-[10px] leading-none text-cyan-200"
              style={{ transform: `translate(${game.food.x * SNAKE_CELL_STEP}px, ${game.food.y * SNAKE_CELL_STEP}px)` }}
            >*</span>}
            {game.snake.map((part, index) => (
              <span
                key={index}
                className={`absolute left-px top-px grid h-[18px] w-[18px] place-items-center font-mono text-[10px] leading-none transition-transform ease-linear ${index === 0 ? "bg-emerald-300 text-zinc-950" : "bg-emerald-500/70 text-emerald-50"}`}
                style={{ transform: `translate(${part.x * SNAKE_CELL_STEP}px, ${part.y * SNAKE_CELL_STEP}px)`, transitionDuration: `${Math.max(40, tickMs - 12)}ms` }}
              >{index === 0 ? "@" : "#"}</span>
            ))}
          </div>
        </div>
        <GamePad onMove={move} />
        {game.status === "ready" && <p className="mt-4 text-center font-mono text-xs text-zinc-600">// use arrows or WASD to start</p>}
        {game.status === "won" && <p role="status" className="mt-4 text-center font-mono text-sm text-emerald-300">target reached — loading level {level + 1}…</p>}
      </div>
    </GameFrame>
  );
}

const PACMAN_MAP = [
  "###############",
  "#.............#",
  "#.###.###.###.#",
  "#...#.....#...#",
  "###.#.###.#.###",
  "#...#.....#...#",
  "..####...####..",
  "#...#.....#...#",
  "###.#.###.#.###",
  "#...#.....#...#",
  "#.###.###.###.#",
  "#.............#",
  "###############",
];
const PACMAN_POWER_STARTS = [{ x: 1, y: 1 }, { x: 13, y: 1 }, { x: 1, y: 11 }, { x: 13, y: 11 }];
const PACMAN_GHOSTS = [
  { id: "blinky", x: 7, y: 6, color: "#fb7185", scatter: { x: 13, y: 1 } },
  { id: "pinky", x: 6, y: 6, color: "#f0abfc", scatter: { x: 1, y: 1 } },
  { id: "inky", x: 8, y: 6, color: "#67e8f9", scatter: { x: 13, y: 11 } },
  { id: "clyde", x: 7, y: 5, color: "#fdba74", scatter: { x: 1, y: 11 } },
];
const PACMAN_DIRECTIONS = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];
const PACMAN_START = { x: 7, y: 1 };
const PACMAN_TILE_SIZE = 28;
const PACMAN_WALLS = PACMAN_MAP.flatMap((row, y) => [...row].map((cell, x) => cell === "#" ? { x, y } : null).filter(Boolean));
const PACMAN_PELLET_POSITIONS = PACMAN_MAP.flatMap((row, y) => [...row].map((cell, x) => cell === "." ? `${x},${y}` : null).filter(Boolean));
const PACMAN_TILE_CENTERS = new Map(
  PACMAN_MAP.flatMap((row, y) => [...row].flatMap((cell, x) => cell === "#" ? [] : [[`${x},${y}`, { x: x * PACMAN_TILE_SIZE + PACMAN_TILE_SIZE / 2, y: y * PACMAN_TILE_SIZE + PACMAN_TILE_SIZE / 2 }]])),
);

function createPacmanState(level, score = 0, lives = 3) {
  const pellets = new Set();
  PACMAN_MAP.forEach((row, y) => [...row].forEach((cell, x) => { if (cell === ".") pellets.add(`${x},${y}`); }));
  const powerPellets = new Set(PACMAN_POWER_STARTS.map(({ x, y }) => `${x},${y}`));
  powerPellets.forEach((position) => pellets.delete(position));
  pellets.delete(`${PACMAN_START.x},${PACMAN_START.y}`);
  const pelletTotal = pellets.size + powerPellets.size;
  return {
    player: { ...PACMAN_START },
    direction: { x: 1, y: 0 },
    ghosts: PACMAN_GHOSTS.map((ghost) => ({ ...ghost, home: { x: ghost.x, y: ghost.y }, returning: false })),
    pellets,
    powerPellets,
    pelletTotal,
    score,
    lives,
    powerTicks: 0,
    ghostCombo: 0,
    fruit: null,
    fruitTicks: 0,
    fruitCount: 0,
    status: "ready",
    mode: "SCATTER",
    level,
  };
}

function pacmanStep(point, direction) {
  let x = point.x + direction.x;
  const y = point.y + direction.y;
  if (y === 6 && x < 0) x = PACMAN_MAP[0].length - 1;
  if (y === 6 && x >= PACMAN_MAP[0].length) x = 0;
  if (PACMAN_MAP[y]?.[x] === "#") return null;
  return { x, y };
}

function pacmanNeighbors(point) {
  return PACMAN_DIRECTIONS.map((direction) => pacmanStep(point, direction)).filter(Boolean);
}

function nearestPacmanOpen(point) {
  const target = {
    x: Math.max(0, Math.min(PACMAN_MAP[0].length - 1, point.x)),
    y: Math.max(0, Math.min(PACMAN_MAP.length - 1, point.y)),
  };
  if (PACMAN_MAP[target.y]?.[target.x] !== "#") return target;
  let nearest = PACMAN_START;
  let distance = Infinity;
  PACMAN_MAP.forEach((row, y) => [...row].forEach((cell, x) => {
    const nextDistance = Math.abs(x - target.x) + Math.abs(y - target.y);
    if (cell !== "#" && nextDistance < distance) {
      nearest = { x, y };
      distance = nextDistance;
    }
  }));
  return nearest;
}

const PACMAN_ROUTES = (() => {
  const routes = new Map();
  PACMAN_MAP.forEach((row, y) => [...row].forEach((cell, x) => {
    if (cell === "#") return;
    const target = { x, y };
    const targetKey = `${x},${y}`;
    const nextSteps = new Map([[targetKey, target]]);
    const queue = [target];
    for (let index = 0; index < queue.length; index += 1) {
      const current = queue[index];
      for (const next of pacmanNeighbors(current)) {
        const nextKey = `${next.x},${next.y}`;
        if (nextSteps.has(nextKey)) continue;
        nextSteps.set(nextKey, current);
        queue.push(next);
      }
    }
    routes.set(targetKey, nextSteps);
  }));
  return routes;
})();

function pacmanPathStep(start, requestedTarget) {
  const target = nearestPacmanOpen(requestedTarget);
  const startKey = `${start.x},${start.y}`;
  const targetKey = `${target.x},${target.y}`;
  if (startKey === targetKey) return start;
  return PACMAN_ROUTES.get(targetKey)?.get(startKey) || pacmanNeighbors(start)[0] || start;
}

function pacmanGhostTarget(ghost, player, direction, redGhost, scatterMode) {
  if (ghost.returning) return ghost.home;
  if (scatterMode) return ghost.scatter;
  if (ghost.id === "blinky") return player;
  if (ghost.id === "pinky") return { x: player.x + direction.x * 4, y: player.y + direction.y * 4 };
  if (ghost.id === "inky") {
    const ahead = { x: player.x + direction.x * 2, y: player.y + direction.y * 2 };
    return { x: ahead.x * 2 - redGhost.x, y: ahead.y * 2 - redGhost.y };
  }
  const distance = Math.abs(ghost.x - player.x) + Math.abs(ghost.y - player.y);
  return distance > 6 ? player : ghost.scatter;
}

function movePacmanGhost(ghost, player, direction, redGhost, scatterMode, frightened) {
  if (ghost.returning && ghost.x === ghost.home.x && ghost.y === ghost.home.y) return { ...ghost, returning: false };
  const choices = pacmanNeighbors(ghost);
  if (!choices.length) return ghost;
  let next;
  if (frightened && !ghost.returning) {
    const farthest = Math.max(...choices.map((point) => Math.abs(point.x - player.x) + Math.abs(point.y - player.y)));
    const safest = choices.filter((point) => Math.abs(point.x - player.x) + Math.abs(point.y - player.y) === farthest);
    next = safest[Math.floor(Math.random() * safest.length)];
  } else {
    const target = pacmanGhostTarget(ghost, player, direction, redGhost, scatterMode);
    next = pacmanPathStep(ghost, target);
  }
  const returning = ghost.returning && (next.x !== ghost.home.x || next.y !== ghost.home.y);
  return { ...ghost, ...next, returning };
}

function pacmanPlayerArc(x, y, direction, mouth) {
  const angle = Math.atan2(direction.y, direction.x);
  const radius = 8;
  const start = { x: x + Math.cos(angle + mouth) * radius, y: y + Math.sin(angle + mouth) * radius };
  const end = { x: x + Math.cos(angle - mouth) * radius, y: y + Math.sin(angle - mouth) * radius };
  return {
    arc: `M ${start.x} ${start.y} A ${radius} ${radius} 0 1 0 ${end.x} ${end.y}`,
    upper: `M ${x} ${y} L ${start.x} ${start.y}`,
    lower: `M ${x} ${y} L ${end.x} ${end.y}`,
  };
}

function PacmanGame({ difficulty, level, onBack, onLevelAdvance }) {
  const [game, setGame] = useState(() => createPacmanState(level));
  const desiredDirection = useRef({ x: 0, y: 0 });
  const ticks = useRef(0);
  const pace = Math.max(60, ({ easy: 130, medium: 105, hard: 80 }[difficulty]) - (level - 1) * 2);
  const ghostInterval = Math.max(1, ({ easy: 4, medium: 3, hard: 2 }[difficulty]) - Math.floor((level - 1) / 4));
  const reset = () => {
    setGame(createPacmanState(level));
    desiredDirection.current = { x: 0, y: 0 };
    ticks.current = 0;
  };
  useEffect(reset, [difficulty]);
  useEffect(() => {
    if (game.status !== "won") return undefined;
    const timer = window.setTimeout(() => {
      setGame((current) => createPacmanState(level + 1, current.score, current.lives));
      desiredDirection.current = { x: 0, y: 0 };
      ticks.current = 0;
      onLevelAdvance();
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [game.status, level, onLevelAdvance]);

  const move = (x, y) => {
    if (game.status === "lost" || game.status === "won" || game.status === "paused") return;
    desiredDirection.current = { x, y };
    if (game.status === "ready") setGame((current) => ({ ...current, status: "running" }));
  };
  const togglePause = () => {
    setGame((current) => current.status === "running" ? { ...current, status: "paused" } : current.status === "paused" ? { ...current, status: "running" } : current);
  };
  const onKeyDown = (event) => {
    if (event.key.toLowerCase() === "p") {
      event.preventDefault();
      togglePause();
      return;
    }
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const directions = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
    if (!directions[key]) return;
    event.preventDefault();
    move(...directions[key]);
  };

  useEffect(() => {
    if (game.status !== "running") return undefined;
    const timer = window.setInterval(() => {
      ticks.current += 1;
      setGame((current) => {
        if (current.status !== "running") return current;
        const requestedDirection = desiredDirection.current;
        let direction = current.direction;
        let player = current.player;
        const requestedStep = pacmanStep(player, requestedDirection);
        if (requestedStep) {
          player = requestedStep;
          direction = requestedDirection;
        } else {
          player = pacmanStep(player, direction) || player;
        }

        const positionKey = `${player.x},${player.y}`;
        const atePellet = current.pellets.has(positionKey);
        const atePower = current.powerPellets.has(positionKey);
        const pellets = atePellet ? new Set(current.pellets) : current.pellets;
        const powerPellets = atePower ? new Set(current.powerPellets) : current.powerPellets;
        if (atePellet) pellets.delete(positionKey);
        if (atePower) powerPellets.delete(positionKey);
        const powerTicks = atePower ? 55 : Math.max(0, current.powerTicks - 1);
        const scatterMode = Math.floor(ticks.current / 70) % 2 === 0;
        const previousGhosts = current.ghosts;
        let ghosts = current.ghosts;
        if (ticks.current % ghostInterval === 0) {
          const redGhost = current.ghosts.find((ghost) => ghost.id === "blinky") || current.ghosts[0];
          ghosts = current.ghosts.map((ghost) => movePacmanGhost(ghost, player, direction, redGhost, scatterMode, powerTicks > 0));
        }

        let score = current.score + (atePellet ? 10 : 0) + (atePower ? 50 : 0);
        let ghostCombo = atePower ? 0 : current.ghostCombo;
        let fruit = current.fruit;
        let fruitTicks = current.fruitTicks > 0 ? current.fruitTicks - 1 : 0;
        let fruitCount = current.fruitCount;
        if (fruitTicks === 0) fruit = null;
        if (fruit && fruit.x === player.x && fruit.y === player.y) {
          score += 100 * level;
          fruit = null;
          fruitTicks = 0;
        }
        const fruitThresholds = [Math.floor(current.pelletTotal * 0.65), Math.floor(current.pelletTotal * 0.3)];
        if (!fruit && fruitCount < fruitThresholds.length && pellets.size + powerPellets.size <= fruitThresholds[fruitCount]) {
          fruit = { x: 7, y: 9 };
          fruitTicks = 42;
          fruitCount += 1;
        }

        const collisions = ghosts.filter((ghost, index) => {
          if (ghost.returning) return false;
          const sameTile = ghost.x === player.x && ghost.y === player.y;
          const crossed = previousGhosts[index].x === player.x && previousGhosts[index].y === player.y &&
            ghost.x === current.player.x && ghost.y === current.player.y;
          return sameTile || crossed;
        });
        if (collisions.length && powerTicks > 0) {
          const caught = new Set(collisions.map((ghost) => ghost.id));
          ghosts = ghosts.map((ghost) => caught.has(ghost.id) ? { ...ghost, returning: true } : ghost);
          score += 200 * 2 ** Math.min(ghostCombo, 3) * collisions.length;
          ghostCombo += collisions.length;
        } else if (collisions.length) {
          const lives = current.lives - 1;
          return {
            ...current,
            player: { ...PACMAN_START },
            direction: { x: 1, y: 0 },
            ghosts: PACMAN_GHOSTS.map((ghost) => ({ ...ghost, home: { x: ghost.x, y: ghost.y }, returning: false })),
            pellets,
            powerPellets,
            score,
            lives: Math.max(0, lives),
            powerTicks: 0,
            ghostCombo: 0,
            fruit,
            fruitTicks,
            fruitCount,
            status: lives <= 0 ? "lost" : "running",
          };
        }

        const cleared = pellets.size === 0 && powerPellets.size === 0;
        return {
          ...current,
          player,
          direction,
          ghosts,
          pellets,
          powerPellets,
          score,
          lives: current.lives,
          powerTicks,
          ghostCombo,
          fruit,
          fruitTicks,
          fruitCount,
          mode: powerTicks > 0 ? "POWER" : scatterMode ? "SCATTER" : "CHASE",
          status: cleared ? "won" : "running",
        };
      });
    }, pace);
    return () => window.clearInterval(timer);
  }, [game.status, difficulty, level, pace]);

  const tileCenter = (x, y) => PACMAN_TILE_CENTERS.get(`${x},${y}`);
  const playerCenter = tileCenter(game.player.x, game.player.y);
  const playerArc = pacmanPlayerArc(0, 0, game.direction, 0.42);
  const width = PACMAN_MAP[0].length * PACMAN_TILE_SIZE;
  const height = PACMAN_MAP.length * PACMAN_TILE_SIZE;

  return (
    <GameFrame
      title="Pac-Man"
      description="Collect every pellet. Power up, evade the ghost crew, and carry your score through each new maze."
      status={game.status}
      metrics={[
        { label: "LEVEL", value: level },
        { label: "SCORE", value: game.score.toLocaleString() },
        { label: "LIVES", value: game.lives },
        { label: "DOTS", value: game.pellets.size + game.powerPellets.size },
        { label: "MODE", value: game.mode },
      ]}
      onBack={onBack}
      onRestart={reset}
      onKeyDown={onKeyDown}
      controls="Arrow keys / WASD to move. P pauses or resumes. Collect small dots for 10 points and power pellets for 50. Powered-up ghosts can be eaten for bonus points. The tunnel wraps across the center row."
    >
      <div className="mx-auto w-fit">
        <svg
          role="img"
          aria-label={`Pac-Man maze, level ${level}, ${game.pellets.size + game.powerPellets.size} dots remaining`}
          viewBox={`0 0 ${width} ${height}`}
          className="block h-auto max-w-full"
          style={{ width }}
        >
          <rect x="1" y="1" width={width - 2} height={height - 2} fill="none" stroke="#1e293b" strokeWidth="1.5" />
          {PACMAN_WALLS.map(({ x, y }) => (
            <rect
              key={`wall-${x}-${y}`}
              x={x * PACMAN_TILE_SIZE + 3}
              y={y * PACMAN_TILE_SIZE + 3}
              width={PACMAN_TILE_SIZE - 6}
              height={PACMAN_TILE_SIZE - 6}
              rx="5"
              fill="none"
              stroke="#22d3ee"
              strokeOpacity="0.7"
              strokeWidth="1.5"
            />
          ))}
          {PACMAN_PELLET_POSITIONS.map((position) => {
            if (!game.pellets.has(position)) return null;
            const [x, y] = position.split(",").map(Number);
            const center = tileCenter(x, y);
            return <circle key={`dot-${position}`} cx={center.x} cy={center.y} r="1.7" fill="none" stroke="#a1a1aa" strokeWidth="1.2" />;
          })}
          {[...game.powerPellets].map((position) => {
            const [x, y] = position.split(",").map(Number);
            const center = tileCenter(x, y);
            return <circle key={`power-${position}`} cx={center.x} cy={center.y} r="5" fill="none" stroke="#facc15" strokeWidth="1.8" />;
          })}
          {game.fruit && (() => {
            const center = tileCenter(game.fruit.x, game.fruit.y);
            return (
              <g fill="none" stroke="#fb7185" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
                <path d={`M ${center.x} ${center.y - 2} Q ${center.x + 2} ${center.y - 9} ${center.x + 7} ${center.y - 8} M ${center.x + 3} ${center.y - 7} Q ${center.x + 7} ${center.y - 12} ${center.x + 10} ${center.y - 8}`} />
                <circle cx={center.x - 3} cy={center.y + 2} r="3.5" />
                <circle cx={center.x + 3} cy={center.y + 2} r="3.5" />
              </g>
            );
          })()}
          {game.ghosts.map((ghost) => {
            const center = tileCenter(ghost.x, ghost.y);
            const ghostColor = ghost.returning ? "#c4b5fd" : game.powerTicks > 0 ? "#60a5fa" : ghost.color;
            const radius = 8;
            return (
              <g
                key={ghost.id}
                transform={`translate(${center.x} ${center.y})`}
                fill="none"
                stroke={ghostColor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              >
                <path d={`M ${-radius} ${radius} V 0 a ${radius} ${radius} 0 0 1 ${radius * 2} 0 V ${radius} l -4 -3 l -4 3 l -4 -3 l -4 3 Z`} />
                <circle cx="-3" cy="-1" r="1.3" />
                <circle cx="3" cy="-1" r="1.3" />
              </g>
            );
          })}
          <g
            transform={`translate(${playerCenter.x} ${playerCenter.y})`}
            fill="none"
            stroke="#facc15"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
            aria-label="Pac-Man"
          >
            <path d={playerArc.arc} />
            <path d={playerArc.upper} />
            <path d={playerArc.lower} />
          </g>
        </svg>
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={togglePause}
            disabled={game.status !== "running" && game.status !== "paused"}
            aria-pressed={game.status === "paused"}
            className="rounded border border-white/10 px-3 py-1.5 font-mono text-xs text-zinc-400 transition hover:border-cyan-400/25 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {game.status === "paused" ? "$ resume" : "$ pause"}
          </button>
        </div>
        <GamePad onMove={move} />
        {game.status === "ready" && <p className="mt-4 text-center font-mono text-xs text-zinc-600">// steer with arrows · collect every outlined dot</p>}
        {game.status === "paused" && <p role="status" className="mt-4 text-center font-mono text-sm text-amber-300">// paused · press P to resume</p>}
        {game.status === "won" && <p role="status" className="mt-4 text-center font-mono text-sm text-emerald-300">maze cleared — loading level {level + 1}…</p>}
        {game.status === "lost" && <p role="status" className="mt-4 text-center font-mono text-sm text-rose-300">all lives used — restart to try this level again</p>}
      </div>
    </GameFrame>
  );
}

const ARENA_SIZE = 11;
const ARENA_ENEMY_STARTS = [{ x: 9, y: 9 }, { x: 9, y: 1 }, { x: 1, y: 9 }, { x: 7, y: 9 }, { x: 9, y: 7 }];
const DIRECTIONS = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];

function isArenaWall(x, y) {
  return x < 0 || y < 0 || x >= ARENA_SIZE || y >= ARENA_SIZE || (x % 2 === 0 && y % 2 === 0);
}

function findSafeArenaSpawn(flames, crates, bombs, enemies) {
  for (let y = 1; y < ARENA_SIZE - 1; y += 1) {
    for (let x = 1; x < ARENA_SIZE - 1; x += 1) {
      const occupied = (items) => items.some((item) => item.x === x && item.y === y);
      if (!isArenaWall(x, y) && !occupied(flames) && !occupied(crates) && !occupied(bombs) && !occupied(enemies)) return { x, y };
    }
  }
  return { x: 1, y: 1 };
}

const BOMBER_POWERUPS = {
  flame: { symbol: "+", label: "BLAST RANGE", color: "text-orange-300" },
  bomb: { symbol: "B", label: "BOMB CAPACITY", color: "text-cyan-300" },
  speed: { symbol: "»", label: "SPEED BOOTS", color: "text-lime-300" },
};

function createBomberState(difficulty, level) {
  const enemyStarts = ARENA_ENEMY_STARTS.slice(0, Math.min(5, level + (difficulty === "easy" ? 0 : difficulty === "medium" ? 1 : 2)));
  const crates = [];
  for (let y = 1; y < ARENA_SIZE - 1; y += 1) {
    for (let x = 1; x < ARENA_SIZE - 1; x += 1) {
      const spawnArea = (x <= 2 && y <= 2) || enemyStarts.some((enemy) => Math.abs(enemy.x - x) + Math.abs(enemy.y - y) <= 1);
      if (!isArenaWall(x, y) && !spawnArea && (x * 7 + y * 11 + level) % 4 !== 0) {
        crates.push({ x, y, drop: Math.random() < 0.32 ? Object.keys(BOMBER_POWERUPS)[Math.floor(Math.random() * 3)] : null });
      }
    }
  }
  if (crates.length) crates[0].drop = crates[0].drop || "flame";
  return {
    player: { x: 1, y: 1 },
    crates,
    enemies: enemyStarts.map((position) => ({ ...position })),
    bombs: [],
    flames: [],
    powerups: [],
    blastRange: 2,
    bombCapacity: 1,
    speed: 0,
    score: 0,
    lives: 3,
    invulnerability: 0,
    status: "ready",
  };
}

function Bomberman({ difficulty, level, onBack, onLevelAdvance }) {
  const [game, setGame] = useState(() => createBomberState(difficulty, level));
  const ticks = useRef(0);
  const lastMoveAt = useRef(0);
  const pace = { easy: 230, medium: 175, hard: 130 }[difficulty];
  useAutomaticLevelAdvance(game.status, onLevelAdvance);
  const reset = () => {
    setGame(createBomberState(difficulty, level));
    ticks.current = 0;
    lastMoveAt.current = 0;
  };
  useEffect(reset, [difficulty, level]);
  const move = (dx, dy) => {
    const now = performance.now();
    if (now - lastMoveAt.current < Math.max(50, 125 - game.speed * 22)) return;
    lastMoveAt.current = now;
    setGame((current) => {
      if (current.status === "won" || current.status === "lost") return current;
      const next = { x: current.player.x + dx, y: current.player.y + dy };
      const blocked = isArenaWall(next.x, next.y) ||
        current.crates.some((item) => item.x === next.x && item.y === next.y) ||
        current.bombs.some((item) => item.x === next.x && item.y === next.y) ||
        current.flames.some((item) => item.x === next.x && item.y === next.y);
      if (blocked) return { ...current, status: "running" };
      const pickupIndex = current.powerups.findIndex((item) => item.x === next.x && item.y === next.y);
      if (pickupIndex < 0) return { ...current, player: next, status: "running" };
      const pickup = current.powerups[pickupIndex];
      const powerups = current.powerups.filter((_, index) => index !== pickupIndex);
      const upgrades = pickup.type === "flame"
        ? { blastRange: Math.min(8, current.blastRange + 1) }
        : pickup.type === "bomb"
          ? { bombCapacity: Math.min(5, current.bombCapacity + 1) }
          : { speed: Math.min(3, current.speed + 1) };
      return { ...current, ...upgrades, player: next, powerups, score: current.score + 50, status: "running" };
    });
  };
  const placeBomb = () => {
    setGame((current) => {
      if (current.status === "won" || current.status === "lost" || current.bombs.length >= current.bombCapacity || current.bombs.some((bomb) => bomb.x === current.player.x && bomb.y === current.player.y)) return current;
      return { ...current, bombs: [...current.bombs, { ...current.player, fuse: 8, range: current.blastRange }], status: "running" };
    });
  };
  const onKeyDown = (event) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const directions = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
    if (directions[key]) {
      event.preventDefault();
      move(...directions[key]);
    } else if (event.code === "Space") {
      event.preventDefault();
      placeBomb();
    }
  };
  useEffect(() => {
    if (game.status !== "running") return undefined;
    const timer = window.setInterval(() => {
      ticks.current += 1;
      setGame((current) => {
        if (current.status !== "running") return current;
        const tickingBombs = current.bombs.map((bomb, id) => ({ ...bomb, id, fuse: bomb.fuse - 1 }));
        const detonated = new Set();
        const pending = tickingBombs.filter((bomb) => bomb.fuse <= 0).map((bomb) => bomb.id);
        const blastCells = new Map();
        const destroyedCrates = new Set();
        const droppedPowerups = [];
        let score = current.score;
        while (pending.length) {
          const bombId = pending.shift();
          if (detonated.has(bombId)) continue;
          detonated.add(bombId);
          const bomb = tickingBombs[bombId];
          const addBlast = (x, y) => blastCells.set(`${x},${y}`, { x, y, ttl: 3 });
          addBlast(bomb.x, bomb.y);
          DIRECTIONS.forEach((direction) => {
            for (let step = 1; step <= bomb.range; step += 1) {
              const x = bomb.x + direction.x * step;
              const y = bomb.y + direction.y * step;
              if (isArenaWall(x, y)) break;
              addBlast(x, y);
              tickingBombs.forEach((otherBomb) => {
                if (!detonated.has(otherBomb.id) && otherBomb.x === x && otherBomb.y === y && !pending.includes(otherBomb.id)) pending.push(otherBomb.id);
              });
              const crate = current.crates.find((item) => item.x === x && item.y === y);
              if (crate) {
                const crateKey = `${x},${y}`;
                if (!destroyedCrates.has(crateKey)) {
                  destroyedCrates.add(crateKey);
                  score += 10;
                  if (crate.drop) droppedPowerups.push({ x, y, type: crate.drop });
                }
                break;
              }
            }
          });
        }
        const bombs = tickingBombs.filter((bomb) => !detonated.has(bomb.id)).map(({ id, ...bomb }) => bomb);
        const crates = current.crates.filter((crate) => !destroyedCrates.has(`${crate.x},${crate.y}`));
        const newFlames = [...blastCells.values()];
        const flames = [...current.flames.filter((flame) => flame.ttl > 1).map((flame) => ({ ...flame, ttl: flame.ttl - 1 })), ...newFlames];
        const flameAtPoint = (point) => flames.some((flame) => flame.x === point.x && flame.y === point.y);
        const enemiesHit = current.enemies.filter(flameAtPoint);
        let enemies = current.enemies.filter((enemy) => !flameAtPoint(enemy));
        score += enemiesHit.length * 100;
        let powerups = [...current.powerups, ...droppedPowerups];
        let blastRange = current.blastRange;
        let bombCapacity = current.bombCapacity;
        let speed = current.speed;
        let player = current.player;
        let lives = current.lives;
        let invulnerability = Math.max(0, current.invulnerability - 1);
        const playerHit = invulnerability === 0 && (flameAtPoint(player) || enemies.some((enemy) => enemy.x === player.x && enemy.y === player.y));
        if (playerHit) {
          lives -= 1;
          player = findSafeArenaSpawn(flames, crates, bombs, enemies);
          invulnerability = 8;
        }
        if (lives <= 0) return { ...current, player, crates, bombs, flames, enemies, powerups, lives: 0, score, invulnerability: 0, status: "lost" };

        const moveEnemies = ticks.current % Math.max(1, difficulty === "easy" ? 5 : difficulty === "medium" ? 3 : 2) === 0;
        if (moveEnemies) {
          enemies = enemies.map((enemy, index) => {
            const choices = DIRECTIONS
              .map(({ x, y }) => ({ x: enemy.x + x, y: enemy.y + y }))
              .filter((point) => !isArenaWall(point.x, point.y) &&
                !crates.some((crate) => crate.x === point.x && crate.y === point.y) &&
                !bombs.some((bomb) => bomb.x === point.x && bomb.y === point.y) &&
                !flameAtPoint(point) &&
                !enemies.some((other, otherIndex) => otherIndex !== index && other.x === point.x && other.y === point.y));
            if (!choices.length) return enemy;
            const next = choices[Math.floor(Math.random() * choices.length)];
            return next;
          });
        }
        const pickupIndex = powerups.findIndex((item) => item.x === player.x && item.y === player.y);
        if (pickupIndex >= 0) {
          const pickup = powerups[pickupIndex];
          powerups = powerups.filter((_, index) => index !== pickupIndex);
          score += 50;
          if (pickup.type === "flame") blastRange = Math.min(8, blastRange + 1);
          else if (pickup.type === "bomb") bombCapacity = Math.min(5, bombCapacity + 1);
          else speed = Math.min(3, speed + 1);
        }
        return { ...current, player, crates, bombs, flames, enemies, powerups, blastRange, bombCapacity, speed, lives, score, invulnerability, status: enemies.length === 0 ? "won" : "running" };
      });
    }, pace);
    return () => window.clearInterval(timer);
  }, [game.status, difficulty, level, pace]);
  const flameAt = (x, y) => game.flames.some((flame) => flame.x === x && flame.y === y);
  const enemyAt = (x, y) => game.enemies.some((enemy) => enemy.x === x && enemy.y === y);
  const crateAt = (x, y) => game.crates.some((crate) => crate.x === x && crate.y === y);
  const powerupAt = (x, y) => game.powerups.find((powerup) => powerup.x === x && powerup.y === y);
  return (
    <GameFrame title="Bomberman" description="Blast through soft blocks, collect hidden upgrades, and outlast the enemy crew." status={game.status} metrics={[{ label: "SCORE", value: game.score }, { label: "ENEMIES", value: game.enemies.length }, { label: "LIVES", value: game.lives }, { label: "RANGE", value: game.blastRange }, { label: "BOMBS", value: `${game.bombs.length}/${game.bombCapacity}` }]} onBack={onBack} onRestart={reset} onKeyDown={onKeyDown} controls="WASD/arrows move. Space drops a bomb. Bombs chain-react and blast in four directions, stopping at blocks. Find hidden + (range), B (bomb capacity), and » (speed) upgrades.">
      <div className="mx-auto w-fit">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-zinc-500">
          <span>UPGRADES <span className="text-orange-300">+ range</span> <span className="text-cyan-300">B bombs</span> <span className="text-lime-300">» speed</span></span>
          <span>{game.speed ? `SPEED ${game.speed + 1}×` : "SPEED 1×"}</span>
        </div>
        <div role="grid" aria-label="Bomberman arena" className="grid gap-px border border-white/10 bg-white/10 p-px" style={{ gridTemplateColumns: `repeat(${ARENA_SIZE}, 1.7rem)` }}>
          {Array.from({ length: ARENA_SIZE * ARENA_SIZE }, (_, index) => {
            const x = index % ARENA_SIZE;
            const y = Math.floor(index / ARENA_SIZE);
            const wall = isArenaWall(x, y);
            const isPlayer = game.player.x === x && game.player.y === y;
            const bomb = game.bombs.find((item) => item.x === x && item.y === y);
            const hasBomb = Boolean(bomb);
            const hasFlame = flameAt(x, y);
            const hasEnemy = enemyAt(x, y);
            const hasCrate = crateAt(x, y);
            const powerup = powerupAt(x, y);
            const symbol = wall ? "▓" : isPlayer ? "@" : hasBomb ? "●" : hasFlame ? "*" : hasEnemy ? "E" : powerup ? BOMBER_POWERUPS[powerup.type].symbol : hasCrate ? "▒" : "·";
            const label = wall ? "solid wall" : isPlayer ? "player" : bomb ? `bomb, fuse ${bomb.fuse}` : hasFlame ? "active explosion" : hasEnemy ? "enemy" : powerup ? `${BOMBER_POWERUPS[powerup.type].label} power-up` : hasCrate ? "destructible block" : "empty floor";
            const color = wall ? "bg-zinc-800 text-zinc-600" : isPlayer ? hasBomb ? "bg-rose-400/30 text-rose-100" : game.invulnerability > 0 ? "bg-emerald-200 text-zinc-950" : "bg-emerald-300 text-zinc-950" : hasBomb ? "bg-rose-400/20 text-rose-300" : hasFlame ? "bg-amber-300/20 text-amber-200" : hasEnemy ? "bg-fuchsia-400/15 text-fuchsia-300" : powerup ? `bg-white/5 ${BOMBER_POWERUPS[powerup.type].color}` : hasCrate ? "bg-amber-900/40 text-amber-600" : "bg-[#0a0c11] text-zinc-800";
            return <span key={index} role="gridcell" aria-label={label} className={`grid h-[1.7rem] w-[1.7rem] place-items-center font-mono text-xs ${hasBomb ? "animate-pulse" : ""} ${color}`}>{symbol}</span>;
          })}
        </div>
        <GamePad onMove={move} onAction={placeBomb} actionLabel="BOMB" />
        {game.status === "ready" && <p className="mt-4 text-center font-mono text-xs text-zinc-600">// move or place a bomb to begin</p>}
        {game.status === "won" && <p role="status" className="mt-4 text-center font-mono text-sm text-emerald-300">arena cleared — deploying level {level + 1}…</p>}
      </div>
    </GameFrame>
  );
}

function ByteControlButton({ label, onPress, onRelease }) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        onPress();
      }}
      onPointerUp={onRelease}
      onPointerCancel={onRelease}
      className="touch-none select-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-zinc-200 active:border-cyan-300/40 active:bg-cyan-300/10"
    >
      {label}
    </button>
  );
}

function ByteBrawl({ setup, onSetup, onMenu, difficulty, ...props }) {
  if (!setup) return <ByteBrawlSetup onStart={onSetup} onBack={props.onBack} />;
  if (setup.mode === "online") return <ByteBrawlOnline ui={{ GameFrame, ByteControlButton }} difficulty={difficulty} onExit={onMenu} />;
  return <ByteBrawlMatch setup={setup} difficulty={difficulty} onMenu={onMenu} {...props} />;
}

function ByteBrawlMatch({ setup, difficulty, level, onBack, onMenu, onLevelAdvance }) {
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
      controls="A/D or ←/→ move. W, ↑, or Space jumps (twice in the air). S or ↓ drops through a platform. Hold J, K, Z, or Enter to fire. P pauses. Hits add damage, and more damage means more knockback — lose a stock when you leave the screen. Pick up crates for SMG, shotgun, sniper, and launcher."
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
              <p className="mt-1 text-sm text-zinc-300">Kernel Panic is down. Every mission is cleared.</p>
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

function GameCard({ game, onPlay }) {
  return (
    <article className="group flex min-h-56 flex-col rounded-xl border border-white/10 bg-[#0b0d12] p-5 transition-all duration-200 ease-out hover:-translate-y-1 hover:border-cyan-400/25 hover:bg-[#0e1118]">
      <div className="mb-5 flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-lg border border-cyan-400/20 bg-cyan-400/5 font-mono text-lg text-cyan-300">
          {game.icon === "pacman" ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 8.5A9 9 0 1 0 20.5 12" />
              <path d="M12 12 19 8M12 12l8 3" />
            </svg>
          ) : game.icon === "platform" ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 19h7m4 0h7M5 19v-5l4-3 3 2 3-6 4 3v9" />
              <circle cx="12" cy="5" r="2" />
            </svg>
          ) : game.icon === "bomb" ? "*" : game.icon === "snake" ? ">" : "#"}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">v1.0 / playable</span>
      </div>
      <h2 className="font-mono text-lg font-semibold text-zinc-100">{game.name}</h2>
      <p className="mt-2 flex-1 text-sm leading-6 text-zinc-400">{game.description}</p>
      <button type="button" onClick={onPlay} className="mt-5 flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-xs text-zinc-300 transition hover:border-cyan-400/25 hover:bg-cyan-400/5 hover:text-cyan-200">
        <span><span className="text-emerald-400">$</span> launch {game.id}</span>
        <span aria-hidden="true">-&gt;</span>
      </button>
    </article>
  );
}

export default function ArcadePage({ onBack }) {
  const [selectedGame, setSelectedGame] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [level, setLevel] = useState(1);
  const [brawlSetup, setBrawlSetup] = useState(null);
  const chosenGame = GAMES.find((game) => game.id === selectedGame);
  const returnToGames = useCallback(() => {
    setSelectedGame("");
    setBrawlSetup(null);
    setLevel(1);
  }, []);
  const onLevelAdvance = useCallback(() => setLevel((current) => current + 1), []);
  const startBrawl = useCallback((setup, startLevel) => {
    setBrawlSetup(setup);
    setLevel(startLevel);
  }, []);
  const brawlMenu = useCallback(() => {
    setBrawlSetup(null);
    setLevel(1);
  }, []);
  const gameProps = { difficulty, level, onBack: returnToGames, onLevelAdvance, setup: brawlSetup, onSetup: startBrawl, onMenu: brawlMenu };
  const Game = selectedGame === "minesweeper" ? Minesweeper : selectedGame === "bomberman" ? Bomberman : selectedGame === "pacman" ? PacmanGame : selectedGame === "code-arena" ? ByteBrawl : SnakeGame;
  const gameKey = selectedGame === "pacman" ? `${selectedGame}-${difficulty}` : `${selectedGame}-${difficulty}-${level}`;

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 flex items-center gap-2 font-mono text-xs text-zinc-500">
            <Icon name="gamepad" className="h-4 w-4 text-cyan-300" />
            <span className="text-emerald-400">developer.arcade</span><span>/</span><span>games</span>
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{chosenGame ? chosenGame.name : "The Code Arcade"}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            {chosenGame ? chosenGame.description : "Five local games, rebuilt as a terminal playground. Pick a difficulty and play through progressively harder levels."}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          {onBack && (
            <button type="button" onClick={onBack} className="h-10 rounded-lg border border-white/10 px-3 font-mono text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white">
              &lt; studio
            </button>
          )}
          <label className="grid gap-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            Difficulty
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="h-10 rounded-lg border border-white/10 bg-[#0b0d12] px-3 text-xs normal-case tracking-normal text-zinc-200 outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20">
              {DIFFICULTIES.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      {selectedGame ? (
        <div className="rounded-2xl border border-white/10 bg-[#090b10]/90 p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
            <span className="rounded border border-cyan-400/20 bg-cyan-400/5 px-2 py-1 text-cyan-200">{difficulty}</span>
            <span className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-zinc-400">level {level}</span>
            <span className={`ml-auto ${DIFFICULTIES.find((item) => item.id === difficulty)?.color}`}>difficulty: {difficulty}</span>
          </div>
          <Game key={gameKey} {...gameProps} />
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2 font-mono text-xs text-zinc-600">
            <span className="text-emerald-400">user@blocksmith</span><span>:</span><span className="text-cyan-300">~/arcade</span><span>$ ls -la ./games</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {GAMES.map((game) => <GameCard key={game.id} game={game} onPlay={() => setSelectedGame(game.id)} />)}
          </div>
          <p className="mt-6 border-t border-white/5 pt-4 font-mono text-[11px] text-zinc-600">
            // all games run locally in your browser · no accounts, assets, or network calls required
          </p>
        </>
      )}
    </main>
  );
}
