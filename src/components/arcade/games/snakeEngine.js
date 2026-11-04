// Pure Snake logic: no React, no DOM. All state lives in a mutable "world" object.
// Movement is on a fixed grid with a fixed tick; the renderer interpolates between ticks using world.acc / world.tickMs.

export const COLS = 28;
export const ROWS = 18;
export const CELL = 28;
export const BOARD_W = COLS * CELL;
export const BOARD_H = ROWS * CELL;
export const HUD_H = 60;
export const WIDTH = BOARD_W;
export const HEIGHT = BOARD_H + HUD_H;

const CELLS = COLS * ROWS;
const CAP = CELLS + 1;
const SPAWN_Y = 9;
const QUEUE_MAX = 3;
const START_LENGTH = 3;
const MAX_START_LENGTH = 8;
const COMBO_WINDOW = 3200;
const MAX_COMBO = 5;
const TURBO_MS = 5000;
const SLEEP_MS = 5000;
const TURBO_FACTOR = 0.65;
const SLEEP_FACTOR = 1.5;
const GC_SEGMENTS = 3;
const PARTICLES = 48;
const POPUPS = 4;

export const SPARK_COLORS = ["cyan", "amber", "sky", "violet", "teal", "pink", "rose", "lime"];
const SPARK = { cyan: 0, amber: 1, sky: 2, violet: 3, teal: 4, pink: 5, rose: 6, lime: 7 };

export const DIFFICULTY = {
  easy: { wrap: true, tick: 130, min: 84 },
  medium: { wrap: false, tick: 108, min: 70 },
  hard: { wrap: false, tick: 90, min: 58 },
};

export const SPECIALS = {
  bonus: { label: "BONUS", glyph: "$", color: "amber", ttl: 9000, weight: 36 },
  turbo: { label: "TURBO", glyph: ">>", color: "sky", ttl: 11000, weight: 22 },
  sleep: { label: "SLEEP", glyph: "zz", color: "violet", ttl: 11000, weight: 16 },
  gc: { label: "GC", glyph: "-3", color: "teal", ttl: 11000, weight: 16 },
  commit: { label: "GIT COMMIT", glyph: "+1", color: "pink", ttl: 9000, weight: 8 },
};
const SPECIAL_IDS = Object.keys(SPECIALS);

export const HAZARD_NONE = 0;
export const HAZARD_WALL = 1;
export const HAZARD_OBSTACLE = 2;
export const HAZARD_SELF = 3;
const CAUSES = ["", "wall", "obstacle", "yourself"];

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

// Obstacle layouts: [x, y, w, h] rectangles; `mirror` also reflects them across the board axes.
export const LAYOUTS = [
  { name: "EMPTY HEAP", rects: [] },
  { name: "CORNER CACHE", rects: [[2, 2, 4, 1], [2, 2, 1, 4]], mirror: true },
  { name: "TWIN BARS", rects: [[7, 5, 14, 1], [7, 12, 14, 1]] },
  { name: "TUNNELS", rects: [[8, 0, 1, 7], [8, 11, 1, 7], [19, 0, 1, 7], [19, 11, 1, 7]] },
  { name: "CROSSHAIR", rects: [[14, 3, 1, 12], [18, 9, 8, 1]] },
  { name: "MAZE LITE", rects: [[5, 2, 9, 1], [5, 15, 9, 1], [17, 2, 1, 6], [17, 11, 1, 6], [21, 5, 6, 1], [21, 12, 6, 1], [10, 5, 1, 3], [10, 11, 1, 3]] },
  { name: "PILLARS", rects: [[5, 3, 2, 2], [11, 3, 2, 2], [17, 3, 2, 2], [23, 3, 2, 2], [8, 6, 2, 2], [14, 6, 2, 2], [20, 6, 2, 2]], mirrorY: true },
  { name: "BRACKETS", rects: [[3, 3, 8, 1], [3, 3, 1, 5]], mirror: true },
];

export function levelTarget(level) {
  return 8 + 2 * level;
}

export function baseTickMs(difficulty, level) {
  const config = DIFFICULTY[difficulty] || DIFFICULTY.easy;
  return Math.max(config.min, config.tick - (Math.max(1, level) - 1) * 5);
}

function fillRect(blocked, x, y, w, h) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      if (xx >= 0 && xx < COLS && yy >= 0 && yy < ROWS) blocked[yy * COLS + xx] = 1;
    }
  }
}

function buildObstacles(world, headX, level) {
  const layout = LAYOUTS[(level - 1) % LAYOUTS.length];
  const { blocked } = world;
  for (const [x, y, w, h] of layout.rects) {
    fillRect(blocked, x, y, w, h);
    if (layout.mirror || layout.mirrorY) fillRect(blocked, x, ROWS - y - h, w, h);
    if (layout.mirror) {
      fillRect(blocked, COLS - x - w, y, w, h);
      fillRect(blocked, COLS - x - w, ROWS - y - h, w, h);
    }
  }
  const mines = Math.min(12, Math.floor((level - 1) / LAYOUTS.length) * 3);
  if (mines > 0) {
    const random = mulberry32(level * 7919);
    let placed = 0;
    for (let attempt = 0; attempt < 300 && placed < mines; attempt += 1) {
      const x = Math.floor(random() * COLS);
      const y = Math.floor(random() * ROWS);
      const index = y * COLS + x;
      const nearSpawn = y >= SPAWN_Y - 2 && y <= SPAWN_Y + 2 && x <= headX + 6;
      const crowded = blocked[index] || (x > 0 && blocked[index - 1]) || (x < COLS - 1 && blocked[index + 1]) || (y > 0 && blocked[index - COLS]) || (y < ROWS - 1 && blocked[index + COLS]);
      if (nearSpawn || crowded) continue;
      blocked[index] = 1;
      placed += 1;
    }
  }
  // The spawn lane is always clear so the snake can never start inside or right in front of an obstacle.
  for (let x = 0; x <= Math.min(COLS - 1, headX + 4); x += 1) blocked[SPAWN_Y * COLS + x] = 0;
  return layout;
}

function floodReach(world, startX, startY) {
  const { blocked, reach, wrap } = world;
  const queue = new Int16Array(CELLS);
  let head = 0;
  let tail = 0;
  const first = startY * COLS + startX;
  reach[first] = 1;
  queue[tail++] = first;
  while (head < tail) {
    const index = queue[head++];
    const x = index % COLS;
    const y = (index - x) / COLS;
    for (let d = 0; d < 4; d += 1) {
      let nx = x + (d === 0 ? 1 : d === 1 ? -1 : 0);
      let ny = y + (d === 2 ? 1 : d === 3 ? -1 : 0);
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
        if (!wrap) continue;
        nx = (nx + COLS) % COLS;
        ny = (ny + ROWS) % ROWS;
      }
      const next = ny * COLS + nx;
      if (blocked[next] || reach[next]) continue;
      reach[next] = 1;
      queue[tail++] = next;
    }
  }
}

function buildEdges(world) {
  const { blocked } = world;
  const edges = [];
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      if (!blocked[y * COLS + x]) continue;
      if (y === 0 || !blocked[(y - 1) * COLS + x]) edges.push(x, y, x + 1, y);
      if (y === ROWS - 1 || !blocked[(y + 1) * COLS + x]) edges.push(x, y + 1, x + 1, y + 1);
      if (x === 0 || !blocked[y * COLS + x - 1]) edges.push(x, y, x, y + 1);
      if (x === COLS - 1 || !blocked[y * COLS + x + 1]) edges.push(x + 1, y, x + 1, y + 1);
    }
  }
  return Float32Array.from(edges);
}

export function createSnakeWorld({ difficulty = "easy", level = 1, carry = null, rng = null, seed = null, hi = 0 } = {}) {
  const config = DIFFICULTY[difficulty] || DIFFICULTY.easy;
  const random = rng || (seed !== null ? mulberry32(seed) : Math.random);
  const length = clamp(Math.floor(carry?.length ?? START_LENGTH), START_LENGTH, MAX_START_LENGTH);
  const headX = length + 2;
  const world = {
    difficulty,
    level,
    wrap: config.wrap,
    random,
    target: levelTarget(level),
    eaten: 0,
    status: "ready",
    cause: "",
    score: carry?.score || 0,
    hi: Math.max(hi, carry?.score || 0),
    time: 0,
    blocked: new Uint8Array(CELLS),
    occ: new Uint8Array(CELLS),
    reach: new Uint8Array(CELLS),
    layoutName: "",
    obstacleEdges: null,
    xs: new Int16Array(CAP),
    ys: new Int16Array(CAP),
    cap: CAP,
    head: length - 1,
    len: length,
    dx: 1,
    dy: 0,
    pdx: 1,
    pdy: 0,
    qx: new Int8Array(QUEUE_MAX),
    qy: new Int8Array(QUEUE_MAX),
    qlen: 0,
    grow: 0,
    prevTailX: 0,
    prevTailY: SPAWN_Y,
    acc: 0,
    tickMs: baseTickMs(difficulty, level),
    combo: 1,
    comboMs: 0,
    shield: 0,
    turboMs: 0,
    sleepMs: 0,
    food: { x: -1, y: -1 },
    special: { active: false, type: "", x: -1, y: -1, ttl: 0, maxTtl: 1, born: 0 },
    specialTimer: 6000,
    foodBorn: 0,
    px: new Float32Array(PARTICLES),
    py: new Float32Array(PARTICLES),
    pvx: new Float32Array(PARTICLES),
    pvy: new Float32Array(PARTICLES),
    plife: new Float32Array(PARTICLES),
    pmax: new Float32Array(PARTICLES),
    pcolor: new Uint8Array(PARTICLES),
    pnext: 0,
    popups: Array.from({ length: POPUPS }, () => ({ text: "", x: 0, y: 0, life: 0, max: 1, color: "lime" })),
    popNext: 0,
  };
  for (let i = 0; i < length; i += 1) {
    world.xs[i] = headX - (length - 1 - i);
    world.ys[i] = SPAWN_Y;
    world.occ[SPAWN_Y * COLS + world.xs[i]] = 1;
  }
  world.prevTailX = world.xs[0];
  const layout = buildObstacles(world, headX, level);
  world.layoutName = layout.name;
  world.obstacleEdges = buildEdges(world);
  floodReach(world, headX, SPAWN_Y);
  world.specialTimer = 6000 + random() * 4000;
  spawnFood(world);
  return world;
}

// A cell is free when the snake, obstacles, and pickups are not on it and the snake can reach it.
export function isFreeCell(world, index) {
  if (!world.reach[index] || world.blocked[index] || world.occ[index]) return false;
  const { food, special } = world;
  if (food.x >= 0 && food.y * COLS + food.x === index) return false;
  if (special.active && special.y * COLS + special.x === index) return false;
  return true;
}

export function pickFreeCell(world) {
  let free = 0;
  for (let i = 0; i < CELLS; i += 1) if (isFreeCell(world, i)) free += 1;
  if (free === 0) return -1;
  let pick = Math.min(free - 1, Math.floor(world.random() * free));
  for (let i = 0; i < CELLS; i += 1) {
    if (!isFreeCell(world, i)) continue;
    if (pick === 0) return i;
    pick -= 1;
  }
  return -1;
}

// Places the byte; returns false when the board has no free cell left.
export function spawnFood(world) {
  world.food.x = -1;
  world.food.y = -1;
  const index = pickFreeCell(world);
  if (index < 0) return false;
  world.food.x = index % COLS;
  world.food.y = (index - (index % COLS)) / COLS;
  world.foodBorn = world.time;
  return true;
}

function nextSpecialDelay(world) {
  return 6000 + world.random() * 5000;
}

export function spawnSpecial(world, forcedType = "") {
  let type = forcedType;
  if (!type) {
    let total = 0;
    for (const id of SPECIAL_IDS) total += specialAllowed(world, id) ? SPECIALS[id].weight : 0;
    let roll = world.random() * total;
    type = "bonus";
    for (const id of SPECIAL_IDS) {
      if (!specialAllowed(world, id)) continue;
      roll -= SPECIALS[id].weight;
      if (roll < 0) {
        type = id;
        break;
      }
    }
  }
  const index = pickFreeCell(world);
  const { special } = world;
  if (index < 0) {
    special.active = false;
    world.specialTimer = 1500;
    return false;
  }
  special.active = true;
  special.type = type;
  special.x = index % COLS;
  special.y = (index - special.x) / COLS;
  special.ttl = SPECIALS[type].ttl;
  special.maxTtl = special.ttl;
  special.born = world.time;
  return true;
}

function specialAllowed(world, id) {
  if (id === "commit") return world.shield === 0;
  if (id === "gc") return world.len >= 7;
  return true;
}

function refreshTick(world) {
  const base = baseTickMs(world.difficulty, world.level);
  const next = base * (world.turboMs > 0 ? TURBO_FACTOR : 1) * (world.sleepMs > 0 ? SLEEP_FACTOR : 1);
  if (next === world.tickMs) return;
  world.acc = Math.min(world.acc * (next / world.tickMs), next * 0.999);
  world.tickMs = next;
}

function emitSparks(world, cellX, cellY, count, color) {
  for (let i = 0; i < count; i += 1) {
    const slot = world.pnext;
    world.pnext = (slot + 1) % PARTICLES;
    const angle = world.random() * Math.PI * 2;
    const speed = 0.04 + world.random() * 0.12;
    world.px[slot] = (cellX + 0.5) * CELL;
    world.py[slot] = (cellY + 0.5) * CELL;
    world.pvx[slot] = Math.cos(angle) * speed;
    world.pvy[slot] = Math.sin(angle) * speed;
    world.pmax[slot] = 320 + world.random() * 240;
    world.plife[slot] = world.pmax[slot];
    world.pcolor[slot] = SPARK[color] ?? 0;
  }
}

function popup(world, text, cellX, cellY, color) {
  const slot = world.popups[world.popNext];
  world.popNext = (world.popNext + 1) % POPUPS;
  slot.text = text;
  slot.x = (cellX + 0.5) * CELL;
  slot.y = (cellY + 0.5) * CELL - 14;
  slot.life = 900;
  slot.max = 900;
  slot.color = color;
}

function addScore(world, points) {
  world.score += points;
  if (world.score > world.hi) world.hi = world.score;
}

// Direction request. Returns "started" (began the run), "queued", or "ignored" (reversal/duplicate/queue full/ended).
export function queueTurn(world, dx, dy) {
  if (world.status === "won" || world.status === "lost") return "ignored";
  if (Math.abs(dx) + Math.abs(dy) !== 1) return "ignored";
  const lastX = world.qlen > 0 ? world.qx[world.qlen - 1] : world.dx;
  const lastY = world.qlen > 0 ? world.qy[world.qlen - 1] : world.dy;
  if (world.status === "ready") {
    world.status = "running";
    world.acc = 0;
    if (!(dx === -lastX && dy === -lastY) && !(dx === lastX && dy === lastY)) {
      world.dx = dx;
      world.dy = dy;
      world.pdx = dx;
      world.pdy = dy;
    }
    return "started";
  }
  if (dx === lastX && dy === lastY) return "ignored";
  if (dx === -lastX && dy === -lastY) return "ignored";
  if (world.qlen >= QUEUE_MAX) return "ignored";
  world.qx[world.qlen] = dx;
  world.qy[world.qlen] = dy;
  world.qlen += 1;
  return "queued";
}

function tailCell(world) {
  const index = (world.head - world.len + 1 + world.cap) % world.cap;
  return world.ys[index] * COLS + world.xs[index];
}

function isFoodAt(world, x, y) {
  return world.food.x === x && world.food.y === y;
}

// Classifies the cell the head would enter (x/y may be one step outside the board).
export function cellHazard(world, x, y) {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) {
    if (!world.wrap) return HAZARD_WALL;
    x = (x + COLS) % COLS;
    y = (y + ROWS) % ROWS;
  }
  const index = y * COLS + x;
  if (world.blocked[index]) return HAZARD_OBSTACLE;
  if (world.occ[index]) {
    if (index === tailCell(world) && world.grow <= 0 && !isFoodAt(world, x, y)) return HAZARD_NONE;
    return HAZARD_SELF;
  }
  return HAZARD_NONE;
}

// The shield turns the snake onto a free side lane instead of dying.
function deflect(world) {
  const hx = world.xs[world.head];
  const hy = world.ys[world.head];
  let ax = -world.dy;
  let ay = world.dx;
  let bx = world.dy;
  let by = -world.dx;
  if (world.random() < 0.5) {
    [ax, bx] = [bx, ax];
    [ay, by] = [by, ay];
  }
  let chosenX = 0;
  let chosenY = 0;
  if (cellHazard(world, hx + ax, hy + ay) === HAZARD_NONE) {
    chosenX = ax;
    chosenY = ay;
  } else if (cellHazard(world, hx + bx, hy + by) === HAZARD_NONE) {
    chosenX = bx;
    chosenY = by;
  } else {
    return false;
  }
  world.shield -= 1;
  world.dx = chosenX;
  world.dy = chosenY;
  world.qlen = 0;
  popup(world, "SHIELD!", hx, hy, "pink");
  emitSparks(world, hx, hy, 10, "pink");
  return true;
}

function awardCombo(world) {
  world.combo = world.comboMs > 0 ? Math.min(MAX_COMBO, world.combo + 1) : 1;
  world.comboMs = COMBO_WINDOW;
}

function clearLevel(world) {
  world.status = "won";
  addScore(world, 50 * world.level);
  world.acc = 0;
}

function eatByte(world, x, y, points, color, text) {
  addScore(world, points);
  world.eaten += 1;
  popup(world, text, x, y, color);
  emitSparks(world, x, y, 8, color);
}

function eatSpecial(world, x, y) {
  const { special } = world;
  const type = special.type;
  special.active = false;
  world.specialTimer = nextSpecialDelay(world);
  if (type === "bonus") {
    awardCombo(world);
    world.grow += 2;
    eatByte(world, x, y, 50 * world.combo, "amber", `+${50 * world.combo}`);
  } else if (type === "turbo") {
    world.turboMs = TURBO_MS;
    world.sleepMs = 0;
    addScore(world, 25);
    popup(world, "TURBO +25", x, y, "sky");
    emitSparks(world, x, y, 8, "sky");
  } else if (type === "sleep") {
    world.sleepMs = SLEEP_MS;
    world.turboMs = 0;
    addScore(world, 15);
    popup(world, "SLEEP +15", x, y, "violet");
    emitSparks(world, x, y, 8, "violet");
  } else if (type === "gc") {
    let removed = 0;
    while (removed < GC_SEGMENTS && world.len > START_LENGTH) {
      const index = (world.head - world.len + 1 + world.cap) % world.cap;
      world.occ[world.ys[index] * COLS + world.xs[index]] = 0;
      emitSparks(world, world.xs[index], world.ys[index], 3, "teal");
      world.len -= 1;
      removed += 1;
    }
    const tail = (world.head - world.len + 1 + world.cap) % world.cap;
    world.prevTailX = world.xs[tail];
    world.prevTailY = world.ys[tail];
    addScore(world, 20);
    popup(world, `GC -${removed}`, x, y, "teal");
  } else if (type === "commit") {
    world.shield = 1;
    addScore(world, 30);
    popup(world, "SHIELD +1", x, y, "pink");
    emitSparks(world, x, y, 10, "pink");
  }
  refreshTick(world);
}

function stepTick(world) {
  const { xs, ys } = world;
  world.pdx = world.dx;
  world.pdy = world.dy;
  if (world.qlen > 0) {
    world.dx = world.qx[0];
    world.dy = world.qy[0];
    for (let i = 1; i < world.qlen; i += 1) {
      world.qx[i - 1] = world.qx[i];
      world.qy[i - 1] = world.qy[i];
    }
    world.qlen -= 1;
  }
  const hx = xs[world.head];
  const hy = ys[world.head];
  const hazard = cellHazard(world, hx + world.dx, hy + world.dy);
  if (hazard !== HAZARD_NONE && !(world.shield > 0 && deflect(world))) {
    world.status = "lost";
    world.cause = CAUSES[hazard];
    world.acc = 0;
    emitSparks(world, hx, hy, 14, "rose");
    return;
  }
  let nx = hx + world.dx;
  let ny = hy + world.dy;
  if (nx < 0 || nx >= COLS) nx = (nx + COLS) % COLS;
  if (ny < 0 || ny >= ROWS) ny = (ny + ROWS) % ROWS;

  const ateFood = isFoodAt(world, nx, ny);
  const { special } = world;
  const ateSpecial = special.active && special.x === nx && special.y === ny;
  if (ateFood) world.grow += 1;
  const growing = world.grow > 0;
  const oldTail = (world.head - world.len + 1 + world.cap) % world.cap;
  world.prevTailX = xs[oldTail];
  world.prevTailY = ys[oldTail];
  if (growing) {
    world.grow -= 1;
    world.len += 1;
  } else {
    world.occ[ys[oldTail] * COLS + xs[oldTail]] = 0;
  }
  world.head = (world.head + 1) % world.cap;
  xs[world.head] = nx;
  ys[world.head] = ny;
  world.occ[ny * COLS + nx] = 1;

  if (ateFood) {
    awardCombo(world);
    eatByte(world, nx, ny, 10 * world.combo, "cyan", `+${10 * world.combo}`);
    if (world.eaten >= world.target || !spawnFood(world)) {
      clearLevel(world);
      return;
    }
  } else if (ateSpecial) {
    eatSpecial(world, nx, ny);
    if (world.eaten >= world.target) clearLevel(world);
  }
}

function updateEffects(world, dt) {
  world.time += dt;
  if (world.comboMs > 0) {
    world.comboMs -= dt;
    if (world.comboMs <= 0) {
      world.comboMs = 0;
      world.combo = 1;
    }
  }
  if (world.turboMs > 0 || world.sleepMs > 0) {
    world.turboMs = Math.max(0, world.turboMs - dt);
    world.sleepMs = Math.max(0, world.sleepMs - dt);
    refreshTick(world);
  }
  const { special } = world;
  if (special.active) {
    special.ttl -= dt;
    if (special.ttl <= 0) {
      special.active = false;
      world.specialTimer = nextSpecialDelay(world);
    }
  } else {
    world.specialTimer -= dt;
    if (world.specialTimer <= 0) spawnSpecial(world);
  }
}

function updateParticles(world, dt) {
  for (let i = 0; i < PARTICLES; i += 1) {
    if (world.plife[i] <= 0) continue;
    world.plife[i] -= dt;
    world.px[i] += world.pvx[i] * dt;
    world.py[i] += world.pvy[i] * dt;
  }
  for (let i = 0; i < POPUPS; i += 1) {
    const slot = world.popups[i];
    if (slot.life > 0) slot.life -= dt;
  }
}

// Advances the world by dtMs of real time. Movement happens in whole ticks; world.acc keeps the leftover for rendering.
export function updateSnake(world, dtMs) {
  updateParticles(world, dtMs);
  if (world.status !== "running") return;
  updateEffects(world, dtMs);
  world.acc += dtMs;
  let guard = 0;
  while (world.acc >= world.tickMs && world.status === "running" && guard < 6) {
    world.acc -= world.tickMs;
    stepTick(world);
    guard += 1;
  }
  if (guard === 6) world.acc = 0;
}

// Interpolation factor (0..1) for rendering between the previous and current tick.
export function snakeAlpha(world) {
  return world.status === "running" ? Math.min(1, world.acc / world.tickMs) : 1;
}

export function snakeHud(world) {
  return {
    level: world.level,
    layout: world.layoutName,
    bytes: world.eaten,
    target: world.target,
    score: world.score,
    hi: world.hi,
    length: world.len,
    combo: world.combo,
    comboPct: world.comboMs / COMBO_WINDOW,
    shield: world.shield,
    turbo: Math.ceil(world.turboMs / 1000),
    sleep: Math.ceil(world.sleepMs / 1000),
    speed: Math.round((10000 / world.tickMs)) / 10,
  };
}

// State carried into the next level (total score and a snake-length bonus).
export function snakeCarry(world) {
  return {
    score: world.score,
    length: clamp(Math.ceil(world.len / 2), START_LENGTH, MAX_START_LENGTH),
  };
}

export const COMBO_WINDOW_MS = COMBO_WINDOW;
