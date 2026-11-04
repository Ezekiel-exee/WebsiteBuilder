// Pure Minesweeper rules. No React, no DOM: everything is typed arrays so it is cheap and unit-testable.
export const HIDDEN = 0;
export const OPEN = 1;
export const FLAG = 2;

export const MAX_ROWS = 16;
export const MAX_COLS = 30;
export const MAX_CANVAS_W = 960;
export const MAX_CANVAS_H = 640;
export const MIN_CANVAS_W = 640;
export const HUD_H = 72;
export const FOOTER_H = 34;
export const MAX_CELL = 44;
const SIDE_PAD = 16;

const BASE_DENSITY = { easy: 0.12, medium: 0.16, hard: 0.2 };
const MAX_DENSITY = 0.32;

// Board size and mine count for a difficulty + 1-based level. Level 1 is always 9x9.
export function boardSpec(difficulty, level) {
  const lvl = Math.max(1, Math.floor(level) || 1);
  const rows = Math.min(MAX_ROWS, 8 + lvl);
  const cols = Math.min(MAX_COLS, 7 + 2 * lvl);
  const cells = rows * cols;
  const base = BASE_DENSITY[difficulty] ?? BASE_DENSITY.easy;
  const density = Math.min(MAX_DENSITY, base + Math.min(lvl - 1, 10) * 0.005);
  const mines = Math.max(1, Math.min(Math.round(cells * density), cells - 9));
  return { rows, cols, mines };
}

// Pixel layout that keeps the whole canvas within ~960x640 logical pixels.
export function boardLayout(rows, cols) {
  const cell = Math.max(
    16,
    Math.floor(Math.min(MAX_CELL, (MAX_CANVAS_W - SIDE_PAD * 2) / cols, (MAX_CANVAS_H - HUD_H - FOOTER_H) / rows)),
  );
  const boardW = cell * cols;
  const boardH = cell * rows;
  const width = Math.max(MIN_CANVAS_W, boardW + SIDE_PAD * 2);
  const height = HUD_H + boardH + FOOTER_H;
  return { cell, boardW, boardH, width, height, ox: Math.floor((width - boardW) / 2), oy: HUD_H };
}

export function createGame(rows, cols, mines, rng = Math.random) {
  const n = rows * cols;
  return {
    rows,
    cols,
    n,
    mines: Math.min(mines, n - 1),
    mine: new Uint8Array(n),
    adj: new Uint8Array(n),
    cell: new Uint8Array(n),
    stack: new Int32Array(n),
    fresh: new Int32Array(n),
    freshCount: 0,
    placed: false,
    result: "playing",
    revealed: 0,
    flags: 0,
    exploded: -1,
    elapsed: 0,
    rng,
  };
}

function neighborIndexes(game, index, out) {
  const { rows, cols } = game;
  const x = index % cols;
  const y = (index - x) / cols;
  let count = 0;
  for (let dy = -1; dy <= 1; dy += 1) {
    const ny = y + dy;
    if (ny < 0 || ny >= rows) continue;
    for (let dx = -1; dx <= 1; dx += 1) {
      const nx = x + dx;
      if ((dx === 0 && dy === 0) || nx < 0 || nx >= cols) continue;
      out[count] = ny * cols + nx;
      count += 1;
    }
  }
  return count;
}

const scratch = new Int32Array(8);
const floodScratch = new Int32Array(8);

// Mines are placed on the first reveal so that tile and all its neighbours are guaranteed safe.
function placeMines(game, safeIndex) {
  const exclude = new Uint8Array(game.n);
  exclude[safeIndex] = 1;
  const count = neighborIndexes(game, safeIndex, scratch);
  for (let i = 0; i < count; i += 1) exclude[scratch[i]] = 1;
  let pool = [];
  for (let i = 0; i < game.n; i += 1) if (!exclude[i]) pool.push(i);
  if (pool.length < game.mines) {
    pool = [];
    for (let i = 0; i < game.n; i += 1) if (i !== safeIndex) pool.push(i);
  }
  for (let i = 0; i < game.mines; i += 1) {
    const pick = i + Math.floor(game.rng() * (pool.length - i));
    const chosen = pool[pick];
    pool[pick] = pool[i];
    pool[i] = chosen;
    game.mine[chosen] = 1;
  }
  for (let i = 0; i < game.n; i += 1) {
    if (game.mine[i]) continue;
    const around = neighborIndexes(game, i, scratch);
    let total = 0;
    for (let k = 0; k < around; k += 1) total += game.mine[scratch[k]];
    game.adj[i] = total;
  }
  game.placed = true;
}

// Opens one hidden tile, flood-filling through zeros. Returns true when that tile is a mine.
function openCell(game, index) {
  if (game.cell[index] !== HIDDEN) return false;
  if (game.mine[index]) {
    game.cell[index] = OPEN;
    if (game.exploded < 0) game.exploded = index;
    return true;
  }
  const stack = game.stack;
  let top = 0;
  game.cell[index] = OPEN;
  game.revealed += 1;
  game.fresh[game.freshCount] = index;
  game.freshCount += 1;
  if (game.adj[index] === 0) {
    stack[top] = index;
    top += 1;
  }
  while (top > 0) {
    top -= 1;
    const current = stack[top];
    const around = neighborIndexes(game, current, floodScratch);
    for (let k = 0; k < around; k += 1) {
      const next = floodScratch[k];
      if (game.cell[next] !== HIDDEN || game.mine[next]) continue;
      game.cell[next] = OPEN;
      game.revealed += 1;
      game.fresh[game.freshCount] = next;
      game.freshCount += 1;
      if (game.adj[next] === 0) {
        stack[top] = next;
        top += 1;
      }
    }
  }
  return false;
}

function finish(game, hitMine) {
  if (hitMine) {
    game.result = "lost";
    return "boom";
  }
  if (game.revealed === game.n - game.mines) {
    game.result = "won";
    for (let i = 0; i < game.n; i += 1) if (game.mine[i]) game.cell[i] = FLAG;
    game.flags = game.mines;
    return "won";
  }
  return "ok";
}

// Returns "noop" | "ok" | "boom" | "won". `game.fresh[0..freshCount)` lists tiles opened by the last action.
export function revealCell(game, index) {
  game.freshCount = 0;
  if (game.result !== "playing" || index < 0 || index >= game.n || game.cell[index] !== HIDDEN) return "noop";
  if (!game.placed) placeMines(game, index);
  return finish(game, openCell(game, index));
}

export function toggleFlag(game, index) {
  if (game.result !== "playing" || index < 0 || index >= game.n || game.cell[index] === OPEN) return false;
  if (game.cell[index] === FLAG) {
    game.cell[index] = HIDDEN;
    game.flags -= 1;
  } else {
    game.cell[index] = FLAG;
    game.flags += 1;
  }
  return true;
}

export function flagsAround(game, index) {
  const around = neighborIndexes(game, index, scratch);
  let total = 0;
  for (let k = 0; k < around; k += 1) if (game.cell[scratch[k]] === FLAG) total += 1;
  return total;
}

export function canChord(game, index) {
  return game.result === "playing" && index >= 0 && index < game.n && game.cell[index] === OPEN && game.adj[index] > 0 && flagsAround(game, index) === game.adj[index];
}

// Opens every unflagged neighbour of a satisfied number. Wrong flags can make this explode, as in the classic game.
export function chordCell(game, index) {
  game.freshCount = 0;
  if (!canChord(game, index)) return "noop";
  const targets = [];
  const around = neighborIndexes(game, index, scratch);
  for (let k = 0; k < around; k += 1) if (game.cell[scratch[k]] === HIDDEN) targets.push(scratch[k]);
  if (targets.length === 0) return "noop";
  let hit = false;
  for (let k = 0; k < targets.length; k += 1) if (openCell(game, targets[k])) hit = true;
  return finish(game, hit);
}

export function tickTimer(game, dt) {
  if (game.result === "playing" && game.placed) game.elapsed += dt;
}

export function moveIndex(game, index, dx, dy) {
  const x = Math.min(game.cols - 1, Math.max(0, (index % game.cols) + dx));
  const y = Math.min(game.rows - 1, Math.max(0, Math.floor(index / game.cols) + dy));
  return y * game.cols + x;
}

export function levelBonus(game) {
  const par = Math.floor(game.n * 1.5);
  return 200 + game.mines * 20 + Math.max(0, par - Math.floor(game.elapsed)) * 2;
}

export function formatTime(seconds, tenths = false) {
  if (!Number.isFinite(seconds)) return "--:--";
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  const base = `${minutes}:${rest < 10 ? "0" : ""}${rest}`;
  return tenths ? `${base}.${Math.floor((seconds - whole) * 10)}` : base;
}
