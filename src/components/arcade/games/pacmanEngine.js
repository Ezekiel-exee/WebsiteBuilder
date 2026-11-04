// Pure Pac-Man logic (no React, no DOM). Positions are in tile units where the CENTER of tile (c, r)
// is the integer point (c, r); fractional positions are smooth sub-tile movement.
export const COLS = 28;
export const ROWS = 31;
export const TUNNEL_ROW = 14;
export const STEP = 1 / 60;

export const MAZE = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.##### ## #####.######",
  "     #.##### ## #####.#     ",
  "     #.##          ##.#     ",
  "     #.## ###--### ##.#     ",
  "######.## #      # ##.######",
  "      .   #      #   .      ",
  "######.## #      # ##.######",
  "     #.## ######## ##.#     ",
  "     #.##          ##.#     ",
  "     #.## ######## ##.#     ",
  "######.## ######## ##.######",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#.####.#####.##.#####.####.#",
  "#o..##.......  .......##..o#",
  "###.##.##.########.##.##.###",
  "###.##.##.########.##.##.###",
  "#......##....##....##......#",
  "#.##########.##.##########.#",
  "#.##########.##.##########.#",
  "#..........................#",
  "############################",
];

export const UP = 0;
export const LEFT = 1;
export const DOWN = 2;
export const RIGHT = 3;
export const DX = [0, -1, 0, 1];
export const DY = [-1, 0, 1, 0];

// Game phases.
export const PH_READY = 0;
export const PH_PLAY = 1;
export const PH_EAT = 2;
export const PH_DEATH_HOLD = 3;
export const PH_DEATH = 4;
export const PH_CLEAR_HOLD = 5;
export const PH_FLASH = 6;
export const PH_OVER = 7;
export const PH_DONE = 8;

// Ghost states.
export const GS_HOUSE = 0;
export const GS_LEAVE = 1;
export const GS_OUT = 2;
export const GS_EYES = 3;
export const GS_ENTER = 4;

export const GHOST_NAMES = ["BLINKY", "PINKY", "INKY", "CLYDE"];
export const SCATTER_CORNERS = [
  [25, -3],
  [2, -3],
  [27, 31],
  [0, 31],
];
export const FRUITS = [
  { name: "cherry", score: 100 },
  { name: "strawberry", score: 300 },
  { name: "orange", score: 500 },
  { name: "apple", score: 700 },
  { name: "melon", score: 1000 },
  { name: "flagship", score: 2000 },
  { name: "bell", score: 3000 },
  { name: "key", score: 5000 },
];
export const DEATH_TIME = 1.3;
export const FLASH_TIME = 1.4;
export const CLEAR_HOLD_TIME = 1;
export const EAT_FREEZE_TIME = 0.7;
export const EXTRA_LIFE_SCORE = 10000;
export const FRIGHT_DURATION_FLASH = 1.7;

const BASE_SPEED = 9.5; // tiles per second at 100%
const EYES_SPEED = 14;
const HOUSE_SPEED = 3.2;
const LEAVE_SPEED = 5;
const EPS = 1e-6;
const CORNER_PRE = 0.38;
const CORNER_POST = 0.12;
const INPUT_BUFFER = 0.7;
const DOOR_X = 13.5;
const DOOR_OUT_Y = 11;
const HOUSE_Y = 14;
const FRUIT_X = 13.5;
const FRUIT_Y = 17;

export const WALL = new Uint8Array(COLS * ROWS);
export const MAZE_DOTS = new Uint8Array(COLS * ROWS);
export let TOTAL_DOTS = 0;
for (let r = 0; r < ROWS; r += 1) {
  for (let c = 0; c < COLS; c += 1) {
    const ch = MAZE[r][c];
    if (ch === "#" || ch === "-") WALL[r * COLS + c] = 1;
    if (ch === ".") {
      MAZE_DOTS[r * COLS + c] = 1;
      TOTAL_DOTS += 1;
    } else if (ch === "o") {
      MAZE_DOTS[r * COLS + c] = 2;
      TOTAL_DOTS += 1;
    }
  }
}

export function isOpen(c, r) {
  if (r < 0 || r >= ROWS) return false;
  if (c < 0 || c >= COLS) return r === TUNNEL_ROW;
  return WALL[r * COLS + c] === 0;
}

export const DIFFICULTY = {
  easy: { lives: 5, ghost: 0.92, fright: 1.3 },
  medium: { lives: 3, ghost: 1, fright: 1 },
  hard: { lives: 2, ghost: 1.06, fright: 0.7 },
};

export function startingLives(difficulty) {
  return (DIFFICULTY[difficulty] || DIFFICULTY.medium).lives;
}

const FRIGHT_SECONDS = [6, 5, 4, 3, 2, 5, 2, 2, 1, 5, 2, 1, 1, 3, 1, 1, 0, 1, 0];
const ELROY_DOTS = [20, 30, 40, 40, 40, 50, 50, 50, 60, 60, 60, 80, 80, 80, 100, 100, 100, 100, 120];

export function fruitKind(level) {
  if (level <= 1) return 0;
  if (level === 2) return 1;
  if (level <= 4) return 2;
  if (level <= 6) return 3;
  if (level <= 8) return 4;
  if (level <= 10) return 5;
  if (level <= 12) return 6;
  return 7;
}

// Speed / timing table (the classic one, looping after level 21).
export function levelParams(level, difficulty) {
  const L = Math.max(1, Math.floor(level) || 1);
  const li = Math.min(L, 21);
  const diff = DIFFICULTY[difficulty] || DIFFICULTY.medium;
  const stage = L === 1 ? 0 : L <= 4 ? 1 : 2;
  const waves =
    L === 1
      ? [7, 20, 7, 20, 5, 20, 5, Infinity]
      : L <= 4
        ? [7, 20, 7, 20, 5, 1033, 1 / 60, Infinity]
        : [5, 20, 5, 20, 5, 1037, 1 / 60, Infinity];
  const fright = (FRIGHT_SECONDS[li - 1] || 0) * diff.fright;
  const elroy1 = ELROY_DOTS[Math.min(li, ELROY_DOTS.length) - 1];
  return {
    level: L,
    pac: L >= 21 ? 0.9 : [0.8, 0.9, 1][stage],
    pacFright: L >= 21 ? 0.9 : [0.9, 0.95, 1][stage],
    ghostBase: [0.75, 0.85, 0.95][stage],
    ghostMult: diff.ghost,
    ghostFright: [0.5, 0.55, 0.6][stage],
    tunnel: [0.4, 0.45, 0.5][stage],
    elroy1,
    elroy2: Math.floor(elroy1 / 2),
    frightTime: fright,
    waves,
    limits: [0, 0, L === 1 ? 30 : 0, L === 1 ? 60 : L === 2 ? 50 : 0],
    dotTimeout: L < 5 ? 4 : 3,
    fruit: fruitKind(L),
  };
}

function makeGhost() {
  return { x: 13.5, y: 11, dir: LEFT, state: GS_OUT, frightened: false, reverse: false, dots: 0, bounce: UP };
}

export function createGame({ level = 1, difficulty = "medium", score = 0, lives, hi = 0, seed = 0x9e3779b9 } = {}) {
  const g = {
    level,
    difficulty,
    p: levelParams(level, difficulty),
    score,
    hi: Math.max(hi, score),
    lives: lives ?? startingLives(difficulty),
    extraGiven: score >= EXTRA_LIFE_SCORE,
    phase: PH_READY,
    timer: 0.8,
    time: 0,
    dots: new Uint8Array(MAZE_DOTS),
    dotsLeft: TOTAL_DOTS,
    eaten: 0,
    pac: { x: 13.5, y: 23, dir: LEFT, face: LEFT, stall: 0, anim: 0 },
    want: -1,
    wantTtl: 0,
    ghosts: [makeGhost(), makeGhost(), makeGhost(), makeGhost()],
    scatter: true,
    wave: 0,
    waveTimer: 0,
    frightTimer: 0,
    chain: 0,
    fruit: { active: false, timer: 0, kind: 0 },
    fruitPopup: { active: false, x: FRUIT_X, y: FRUIT_Y, value: 0, timer: 0 },
    popup: { active: false, x: 0, y: 0, value: 0 },
    eatenGhost: -1,
    noDotTimer: 0,
    useGlobal: false,
    globalCount: 0,
    elroyHold: false,
    elroy: 0,
    seed: seed >>> 0 || 1,
    tx: 0,
    ty: 0,
  };
  resetPositions(g, false);
  return g;
}

export function rand(g) {
  let s = g.seed;
  s ^= s << 13;
  s ^= s >>> 17;
  s ^= s << 5;
  g.seed = s >>> 0;
  return g.seed / 4294967296;
}

export function resetPositions(g, afterDeath) {
  const pac = g.pac;
  pac.x = 13.5;
  pac.y = 23;
  pac.dir = LEFT;
  pac.face = LEFT;
  pac.stall = 0;
  g.want = -1;
  g.wantTtl = 0;
  const starts = [
    [13.5, 11, GS_OUT],
    [13.5, 14, GS_HOUSE],
    [11.5, 14, GS_HOUSE],
    [15.5, 14, GS_HOUSE],
  ];
  for (let k = 0; k < 4; k += 1) {
    const gh = g.ghosts[k];
    gh.x = starts[k][0];
    gh.y = starts[k][1];
    gh.state = starts[k][2];
    gh.dir = k === 0 ? LEFT : UP;
    gh.bounce = UP;
    gh.frightened = false;
    gh.reverse = false;
  }
  g.scatter = true;
  g.wave = 0;
  g.waveTimer = g.p.waves[0];
  g.frightTimer = 0;
  g.chain = 0;
  g.popup.active = false;
  g.eatenGhost = -1;
  g.noDotTimer = 0;
  g.elroyHold = afterDeath;
  g.useGlobal = afterDeath;
  g.globalCount = 0;
  updateElroy(g);
  if (!afterDeath) releaseEligible(g);
}

export function queueDirection(g, dir) {
  g.want = dir;
  g.wantTtl = INPUT_BUFFER;
}

// Gives the player's first key press a short READY! window before the action starts.
export function beginPlay(g, delay = 0.8) {
  if (g.phase === PH_READY) g.timer = Math.min(g.timer, delay);
}

function addScore(g, amount) {
  g.score += amount;
  if (!g.extraGiven && g.score >= EXTRA_LIFE_SCORE) {
    g.extraGiven = true;
    g.lives += 1;
  }
  if (g.score > g.hi) g.hi = g.score;
}

function updateElroy(g) {
  if (g.elroyHold) {
    g.elroy = 0;
    return;
  }
  g.elroy = g.dotsLeft <= g.p.elroy2 ? 2 : g.dotsLeft <= g.p.elroy1 ? 1 : 0;
}

function preferredGhost(g) {
  for (let k = 1; k < 4; k += 1) if (g.ghosts[k].state === GS_HOUSE) return k;
  return -1;
}

function releaseGhost(g, k) {
  const gh = g.ghosts[k];
  if (gh.state === GS_HOUSE) {
    gh.state = GS_LEAVE;
    gh.dir = UP;
  }
}

function releaseEligible(g) {
  if (g.useGlobal) return;
  let k = preferredGhost(g);
  while (k >= 0 && g.ghosts[k].dots >= g.p.limits[k]) {
    releaseGhost(g, k);
    k = preferredGhost(g);
  }
}

function onDotEaten(g) {
  g.noDotTimer = 0;
  if (g.useGlobal) {
    g.globalCount += 1;
    if (g.globalCount === 7) releaseGhost(g, 1);
    else if (g.globalCount === 17) releaseGhost(g, 2);
    else if (g.globalCount === 32 && g.ghosts[3].state === GS_HOUSE) {
      releaseGhost(g, 3);
      g.useGlobal = false;
    }
    if (g.ghosts[3].state !== GS_HOUSE) g.useGlobal = false;
  } else {
    const k = preferredGhost(g);
    if (k >= 0) g.ghosts[k].dots += 1;
    releaseEligible(g);
  }
}

function reverseOutGhosts(g) {
  for (let k = 0; k < 4; k += 1) {
    const gh = g.ghosts[k];
    if (gh.state === GS_OUT) gh.reverse = true;
  }
}

function startFright(g) {
  g.chain = 0;
  for (let k = 0; k < 4; k += 1) {
    const gh = g.ghosts[k];
    if (gh.state === GS_EYES || gh.state === GS_ENTER) continue;
    if (g.p.frightTime > 0) gh.frightened = true;
    if (gh.state === GS_OUT) gh.reverse = true;
  }
  g.frightTimer = g.p.frightTime;
}

function endFright(g) {
  g.frightTimer = 0;
  for (let k = 0; k < 4; k += 1) g.ghosts[k].frightened = false;
}

export function ghostTarget(g, k) {
  const pac = g.pac;
  const pc = Math.round(pac.x);
  const pr = Math.round(pac.y);
  const f = pac.face;
  if (k === 0) {
    g.tx = pc;
    g.ty = pr;
  } else if (k === 1) {
    g.tx = pc + 4 * DX[f] - (f === UP ? 4 : 0);
    g.ty = pr + 4 * DY[f];
  } else if (k === 2) {
    const ax = pc + 2 * DX[f] - (f === UP ? 2 : 0);
    const ay = pr + 2 * DY[f];
    const blinky = g.ghosts[0];
    g.tx = 2 * ax - Math.round(blinky.x);
    g.ty = 2 * ay - Math.round(blinky.y);
  } else {
    const gh = g.ghosts[3];
    const dx = Math.round(gh.x) - pc;
    const dy = Math.round(gh.y) - pr;
    if (dx * dx + dy * dy > 64) {
      g.tx = pc;
      g.ty = pr;
    } else {
      g.tx = SCATTER_CORNERS[3][0];
      g.ty = SCATTER_CORNERS[3][1];
    }
  }
}

function chooseGhostDir(g, k, gh, c, r) {
  if (gh.reverse) {
    gh.reverse = false;
    gh.dir = (gh.dir + 2) & 3;
    return;
  }
  const back = (gh.dir + 2) & 3;
  if (gh.frightened) {
    let count = 0;
    for (let d = 0; d < 4; d += 1) if (d !== back && isOpen(c + DX[d], r + DY[d])) count += 1;
    if (count === 0) {
      gh.dir = back;
      return;
    }
    let pick = Math.floor(rand(g) * count);
    for (let d = 0; d < 4; d += 1) {
      if (d !== back && isOpen(c + DX[d], r + DY[d])) {
        if (pick === 0) {
          gh.dir = d;
          return;
        }
        pick -= 1;
      }
    }
    return;
  }
  if (gh.state === GS_EYES) {
    g.tx = DOOR_X;
    g.ty = DOOR_OUT_Y;
  } else if (g.scatter && !(k === 0 && g.elroy > 0)) {
    g.tx = SCATTER_CORNERS[k][0];
    g.ty = SCATTER_CORNERS[k][1];
  } else {
    ghostTarget(g, k);
  }
  const noUp = gh.state !== GS_EYES && (r === 11 || r === 23) && (c === 12 || c === 15);
  let best = -1;
  let bestDist = Infinity;
  for (let d = 0; d < 4; d += 1) {
    if (d === back || (d === UP && noUp)) continue;
    const nc = c + DX[d];
    const nr = r + DY[d];
    if (!isOpen(nc, nr)) continue;
    const ex = nc - g.tx;
    const ey = nr - g.ty;
    const dist = ex * ex + ey * ey;
    if (dist < bestDist) {
      bestDist = dist;
      best = d;
    }
  }
  gh.dir = best >= 0 ? best : back;
}

function ghostSpeed(g, k, gh) {
  if (gh.state === GS_EYES) return EYES_SPEED;
  if (gh.y === TUNNEL_ROW && (gh.x < 5.5 || gh.x > 22.5)) return BASE_SPEED * g.p.tunnel;
  if (gh.frightened) return BASE_SPEED * g.p.ghostFright;
  const bonus = k === 0 ? g.elroy * 0.05 : 0;
  return BASE_SPEED * (g.p.ghostBase + bonus) * g.p.ghostMult;
}

function moveGhostGrid(g, k, gh, dist) {
  let guard = 6;
  while (dist > 1e-9 && guard > 0) {
    guard -= 1;
    const cx = Math.round(gh.x);
    const cy = Math.round(gh.y);
    if (Math.abs(gh.x - cx) < EPS && Math.abs(gh.y - cy) < EPS) {
      gh.x = cx;
      gh.y = cy;
      if (gh.state === GS_EYES && cy === DOOR_OUT_Y && (cx === 13 || cx === 14)) {
        gh.state = GS_ENTER;
        return;
      }
      chooseGhostDir(g, k, gh, cx, cy);
    }
    const dx = DX[gh.dir];
    const dy = DY[gh.dir];
    const horiz = dx !== 0;
    let pos = horiz ? gh.x : gh.y;
    const sign = horiz ? dx : dy;
    let rem = sign > 0 ? Math.ceil(pos) - pos : pos - Math.floor(pos);
    if (rem < EPS) rem = 1;
    const step = Math.min(dist, rem);
    pos += sign * step;
    if (step >= rem - 1e-12) pos = Math.round(pos);
    if (horiz) gh.x = pos;
    else gh.y = pos;
    dist -= step;
  }
  if (gh.x < -1.5) gh.x += 30;
  else if (gh.x > 28.5) gh.x -= 30;
}

function moveGhostEnter(gh, dist) {
  let d = dist;
  const off = DOOR_X - gh.x;
  if (Math.abs(off) > EPS) {
    const s = Math.min(d, Math.abs(off));
    gh.x += Math.sign(off) * s;
    gh.dir = off > 0 ? RIGHT : LEFT;
    d -= s;
    if (Math.abs(DOOR_X - gh.x) < EPS) gh.x = DOOR_X;
  }
  if (gh.x === DOOR_X && d > 0 && gh.y < HOUSE_Y) {
    gh.dir = DOWN;
    const s = Math.min(d, HOUSE_Y - gh.y);
    gh.y += s;
  }
  if (gh.x === DOOR_X && gh.y >= HOUSE_Y - EPS) {
    gh.y = HOUSE_Y;
    gh.state = GS_LEAVE;
    gh.frightened = false;
    gh.reverse = false;
    gh.dir = UP;
  }
}

function moveGhostLeave(gh, dist) {
  let d = dist;
  const off = DOOR_X - gh.x;
  if (Math.abs(off) > EPS) {
    const s = Math.min(d, Math.abs(off));
    gh.x += Math.sign(off) * s;
    gh.dir = off > 0 ? RIGHT : LEFT;
    d -= s;
    if (Math.abs(DOOR_X - gh.x) < EPS) gh.x = DOOR_X;
  }
  if (gh.x === DOOR_X && d > 0) {
    gh.dir = UP;
    gh.y -= d;
    if (gh.y <= DOOR_OUT_Y) {
      gh.y = DOOR_OUT_Y;
      gh.state = GS_OUT;
      gh.dir = LEFT;
      gh.reverse = false;
    }
  }
}

function moveGhostHouse(gh, dt) {
  gh.y += (gh.bounce === UP ? -1 : 1) * HOUSE_SPEED * dt;
  if (gh.y <= 13.55) {
    gh.y = 13.55;
    gh.bounce = DOWN;
  } else if (gh.y >= 14.45) {
    gh.y = 14.45;
    gh.bounce = UP;
  }
  gh.dir = gh.bounce;
}

function moveGhosts(g, dt) {
  if (g.elroyHold && g.ghosts[3].state === GS_OUT) {
    g.elroyHold = false;
    updateElroy(g);
  }
  for (let k = 0; k < 4; k += 1) {
    const gh = g.ghosts[k];
    switch (gh.state) {
      case GS_HOUSE:
        moveGhostHouse(gh, dt);
        break;
      case GS_LEAVE:
        moveGhostLeave(gh, LEAVE_SPEED * dt);
        break;
      case GS_ENTER:
        moveGhostEnter(gh, EYES_SPEED * 0.6 * dt);
        break;
      default:
        moveGhostGrid(g, k, gh, ghostSpeed(g, k, gh) * dt);
    }
  }
}

function movePac(g, dt) {
  const p = g.pac;
  let t = dt;
  if (p.stall > 0) {
    const used = Math.min(p.stall, t);
    p.stall -= used;
    t -= used;
    if (t <= 1e-9) return;
  }
  let dist = BASE_SPEED * (g.frightTimer > 0 ? g.p.pacFright : g.p.pac) * t;
  let guard = 6;
  while (dist > 1e-9 && guard > 0) {
    guard -= 1;
    const c = Math.round(p.x);
    const r = Math.round(p.y);
    const w = g.want;
    if (w >= 0 && w !== p.dir) {
      if (p.dir >= 0 && w === ((p.dir + 2) & 3)) {
        p.dir = w;
      } else if (isOpen(c + DX[w], r + DY[w])) {
        if (p.dir < 0) {
          p.dir = w;
        } else {
          const along = DX[p.dir] !== 0 ? (p.x - c) * DX[p.dir] : (p.y - r) * DY[p.dir];
          if (along >= -CORNER_PRE && along <= CORNER_POST) p.dir = w;
        }
      }
    }
    if (p.dir < 0) break;
    p.face = p.dir;
    const dx = DX[p.dir];
    const dy = DY[p.dir];
    const horiz = dx !== 0;
    let pos = horiz ? p.x : p.y;
    const sign = horiz ? dx : dy;
    let rem;
    if (Math.abs(pos - Math.round(pos)) < EPS) {
      pos = Math.round(pos);
      if (!isOpen(c + dx, r + dy)) {
        if (horiz) p.x = pos;
        else p.y = pos;
        p.dir = -1;
        break;
      }
      rem = 1;
    } else {
      rem = sign > 0 ? Math.ceil(pos) - pos : pos - Math.floor(pos);
    }
    const step = Math.min(dist, rem);
    pos += sign * step;
    if (step >= rem - 1e-12) pos = Math.round(pos);
    let lat = horiz ? p.y : p.x;
    const lc = Math.round(lat);
    const lo = lat - lc;
    if (lo !== 0) {
      const m = Math.min(Math.abs(lo), step);
      lat = lo > 0 ? lat - m : lat + m;
      if (Math.abs(lat - lc) < EPS) lat = lc;
    }
    if (horiz) {
      p.x = pos;
      p.y = lat;
    } else {
      p.y = pos;
      p.x = lat;
    }
    dist -= step;
    p.anim += step;
  }
  if (p.x < -1.5) p.x += 30;
  else if (p.x > 28.5) p.x -= 30;
}

function eatAtPac(g) {
  const p = g.pac;
  const c = Math.round(p.x);
  const r = Math.round(p.y);
  if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;
  const idx = r * COLS + c;
  const kind = g.dots[idx];
  if (kind === 0) return;
  g.dots[idx] = 0;
  g.dotsLeft -= 1;
  g.eaten += 1;
  if (kind === 1) {
    addScore(g, 10);
    p.stall += 1 / 60;
  } else {
    addScore(g, 50);
    p.stall += 3 / 60;
    startFright(g);
  }
  updateElroy(g);
  onDotEaten(g);
  if (g.eaten === 70 || g.eaten === 170) {
    g.fruit.active = true;
    g.fruit.kind = g.p.fruit;
    g.fruit.timer = 9.3 + rand(g) * 0.7;
  }
  if (g.dotsLeft <= 0) {
    g.phase = PH_CLEAR_HOLD;
    g.timer = CLEAR_HOLD_TIME;
  }
}

function checkFruit(g) {
  const f = g.fruit;
  if (!f.active) return;
  const dx = g.pac.x - FRUIT_X;
  const dy = g.pac.y - FRUIT_Y;
  if (dx * dx + dy * dy > 0.64) return;
  f.active = false;
  const value = FRUITS[f.kind].score;
  addScore(g, value);
  g.fruitPopup.active = true;
  g.fruitPopup.value = value;
  g.fruitPopup.timer = 2;
}

function killPac(g) {
  g.lives -= 1;
  g.phase = PH_DEATH_HOLD;
  g.timer = 0.9;
}

function checkCollisions(g) {
  const p = g.pac;
  for (let k = 0; k < 4; k += 1) {
    const gh = g.ghosts[k];
    if (gh.state !== GS_OUT) continue;
    const dx = gh.x - p.x;
    const dy = gh.y - p.y;
    if (dx * dx + dy * dy > 0.3) continue;
    if (gh.frightened) {
      const value = 200 << Math.min(g.chain, 3);
      g.chain += 1;
      addScore(g, value);
      gh.state = GS_EYES;
      gh.frightened = false;
      gh.reverse = false;
      g.popup.active = true;
      g.popup.x = gh.x;
      g.popup.y = gh.y;
      g.popup.value = value;
      g.eatenGhost = k;
      g.phase = PH_EAT;
      g.timer = EAT_FREEZE_TIME;
    } else {
      killPac(g);
      return;
    }
  }
}

function readInput(g, dt, held, decay) {
  if (held >= 0) {
    g.want = held;
    g.wantTtl = INPUT_BUFFER;
  } else if (decay && g.want >= 0) {
    g.wantTtl -= dt;
    if (g.wantTtl <= 0) g.want = -1;
  }
}

function playStep(g, dt, held) {
  readInput(g, dt, held, true);
  if (g.frightTimer > 0) {
    g.frightTimer -= dt;
    if (g.frightTimer <= 0) endFright(g);
  } else {
    g.waveTimer -= dt;
    if (g.waveTimer <= 0 && g.wave < g.p.waves.length - 1) {
      g.wave += 1;
      g.waveTimer = g.p.waves[g.wave];
      g.scatter = g.wave % 2 === 0;
      reverseOutGhosts(g);
    }
  }
  g.noDotTimer += dt;
  if (g.noDotTimer > g.p.dotTimeout) {
    g.noDotTimer = 0;
    const k = preferredGhost(g);
    if (k >= 0) releaseGhost(g, k);
  }
  if (g.fruit.active) {
    g.fruit.timer -= dt;
    if (g.fruit.timer <= 0) g.fruit.active = false;
  }
  if (g.fruitPopup.active) {
    g.fruitPopup.timer -= dt;
    if (g.fruitPopup.timer <= 0) g.fruitPopup.active = false;
  }
  movePac(g, dt);
  eatAtPac(g);
  if (g.phase !== PH_PLAY) return;
  checkFruit(g);
  moveGhosts(g, dt);
  checkCollisions(g);
}

// Advances the simulation by exactly dt seconds. `held` is the currently held direction (0-3) or -1.
export function update(g, dt, held = -1) {
  g.time += dt;
  switch (g.phase) {
    case PH_READY:
      readInput(g, dt, held, false);
      g.timer -= dt;
      if (g.timer <= 0) g.phase = PH_PLAY;
      break;
    case PH_PLAY:
      playStep(g, dt, held);
      break;
    case PH_EAT:
      readInput(g, dt, held, false);
      g.timer -= dt;
      if (g.timer <= 0) {
        g.popup.active = false;
        g.eatenGhost = -1;
        if (g.phase === PH_EAT) g.phase = PH_PLAY;
      }
      break;
    case PH_DEATH_HOLD:
      g.timer -= dt;
      if (g.timer <= 0) {
        g.phase = PH_DEATH;
        g.timer = DEATH_TIME;
      }
      break;
    case PH_DEATH:
      g.timer -= dt;
      if (g.timer <= 0) {
        if (g.lives <= 0) {
          g.phase = PH_OVER;
        } else {
          resetPositions(g, true);
          g.phase = PH_READY;
          g.timer = 1.8;
        }
      }
      break;
    case PH_CLEAR_HOLD:
      g.timer -= dt;
      if (g.timer <= 0) {
        g.phase = PH_FLASH;
        g.timer = FLASH_TIME;
      }
      break;
    case PH_FLASH:
      g.timer -= dt;
      if (g.timer <= 0) g.phase = PH_DONE;
      break;
    default:
  }
  if (g.fruitPopup.active && g.phase !== PH_PLAY) {
    g.fruitPopup.timer -= dt;
    if (g.fruitPopup.timer <= 0) g.fruitPopup.active = false;
  }
}

export function pacmanStatus(g) {
  if (g.phase === PH_OVER) return "lost";
  if (g.phase === PH_DONE) return "won";
  return "running";
}

export function pacmanHud(g) {
  return { score: g.score, hi: g.hi, lives: g.lives, level: g.level, left: g.dotsLeft };
}

// Outline loops (tile units, already inset into the wall) used to draw the double-line maze walls.
export function buildWallLoops(inset = 0.22) {
  const isWall = (c, r) => {
    if (c < -1 || c > COLS || r < -1 || r > ROWS) return true;
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return r !== TUNNEL_ROW;
    return WALL[r * COLS + c] === 1 && MAZE[r][c] !== "-";
  };
  const edges = [];
  const starts = new Map();
  const addEdge = (x0, y0, x1, y1) => {
    const key = (x0 + 2) * 100 + (y0 + 2);
    const list = starts.get(key) || [];
    list.push(edges.length);
    starts.set(key, list);
    edges.push({ x0, y0, x1, y1, used: false });
  };
  for (let r = -1; r <= ROWS; r += 1) {
    for (let c = -2; c <= COLS + 1; c += 1) {
      if (!isWall(c, r)) continue;
      const open = (cc, rr) => cc >= -1 && cc <= COLS && rr >= -1 && rr <= ROWS && !isWall(cc, rr);
      if (open(c, r - 1)) addEdge(c, r, c + 1, r);
      if (open(c + 1, r)) addEdge(c + 1, r, c + 1, r + 1);
      if (open(c, r + 1)) addEdge(c + 1, r + 1, c, r + 1);
      if (open(c - 1, r)) addEdge(c, r + 1, c, r);
    }
  }
  const loops = [];
  for (let i = 0; i < edges.length; i += 1) {
    if (edges[i].used) continue;
    const chain = [];
    let e = edges[i];
    for (;;) {
      e.used = true;
      chain.push(e);
      const next = starts.get((e.x1 + 2) * 100 + (e.y1 + 2)) || [];
      let pick = null;
      let bestCross = -Infinity;
      const hx = e.x1 - e.x0;
      const hy = e.y1 - e.y0;
      for (const index of next) {
        const cand = edges[index];
        if (cand.used && cand !== edges[i]) continue;
        const cross = hx * (cand.y1 - cand.y0) - hy * (cand.x1 - cand.x0);
        if (cross > bestCross) {
          bestCross = cross;
          pick = cand;
        }
      }
      if (!pick || pick === edges[i]) break;
      e = pick;
    }
    const pts = [];
    for (let j = 0; j < chain.length; j += 1) {
      const prev = chain[(j - 1 + chain.length) % chain.length];
      const cur = chain[j];
      const pdx = Math.sign(prev.x1 - prev.x0);
      const pdy = Math.sign(prev.y1 - prev.y0);
      const cdx = Math.sign(cur.x1 - cur.x0);
      const cdy = Math.sign(cur.y1 - cur.y0);
      if (pdx === cdx && pdy === cdy) continue;
      // The wall lies to the right of the travel direction; offset the corner into it.
      pts.push(cur.x0 + (-pdy + -cdy) * inset, cur.y0 + (pdx + cdx) * inset);
    }
    loops.push(pts);
  }
  return loops;
}
