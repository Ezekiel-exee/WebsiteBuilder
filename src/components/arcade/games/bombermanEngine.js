// Pure Bomberman game logic: no React, no DOM. Rendering lives in bombermanRender.js.
// Coordinates: grid cells are 0-indexed (border walls at x/y = 0 and COLS-1/ROWS-1, pillars on even/even interior cells,
// start corner at cell (1, 1)). Entity positions are pixel centers in field space (TILE px per cell).

export const TILE = 40;
export const COLS = 31;
export const ROWS = 13;
export const CELLS = COLS * ROWS;
export const VIEW_COLS = 17;
export const VIEW_W = VIEW_COLS * TILE;
export const FIELD_W = COLS * TILE;
export const FIELD_H = ROWS * TILE;
export const HUD_H = 60;
export const CANVAS_W = VIEW_W;
export const CANVAS_H = HUD_H + FIELD_H;
export const STEP = 1 / 60;

export const FUSE_TIME = 2.0;
export const REMOTE_FUSE = 10;
export const FLAME_TIME = 0.5;
export const BASE_TIME = 200;
export const HALF = 14;
const DEATH_TIME = 1.5;
const RESPAWN_INVULN = 3;
const START_INVULN = 2;
const MYSTERY_TIME = 20;
const MAX_FIRE = 8;
const MAX_BOMBS = 6;
const MAX_SPEED = 5;
const PLAYER_BASE_SPEED = 130;
const PLAYER_SPEED_STEP = 20;
const PLAYER_HIT_RADIUS = 22;

export const FLOOR = 0;
export const HARD = 1;
export const SOFT = 2;
export const DX = [0, 1, 0, -1];
export const DY = [-1, 0, 1, 0];

export const DIFFICULTY_RULES = {
  easy: { lives: 4, time: 1.2, enemySpeed: 0.85, extraEnemies: 0, overdue: 4 },
  medium: { lives: 3, time: 1.0, enemySpeed: 1.0, extraEnemies: 0, overdue: 5 },
  hard: { lives: 2, time: 0.85, enemySpeed: 1.15, extraEnemies: 1, overdue: 6 },
};

export const POWERUPS = {
  fire: { id: "fire", label: "FIRE", glyph: "F", color: "#fb7185", blurb: "Flames reach +1 tile (kept after death)" },
  bomb: { id: "bomb", label: "BOMB", glyph: "B", color: "#fbbf24", blurb: "Carry +1 bomb at a time (kept after death)" },
  speed: { id: "speed", label: "SPEED", glyph: "S", color: "#a3e635", blurb: "Move faster (kept after death)" },
  wallpass: { id: "wallpass", label: "WALL-PASS", glyph: "W", color: "#c084fc", blurb: "Walk through soft blocks (lost on death)" },
  detonator: { id: "detonator", label: "DETONATOR", glyph: "D", color: "#22d3ee", blurb: "Bombs wait for K / Enter, oldest first (lost on death)" },
  bombpass: { id: "bombpass", label: "BOMB-PASS", glyph: "P", color: "#fb923c", blurb: "Walk through bombs (lost on death)" },
  flamepass: { id: "flamepass", label: "FLAME-PASS", glyph: "X", color: "#f472b6", blurb: "Immune to flames (lost on death)" },
  mystery: { id: "mystery", label: "MYSTERY", glyph: "?", color: "#2dd4bf", blurb: "Rare: 20 seconds of invincibility (lost on death)" },
};
export const POWERUP_ORDER = ["fire", "bomb", "speed", "wallpass", "detonator", "bombpass", "flamepass", "mystery"];

// Hidden power-up per stage (index = (stage - 1) % length).
const STAGE_POWERUPS = ["fire", "bomb", "speed", "detonator", "fire", "bomb", "wallpass", "speed", "bombpass", "fire", "flamepass", "detonator", "bomb", "speed", "mystery", "fire"];

export const ENEMY_TYPES = {
  bug: { id: "bug", name: "BUG", color: "#a3e635", speed: 46, score: 100, hp: 1, passSoft: false, chase: false, straight: 0.7, blurb: "slow random wanderer" },
  leak: { id: "leak", name: "LEAK", color: "#38bdf8", speed: 64, score: 200, hp: 1, passSoft: false, chase: false, straight: 0.4, blurb: "faster wanderer, turns often" },
  spider: { id: "spider", name: "SPIDER", color: "#c084fc", speed: 72, score: 400, hp: 1, passSoft: false, chase: true, range: 8, noise: 0.12, straight: 0.5, blurb: "hunts you within 8 tiles" },
  ghost: { id: "ghost", name: "GHOST", color: "#e2e8f0", speed: 40, score: 800, hp: 1, passSoft: true, chase: true, range: 6, noise: 0.35, straight: 0.6, blurb: "slow, drifts through soft blocks" },
  glitch: { id: "glitch", name: "GLITCH", color: "#fbbf24", speed: 100, score: 1000, hp: 1, passSoft: false, chase: false, straight: 0.25, erratic: true, blurb: "fast and erratic" },
  daemon: { id: "daemon", name: "DAEMON", color: "#fb7185", speed: 112, score: 2000, hp: 1, passSoft: true, chase: true, range: 999, noise: 0.04, straight: 0.5, blurb: "overdue! fast, ignores soft blocks, hunts you" },
  boss: { id: "boss", name: "SEGFAULT", color: "#f87171", speed: 58, score: 3000, hp: 3, passSoft: false, chase: true, range: 12, noise: 0.2, straight: 0.5, blurb: "boss: needs several hits" },
};
export const ENEMY_ORDER = ["bug", "leak", "spider", "ghost", "glitch", "daemon", "boss"];

export const AREAS = [
  { name: "BOOT", accent: "#22d3ee" },
  { name: "KERNEL", accent: "#a3e635" },
  { name: "CACHE", accent: "#c084fc" },
  { name: "NETWORK", accent: "#fbbf24" },
  { name: "DATABASE", accent: "#38bdf8" },
  { name: "CLOUD", accent: "#f472b6" },
  { name: "COMPILER", accent: "#fb923c" },
  { name: "ROOT", accent: "#2dd4bf" },
];

const ROSTERS = [
  [["bug", 3]],
  [["bug", 3], ["leak", 1]],
  [["bug", 2], ["leak", 3]],
  [["bug", 2], ["leak", 1], ["boss", 1]],
  [["leak", 3], ["spider", 1]],
  [["bug", 2], ["leak", 2], ["spider", 2]],
  [["leak", 3], ["spider", 2], ["glitch", 1]],
  [["leak", 2], ["spider", 2], ["boss", 1]],
  [["spider", 2], ["ghost", 1], ["leak", 2]],
  [["leak", 2], ["spider", 2], ["ghost", 2]],
  [["ghost", 2], ["spider", 2], ["glitch", 2]],
  [["ghost", 2], ["glitch", 1], ["spider", 1], ["boss", 1]],
];

export function stageLabel(level) {
  const index = Math.max(0, level - 1);
  return `${Math.floor(index / 4) + 1}-${(index % 4) + 1}`;
}

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

// Deterministic per-stage definition. Stages 1-12 use hand-written rosters; later ones loop and scale.
export function stageInfo(level, difficulty = "medium") {
  const n = Math.max(1, Math.floor(level) || 1);
  const rules = DIFFICULTY_RULES[difficulty] || DIFFICULTY_RULES.medium;
  const area = Math.floor((n - 1) / 4) + 1;
  const areaStyle = AREAS[(area - 1) % AREAS.length];
  const extra = Math.floor((n - 1) / ROSTERS.length);
  const roster = ROSTERS[(n - 1) % ROSTERS.length].map((entry) => [entry[0], entry[1]]);
  if (extra > 0) {
    const add = (type, count) => {
      const found = roster.find((entry) => entry[0] === type);
      if (found) found[1] += count;
      else roster.push([type, count]);
    };
    add("spider", Math.min(extra, 3));
    add("ghost", Math.min(extra, 3));
    add("glitch", Math.min(extra, 4));
  }
  if (rules.extraEnemies > 0) {
    const first = roster.find((entry) => entry[0] !== "boss") || roster[0];
    first[1] += rules.extraEnemies;
  }
  const isBoss = roster.some((entry) => entry[0] === "boss");
  return {
    level: n,
    label: stageLabel(n),
    area,
    areaName: areaStyle.name,
    accent: areaStyle.accent,
    seed: (Math.imul(n, 2654435761) ^ 0x9e3779b9) >>> 0,
    density: Math.min(0.62, 0.42 + 0.015 * (n - 1)),
    powerup: STAGE_POWERUPS[(n - 1) % STAGE_POWERUPS.length],
    roster,
    boss: isBoss,
    bossHp: 3 + Math.min(4, Math.floor((n - 1) / 8)),
    enemyCount: roster.reduce((sum, entry) => sum + entry[1], 0),
    timeLimit: Math.round(BASE_TIME * rules.time),
    speedScale: rules.enemySpeed * (1 + Math.min(0.25, (n - 1) * 0.008)),
  };
}

export function freshCarry(difficulty = "medium") {
  const rules = DIFFICULTY_RULES[difficulty] || DIFFICULTY_RULES.medium;
  return { score: 0, lives: rules.lives, fire: 1, bombs: 1, speed: 0, detonator: false, wallpass: false, bombpass: false, flamepass: false, mystery: 0 };
}

export function cloneCarry(carry) {
  return { ...carry };
}

export function extrasEarned(score) {
  if (score >= 60000) return 3 + Math.floor((score - 60000) / 50000);
  if (score >= 30000) return 2;
  if (score >= 10000) return 1;
  return 0;
}

// Pure layout generator: returns tiles plus the door / power-up cells (always under soft blocks).
export function generateLayout(info) {
  const rng = mulberry32(info.seed);
  const tiles = new Uint8Array(CELLS);
  const soft = [];
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const index = y * COLS + x;
      if (x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1 || (x % 2 === 0 && y % 2 === 0)) tiles[index] = HARD;
      else if (x + y <= 3) tiles[index] = FLOOR;
      else if (rng() < info.density) {
        tiles[index] = SOFT;
        soft.push(index);
      }
    }
  }
  const far = soft.filter((index) => (index % COLS) + Math.floor(index / COLS) >= 14);
  const doorPool = far.length ? far : soft;
  const doorIndex = doorPool[Math.floor(rng() * doorPool.length)];
  const itemPool = soft.filter((index) => index !== doorIndex && (index % COLS) + Math.floor(index / COLS) >= 6);
  const itemIndex = itemPool[Math.floor(rng() * itemPool.length)];
  return { tiles, doorIndex, itemIndex, softCount: soft.length };
}

function makeEnemy(world, type, tx, ty) {
  const cfg = ENEMY_TYPES[type];
  const hp = type === "boss" ? world.info.bossHp : cfg.hp;
  return {
    type,
    tx,
    ty,
    nx: tx,
    ny: ty,
    prog: 0,
    moving: false,
    dx: 0,
    dy: 0,
    x: (tx + 0.5) * TILE,
    y: (ty + 0.5) * TILE,
    speed: cfg.speed * world.info.speedScale,
    hp,
    maxHp: hp,
    invuln: 0,
    dyingT: 0,
    alive: true,
    phase: world.rng() * 6.283,
    wait: 0.4 + world.rng() * 0.6,
    anim: world.rng() * 3,
  };
}

function addEnemy(world, type, tx, ty) {
  const enemy = makeEnemy(world, type, tx, ty);
  world.enemies.push(enemy);
  world.foes += 1;
  return enemy;
}

function cellPassableForSpawn(world, index, passSoft) {
  const tile = world.tiles[index];
  return tile === FLOOR || (passSoft && tile === SOFT);
}

function placeEnemies(world) {
  const rng = mulberry32(world.info.seed ^ 0x5bd1e995);
  const strict = [];
  const loose = [];
  for (let y = 1; y < ROWS - 1; y += 1) {
    for (let x = 1; x < COLS - 1; x += 1) {
      const index = y * COLS + x;
      if (world.tiles[index] !== FLOOR || x + y < 9) continue;
      let open = 0;
      for (let d = 0; d < 4; d += 1) if (world.tiles[(y + DY[d]) * COLS + x + DX[d]] === FLOOR) open += 1;
      (open > 0 ? strict : loose).push(index);
    }
  }
  const pick = () => {
    const pool = strict.length ? strict : loose;
    if (!pool.length) return -1;
    const at = Math.floor(rng() * pool.length);
    const index = pool[at];
    pool[at] = pool[pool.length - 1];
    pool.pop();
    return index;
  };
  for (const [type, count] of world.info.roster) {
    for (let i = 0; i < count; i += 1) {
      const index = pick();
      if (index < 0) return;
      addEnemy(world, type, index % COLS, Math.floor(index / COLS));
    }
  }
}

function newPlayer(carry) {
  return {
    x: 1.5 * TILE,
    y: 1.5 * TILE,
    stepping: false,
    ox: 1,
    oy: 1,
    tx: 1,
    ty: 1,
    face: 2,
    moving: false,
    walk: 0,
    state: "alive",
    deathT: 0,
    invuln: START_INVULN,
    fire: carry.fire,
    bombs: carry.bombs,
    speed: carry.speed,
    detonator: carry.detonator,
    wallpass: carry.wallpass,
    bombpass: carry.bombpass,
    flamepass: carry.flamepass,
    mystery: carry.mystery,
  };
}

export function createBomberman(level, difficulty = "medium", carryIn = null) {
  const info = stageInfo(level, difficulty);
  const carry = carryIn ? cloneCarry(carryIn) : freshCarry(difficulty);
  const layout = generateLayout(info);
  const timeMax = info.timeLimit;
  const world = {
    level: info.level,
    difficulty,
    info,
    rng: mulberry32(info.seed ^ 0x2545f491),
    clock: 0,
    result: "running",
    tiles: layout.tiles,
    flame: new Float32Array(CELLS),
    flameMask: new Uint8Array(CELLS),
    pending: new Uint8Array(CELLS),
    bombGrid: new Array(CELLS).fill(null),
    bombs: [],
    enemies: [],
    fx: [],
    foes: 0,
    exit: { idx: layout.doorIndex, x: layout.doorIndex % COLS, y: Math.floor(layout.doorIndex / COLS), revealed: false, cool: 0, spawned: 0 },
    item: { type: info.powerup, idx: layout.itemIndex, x: layout.itemIndex % COLS, y: Math.floor(layout.itemIndex / COLS), revealed: false, taken: false, gone: false },
    player: newPlayer(carry),
    score: carry.score,
    lives: carry.lives,
    timeMax,
    timeLeft: timeMax,
    timeUp: false,
    timeUpBanner: 0,
    clearBonus: 0,
    kills: 0,
    deaths: 0,
    fieldWalk: new Int16Array(CELLS),
    fieldGhost: new Int16Array(CELLS),
    fieldTimer: 0,
    queue: new Int16Array(CELLS),
    explodeQueue: [],
    cam: 0,
    msg: "",
    msgT: 0,
  };
  placeEnemies(world);
  world.cam = cameraTarget(world.player);
  return world;
}

export function carryFromWorld(world) {
  const p = world.player;
  return { score: world.score, lives: world.lives, fire: p.fire, bombs: p.bombs, speed: p.speed, detonator: p.detonator, wallpass: p.wallpass, bombpass: p.bombpass, flamepass: p.flamepass, mystery: Math.max(0, p.mystery) };
}

function cameraTarget(player) {
  return Math.max(0, Math.min(FIELD_W - VIEW_W, player.x - VIEW_W / 2));
}

export function playerSpeed(p) {
  return PLAYER_BASE_SPEED + PLAYER_SPEED_STEP * p.speed;
}

function addFx(world, kind, x, y, color, life, text = "", r = 0) {
  const fx = world.fx;
  if (fx.length >= 60) fx.shift();
  fx.push({ kind, x, y, color, life, t: 0, text, r });
}

function awardScore(world, amount, x, y, color = "#e2e8f0") {
  const before = extrasEarned(world.score);
  world.score += amount;
  if (x !== undefined) addFx(world, "text", x, y, color, 0.9, `+${amount}`);
  const gained = extrasEarned(world.score) - before;
  if (gained > 0) {
    world.lives += gained;
    addFx(world, "text", world.player.x, world.player.y - 30, "#a3e635", 1.4, "1UP");
  }
}

// ---------- tiles & collisions ----------

function playerBlocked(world, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true;
  const index = ty * COLS + tx;
  const tile = world.tiles[index];
  if (tile === HARD) return true;
  const p = world.player;
  if (tile === SOFT && !p.wallpass) return true;
  const bomb = world.bombGrid[index];
  return bomb !== null && bomb.solid && !p.bombpass;
}

function overlapsTile(p, tx, ty) {
  return p.x + HALF > tx * TILE && p.x - HALF < (tx + 1) * TILE && p.y + HALF > ty * TILE && p.y - HALF < (ty + 1) * TILE;
}

// ---------- bombs & flames ----------

export function placeBomb(world) {
  const p = world.player;
  if (p.state !== "alive" || world.result !== "running") return false;
  if (world.bombs.length >= p.bombs) return false;
  const tx = Math.floor(p.x / TILE);
  const ty = Math.floor(p.y / TILE);
  const index = ty * COLS + tx;
  if (world.tiles[index] !== FLOOR || world.bombGrid[index]) return false;
  const bomb = { x: tx, y: ty, idx: index, fuse: p.detonator ? REMOTE_FUSE : FUSE_TIME, power: p.fire, remote: p.detonator, solid: false, queued: false, age: 0 };
  world.bombGrid[index] = bomb;
  world.bombs.push(bomb);
  return true;
}

export function detonate(world) {
  const p = world.player;
  if (!p.detonator || p.state !== "alive" || !world.bombs.length) return false;
  explodeBomb(world, world.bombs[0]);
  return true;
}

function setFlame(world, index, mask) {
  world.flame[index] = FLAME_TIME;
  world.flameMask[index] |= mask;
}

function destroyBlock(world, index) {
  world.tiles[index] = FLOOR;
  if (index === world.exit.idx || index === world.item.idx) world.pending[index] = 1;
  const x = (index % COLS + 0.5) * TILE;
  const y = (Math.floor(index / COLS) + 0.5) * TILE;
  addFx(world, "ring", x, y, "#94a3b8", 0.4, "", 8);
}

// Detonates `first` and every bomb its flames touch. Flames stop at hard walls and at the first soft block (which is destroyed).
function explodeBomb(world, first) {
  const queue = world.explodeQueue;
  queue.length = 0;
  first.queued = true;
  queue.push(first);
  while (queue.length) {
    const bomb = queue.pop();
    world.bombGrid[bomb.idx] = null;
    const at = world.bombs.indexOf(bomb);
    if (at >= 0) world.bombs.splice(at, 1);
    setFlame(world, bomb.idx, 15);
    addFx(world, "ring", (bomb.x + 0.5) * TILE, (bomb.y + 0.5) * TILE, "#fbbf24", 0.35, "", 10);
    for (let d = 0; d < 4; d += 1) {
      const back = 1 << ((d + 2) % 4);
      const forward = 1 << d;
      for (let i = 1; i <= bomb.power; i += 1) {
        const cx = bomb.x + DX[d] * i;
        const cy = bomb.y + DY[d] * i;
        const index = cy * COLS + cx;
        const tile = world.tiles[index];
        if (tile === HARD) {
          if (i === 1) world.flameMask[bomb.idx] &= ~forward;
          break;
        }
        const last = i === bomb.power;
        if (tile === SOFT) {
          destroyBlock(world, index);
          setFlame(world, index, back);
          break;
        }
        const other = world.bombGrid[index];
        if (other) {
          setFlame(world, index, back);
          if (!other.queued) {
            other.queued = true;
            queue.push(other);
          }
          break;
        }
        setFlame(world, index, last ? back : back | forward);
      }
    }
  }
}

// ---------- enemies ----------

function enemyCanEnter(world, enemy, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return false;
  const index = ty * COLS + tx;
  const tile = world.tiles[index];
  if (tile === HARD) return false;
  if (tile === SOFT && !ENEMY_TYPES[enemy.type].passSoft) return false;
  return world.bombGrid[index] === null;
}

const candidates = new Int8Array(4);
const forwardOnly = new Int8Array(4);

function chooseDirection(world, enemy) {
  const cfg = ENEMY_TYPES[enemy.type];
  let all = 0;
  let forward = 0;
  const hasDir = enemy.dx !== 0 || enemy.dy !== 0;
  for (let d = 0; d < 4; d += 1) {
    if (!enemyCanEnter(world, enemy, enemy.tx + DX[d], enemy.ty + DY[d])) continue;
    candidates[all] = d;
    all += 1;
    if (!(hasDir && DX[d] === -enemy.dx && DY[d] === -enemy.dy)) {
      forwardOnly[forward] = d;
      forward += 1;
    }
  }
  if (all === 0) return false;
  let chosen = -1;
  if (cfg.chase && world.player.state === "alive") {
    const field = cfg.passSoft ? world.fieldGhost : world.fieldWalk;
    const here = field[enemy.ty * COLS + enemy.tx];
    if (here >= 0 && here <= cfg.range && world.rng() >= cfg.noise) {
      let best = 32767;
      for (let i = 0; i < all; i += 1) {
        const d = candidates[i];
        const value = field[(enemy.ty + DY[d]) * COLS + enemy.tx + DX[d]];
        if (value >= 0 && value < best) {
          best = value;
          chosen = d;
        }
      }
    }
  }
  if (chosen < 0) {
    const allowReverse = forward === 0 || (cfg.erratic && world.rng() < 0.2);
    const count = allowReverse ? all : forward;
    const list = allowReverse ? candidates : forwardOnly;
    let straight = -1;
    if (hasDir && world.rng() < cfg.straight) {
      for (let i = 0; i < count; i += 1) {
        if (DX[list[i]] === enemy.dx && DY[list[i]] === enemy.dy) straight = list[i];
      }
    }
    chosen = straight >= 0 ? straight : list[Math.floor(world.rng() * count)];
  }
  enemy.dx = DX[chosen];
  enemy.dy = DY[chosen];
  enemy.nx = enemy.tx + enemy.dx;
  enemy.ny = enemy.ty + enemy.dy;
  return true;
}

function computeField(world, field, passSoft, sx, sy) {
  field.fill(-1);
  const queue = world.queue;
  let head = 0;
  let tail = 0;
  const start = sy * COLS + sx;
  field[start] = 0;
  queue[tail] = start;
  tail += 1;
  while (head < tail) {
    const index = queue[head];
    head += 1;
    const x = index % COLS;
    const y = (index - x) / COLS;
    const next = field[index] + 1;
    for (let d = 0; d < 4; d += 1) {
      const nx = x + DX[d];
      const ny = y + DY[d];
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
      const nIndex = ny * COLS + nx;
      if (field[nIndex] >= 0) continue;
      const tile = world.tiles[nIndex];
      if (tile === HARD || (tile === SOFT && !passSoft) || world.bombGrid[nIndex]) continue;
      field[nIndex] = next;
      queue[tail] = nIndex;
      tail += 1;
    }
  }
}

function updateEnemy(world, enemy, dt) {
  enemy.anim += dt;
  if (enemy.invuln > 0) enemy.invuln -= dt;
  let speed = enemy.speed;
  if (ENEMY_TYPES[enemy.type].erratic) speed *= 0.55 + 0.9 * Math.abs(Math.sin(world.clock * 4.3 + enemy.phase));
  if (!enemy.moving) {
    enemy.wait -= dt;
    if (enemy.wait > 0) return;
    if (chooseDirection(world, enemy)) {
      enemy.moving = true;
      enemy.prog = 0;
    } else {
      enemy.wait = 0.3;
      return;
    }
  }
  if (enemy.prog < 0.5 && world.bombGrid[enemy.ny * COLS + enemy.nx]) {
    const { tx, ty } = enemy;
    enemy.tx = enemy.nx;
    enemy.ty = enemy.ny;
    enemy.nx = tx;
    enemy.ny = ty;
    enemy.dx = -enemy.dx;
    enemy.dy = -enemy.dy;
    enemy.prog = 1 - enemy.prog;
  }
  enemy.prog += (speed * dt) / TILE;
  if (enemy.prog >= 1) {
    const overflow = enemy.prog - 1;
    enemy.tx = enemy.nx;
    enemy.ty = enemy.ny;
    enemy.prog = 0;
    if (chooseDirection(world, enemy)) enemy.prog = Math.min(overflow, 0.5);
    else {
      enemy.moving = false;
      enemy.wait = 0.25;
    }
  }
  if (enemy.moving) {
    enemy.x = (enemy.tx + (enemy.nx - enemy.tx) * enemy.prog + 0.5) * TILE;
    enemy.y = (enemy.ty + (enemy.ny - enemy.ty) * enemy.prog + 0.5) * TILE;
  } else {
    enemy.x = (enemy.tx + 0.5) * TILE;
    enemy.y = (enemy.ty + 0.5) * TILE;
  }
}

function hitEnemy(world, enemy) {
  if (!enemy.alive || enemy.invuln > 0) return;
  enemy.hp -= 1;
  if (enemy.hp > 0) {
    enemy.invuln = 1.5;
    addFx(world, "text", enemy.x, enemy.y - 24, "#fb7185", 0.8, `HIT ${enemy.hp}/${enemy.maxHp}`);
    return;
  }
  enemy.alive = false;
  enemy.dyingT = 0.6;
  world.foes -= 1;
  world.kills += 1;
  addFx(world, "ring", enemy.x, enemy.y, ENEMY_TYPES[enemy.type].color, 0.5, "", 10);
  awardScore(world, ENEMY_TYPES[enemy.type].score, enemy.x, enemy.y - 16, ENEMY_TYPES[enemy.type].color);
}

function spawnOverdue(world) {
  world.timeUp = true;
  world.timeUpBanner = 3;
  const rules = DIFFICULTY_RULES[world.difficulty] || DIFFICULTY_RULES.medium;
  const px = Math.floor(world.player.x / TILE);
  const py = Math.floor(world.player.y / TILE);
  const pool = [];
  for (let y = 1; y < ROWS - 1; y += 1) {
    for (let x = 1; x < COLS - 1; x += 1) {
      if (world.tiles[y * COLS + x] !== HARD && Math.abs(x - px) + Math.abs(y - py) >= 9) pool.push(y * COLS + x);
    }
  }
  for (let i = 0; i < rules.overdue; i += 1) {
    if (!pool.length) break;
    const at = Math.floor(world.rng() * pool.length);
    const index = pool[at];
    pool[at] = pool[pool.length - 1];
    pool.pop();
    addEnemy(world, "daemon", index % COLS, Math.floor(index / COLS));
  }
  world.msg = "TIME UP! DAEMONS INCOMING";
  world.msgT = 3;
}

function spawnFromDoor(world) {
  const door = world.exit;
  const first = world.info.roster.find((entry) => entry[0] !== "boss") || world.info.roster[0];
  for (let i = 0; i < 2; i += 1) {
    const enemy = addEnemy(world, first[0], door.x, door.y);
    enemy.wait = 0.3 + i * 0.5;
    enemy.invuln = FLAME_TIME + 0.2;
    door.spawned += 1;
  }
  addFx(world, "text", (door.x + 0.5) * TILE, (door.y + 0.5) * TILE - 24, "#fb7185", 1.2, "BREACH!");
  world.msg = "DOOR BOMBED - ENEMIES RELEASED";
  world.msgT = 2;
}

// ---------- player life cycle ----------

function killPlayer(world) {
  const p = world.player;
  if (p.state !== "alive") return;
  p.state = "dying";
  p.deathT = DEATH_TIME;
  p.moving = false;
  world.lives -= 1;
  world.deaths += 1;
  p.detonator = false;
  p.wallpass = false;
  p.bombpass = false;
  p.flamepass = false;
  p.mystery = 0;
  for (const bomb of world.bombs) {
    if (bomb.remote) {
      bomb.remote = false;
      bomb.fuse = Math.min(bomb.fuse, FUSE_TIME);
    }
  }
  addFx(world, "ring", p.x, p.y, "#fb7185", 0.7, "", 12);
}

function respawnPlayer(world) {
  const p = world.player;
  p.state = "alive";
  p.x = 1.5 * TILE;
  p.y = 1.5 * TILE;
  p.stepping = false;
  p.face = 2;
  p.invuln = RESPAWN_INVULN;
  world.cam = cameraTarget(p);
}

function applyPowerup(world, type) {
  const p = world.player;
  if (type === "fire") p.fire = Math.min(MAX_FIRE, p.fire + 1);
  else if (type === "bomb") p.bombs = Math.min(MAX_BOMBS, p.bombs + 1);
  else if (type === "speed") p.speed = Math.min(MAX_SPEED, p.speed + 1);
  else if (type === "mystery") p.mystery = MYSTERY_TIME;
  else if (type === "detonator") {
    p.detonator = true;
    for (const bomb of world.bombs) if (!bomb.remote) bomb.remote = true;
  } else p[type] = true;
  addFx(world, "text", p.x, p.y - 30, POWERUPS[type].color, 1.2, POWERUPS[type].label);
}

// ---------- main step ----------

function updatePlayer(world, dt, input) {
  const p = world.player;
  if (p.state === "dying") {
    p.deathT -= dt;
    if (p.deathT <= 0) {
      if (world.lives <= 0) world.result = "lost";
      else respawnPlayer(world);
    }
    return;
  }
  if (p.invuln > 0) p.invuln -= dt;
  if (p.mystery > 0) p.mystery -= dt;
  let dx = input ? input.dx || 0 : 0;
  let dy = input ? input.dy || 0 : 0;
  if (dx !== 0) dy = 0;
  const bx = p.x;
  const by = p.y;
  stepPlayerOnGrid(world, p, dx, dy, playerSpeed(p) * dt);
  p.moving = p.stepping;
  if (p.moving) p.walk += Math.abs(p.x - bx) + Math.abs(p.y - by);
  if (input && input.bomb) placeBomb(world);
  if (input && input.det) detonate(world);
}

// Tile-by-tile movement: the player always glides from one tile center to the next and finishes the step it started,
// so it can never end up between tiles. Holding a direction chains steps; the opposite direction reverses instantly.
function stepPlayerOnGrid(world, p, dx, dy, distance) {
  let remaining = distance;
  for (let guard = 0; guard < 4 && remaining > 1e-6; guard += 1) {
    if (!p.stepping) {
      if (dx === 0 && dy === 0) return;
      p.face = dx > 0 ? 1 : dx < 0 ? 3 : dy > 0 ? 2 : 0;
      const ox = Math.floor(p.x / TILE);
      const oy = Math.floor(p.y / TILE);
      if (playerBlocked(world, ox + dx, oy + dy)) return;
      p.stepping = true;
      p.ox = ox;
      p.oy = oy;
      p.tx = ox + dx;
      p.ty = oy + dy;
    } else {
      const sdx = Math.sign(p.tx - p.ox);
      const sdy = Math.sign(p.ty - p.oy);
      if ((dx !== 0 && dx === -sdx) || (dy !== 0 && dy === -sdy)) {
        const tx = p.ox;
        const ty = p.oy;
        p.ox = p.tx;
        p.oy = p.ty;
        p.tx = tx;
        p.ty = ty;
        p.face = dx > 0 ? 1 : dx < 0 ? 3 : dy > 0 ? 2 : 0;
      }
    }
    const targetX = (p.tx + 0.5) * TILE;
    const targetY = (p.ty + 0.5) * TILE;
    const gap = Math.abs(targetX - p.x) + Math.abs(targetY - p.y);
    if (remaining >= gap) {
      p.x = targetX;
      p.y = targetY;
      p.stepping = false;
      remaining -= gap;
    } else {
      p.x += Math.sign(targetX - p.x) * remaining;
      p.y += Math.sign(targetY - p.y) * remaining;
      return;
    }
  }
}

function updateBombs(world, dt) {
  const p = world.player;
  const bombs = world.bombs;
  for (let i = 0; i < bombs.length; i += 1) {
    const bomb = bombs[i];
    bomb.age += dt;
    bomb.fuse -= dt;
    if (!bomb.solid && (p.state !== "alive" || !overlapsTile(p, bomb.x, bomb.y))) bomb.solid = true;
  }
  let again = true;
  while (again) {
    again = false;
    for (let i = 0; i < bombs.length; i += 1) {
      if (bombs[i].fuse <= 0) {
        explodeBomb(world, bombs[i]);
        again = true;
        break;
      }
    }
  }
}

function flameChecks(world) {
  const p = world.player;
  const flame = world.flame;
  if (p.state === "alive" && p.invuln <= 0 && p.mystery <= 0 && !p.flamepass) {
    if (flame[Math.floor(p.y / TILE) * COLS + Math.floor(p.x / TILE)] > 0) killPlayer(world);
  }
  for (const enemy of world.enemies) {
    if (!enemy.alive) continue;
    if (flame[Math.floor(enemy.y / TILE) * COLS + Math.floor(enemy.x / TILE)] > 0) hitEnemy(world, enemy);
  }
  const item = world.item;
  if (item.revealed && !item.taken && !item.gone && flame[item.idx] > 0) {
    item.gone = true;
    addFx(world, "text", (item.x + 0.5) * TILE, (item.y + 0.5) * TILE - 14, "#fb7185", 0.9, "DESTROYED");
  }
  const door = world.exit;
  if (door.revealed && flame[door.idx] > 0 && door.cool <= 0 && door.spawned < 8) {
    door.cool = 1.2;
    spawnFromDoor(world);
  }
}

function decayFlames(world, dt) {
  const flame = world.flame;
  for (let i = 0; i < CELLS; i += 1) {
    if (flame[i] <= 0) continue;
    flame[i] -= dt;
    if (flame[i] > 0) continue;
    flame[i] = 0;
    world.flameMask[i] = 0;
    if (world.pending[i]) {
      world.pending[i] = 0;
      if (i === world.exit.idx) {
        world.exit.revealed = true;
        addFx(world, "text", (world.exit.x + 0.5) * TILE, (world.exit.y + 0.5) * TILE - 24, "#22d3ee", 1.2, "EXIT FOUND");
      }
      if (i === world.item.idx) world.item.revealed = true;
    }
  }
}

function updateFx(world, dt) {
  const fx = world.fx;
  for (let i = fx.length - 1; i >= 0; i -= 1) {
    fx[i].t += dt;
    if (fx[i].t >= fx[i].life) {
      fx[i] = fx[fx.length - 1];
      fx.pop();
    }
  }
}

export function stepBomberman(world, dt, input) {
  if (world.result !== "running") return;
  world.clock += dt;
  const p = world.player;
  if (world.msgT > 0) world.msgT -= dt;
  if (world.timeUpBanner > 0) world.timeUpBanner -= dt;
  if (world.exit.cool > 0) world.exit.cool -= dt;

  if (!world.timeUp) {
    world.timeLeft = Math.max(0, world.timeLeft - dt);
    if (world.timeLeft <= 0) spawnOverdue(world);
  }

  updatePlayer(world, dt, input);
  if (world.result !== "running") return;
  updateBombs(world, dt);
  flameChecks(world);
  decayFlames(world, dt);

  world.fieldTimer -= dt;
  if (world.fieldTimer <= 0 && world.foes > 0 && p.state === "alive") {
    world.fieldTimer = 0.2;
    const px = Math.floor(p.x / TILE);
    const py = Math.floor(p.y / TILE);
    computeField(world, world.fieldWalk, false, px, py);
    computeField(world, world.fieldGhost, true, px, py);
  }

  const enemies = world.enemies;
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i];
    if (!enemy.alive) {
      enemy.dyingT -= dt;
      if (enemy.dyingT <= 0) {
        enemies[i] = enemies[enemies.length - 1];
        enemies.pop();
      }
      continue;
    }
    updateEnemy(world, enemy, dt);
    if (p.state === "alive" && p.invuln <= 0 && p.mystery <= 0) {
      const ex = enemy.x - p.x;
      const ey = enemy.y - p.y;
      if (ex * ex + ey * ey < PLAYER_HIT_RADIUS * PLAYER_HIT_RADIUS) killPlayer(world);
    }
  }

  if (p.state === "alive") {
    const cell = Math.floor(p.y / TILE) * COLS + Math.floor(p.x / TILE);
    const item = world.item;
    if (item.revealed && !item.taken && !item.gone && item.idx === cell) {
      item.taken = true;
      applyPowerup(world, item.type);
    }
    if (world.foes === 0 && world.exit.revealed && world.exit.idx === cell) {
      world.result = "won";
      world.clearBonus = 1000 + Math.floor(world.timeLeft) * 10;
      awardScore(world, world.clearBonus, p.x, p.y - 30, "#a3e635");
    }
  }

  updateFx(world, dt);
  const target = cameraTarget(p);
  world.cam += (target - world.cam) * Math.min(1, dt * 10);
}

export function stageObjective(world) {
  if (world.foes > 0) return world.exit.revealed ? `KILL ALL ENEMIES (${world.foes} LEFT)` : `FIND THE EXIT - ${world.foes} ENEMIES LEFT`;
  return world.exit.revealed ? "EXIT OPEN - STEP INTO THE DOOR" : "ALL CLEAR - FIND THE EXIT DOOR";
}

export function bomberHud(world) {
  const p = world.player;
  return {
    stage: world.info.label,
    score: world.score,
    lives: Math.max(0, world.lives),
    time: Math.ceil(world.timeLeft),
    fire: p.fire,
    bombs: p.bombs,
    speed: p.speed,
    foes: world.foes,
    detonator: p.detonator,
    wallpass: p.wallpass,
    bombpass: p.bombpass,
    flamepass: p.flamepass,
    mystery: Math.ceil(Math.max(0, p.mystery)),
  };
}
