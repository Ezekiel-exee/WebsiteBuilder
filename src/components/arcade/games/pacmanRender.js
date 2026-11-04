import { COLORS, FONT, FONT_BOLD, drawOverlay, drawPanel } from "../arcadeKit";
import {
  COLS,
  DX,
  DY,
  FLASH_TIME,
  FRIGHT_DURATION_FLASH,
  GS_ENTER,
  GS_EYES,
  PH_DEATH,
  PH_DONE,
  PH_EAT,
  PH_FLASH,
  PH_OVER,
  PH_READY,
  ROWS,
  DEATH_TIME,
  buildWallLoops,
  fruitKind,
} from "./pacmanEngine";

export const TILE = 20;
export const WIDTH = COLS * TILE;
export const TOP = 60;
export const MAZE_HEIGHT = ROWS * TILE;
export const HEIGHT = TOP + MAZE_HEIGHT + 40;

const PAC_COLOR = "#fde047";
const GHOST_COLORS = [COLORS.rose, COLORS.pink, COLORS.cyan, COLORS.amber];
const FRUIT_COLORS = [COLORS.rose, COLORS.pink, COLORS.orange, COLORS.lime, COLORS.teal, COLORS.violet, COLORS.amber, COLORS.cyan];
const FONT_VALUE = "bold 18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const FONT_READY = "bold 16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const PAC_ANGLE = [-Math.PI / 2, Math.PI, Math.PI / 2, 0];
const TAU = Math.PI * 2;
const PAC_R = 12;
const GHOST_R = 12;

const WALL_LOOPS = buildWallLoops();

function traceLoop(ctx, pts, radius) {
  const n = pts.length / 2;
  const px = (i) => pts[((i + n) % n) * 2] * TILE;
  const py = (i) => pts[((i + n) % n) * 2 + 1] * TILE;
  const edge = (i) => Math.hypot(px(i + 1) - px(i), py(i + 1) - py(i));
  ctx.moveTo((px(n - 1) + px(0)) / 2, (py(n - 1) + py(0)) / 2);
  for (let i = 0; i < n; i += 1) {
    const r = Math.min(radius, edge(i - 1) / 2, edge(i) / 2);
    ctx.arcTo(px(i), py(i), (px(i) + px(i + 1)) / 2, (py(i) + py(i + 1)) / 2, r);
  }
  ctx.closePath();
}

function buildWalls(ratio, color) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH * ratio;
  canvas.height = MAZE_HEIGHT * ratio;
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  for (const loop of WALL_LOOPS) traceLoop(ctx, loop, 6);
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = COLORS.pink;
  ctx.beginPath();
  ctx.moveTo(13 * TILE + 1, 12.5 * TILE);
  ctx.lineTo(15 * TILE - 1, 12.5 * TILE);
  ctx.stroke();
  return canvas;
}

export function createPacmanRenderer() {
  return { ratio: 0, walls: null, flash: null, score: -1, scoreText: "0", hi: -1, hiText: "0", level: -1, levelText: "" };
}

function ensureWalls(rc) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  if (rc.walls && rc.ratio === ratio) return;
  rc.ratio = ratio;
  rc.walls = buildWalls(ratio, COLORS.cyan);
  rc.flash = buildWalls(ratio, "#f8fafc");
}

function drawPacShape(ctx, cx, cy, r, angle, mouth, color, width = 1.6) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, angle + mouth, angle + TAU - mouth);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawEyes(ctx, cx, cy, r, dir, scale = 1) {
  const er = r * 0.27 * scale;
  const ox = r * 0.4;
  const oy = cy - r * 0.15;
  const px = DX[dir] * r * 0.13;
  const py = DY[dir] * r * 0.13;
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = COLORS.text;
  ctx.beginPath();
  ctx.moveTo(cx - ox + er, oy);
  ctx.arc(cx - ox, oy, er, 0, TAU);
  ctx.moveTo(cx + ox + er, oy);
  ctx.arc(cx + ox, oy, er, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = COLORS.sky;
  ctx.fillRect(cx - ox + px - 1.2, oy + py - 1.2, 2.4, 2.4);
  ctx.fillRect(cx + ox + px - 1.2, oy + py - 1.2, 2.4, 2.4);
}

function drawGhost(ctx, g, k, gh) {
  const cx = gh.x * TILE + TILE / 2;
  const cy = gh.y * TILE + TILE / 2;
  const r = GHOST_R;
  if (gh.state === GS_EYES || gh.state === GS_ENTER) {
    drawEyes(ctx, cx, cy, r, gh.dir, 1.15);
    return;
  }
  let color = GHOST_COLORS[k];
  const frightened = gh.frightened;
  if (frightened) {
    const flashing = g.frightTimer < Math.min(g.p.frightTime, FRIGHT_DURATION_FLASH) && ((g.time * 5) | 0) % 2 === 0;
    color = flashing ? COLORS.text : COLORS.sky;
  }
  const foot = ((g.time * 8) | 0) & 1;
  const notch = foot ? 0.38 : 0.14;
  ctx.beginPath();
  ctx.moveTo(cx - r, cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.arc(cx, cy, r, Math.PI, 0);
  ctx.lineTo(cx + r, cy + r);
  const tooth = (2 * r) / 3;
  for (let i = 0; i < 3; i += 1) {
    const x0 = cx + r - i * tooth;
    ctx.lineTo(x0 - tooth / 2, cy + r - r * notch * (foot ? 1 : 1.6));
    ctx.lineTo(x0 - tooth, cy + r);
  }
  ctx.closePath();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = color;
  ctx.stroke();
  if (frightened) {
    ctx.fillStyle = color;
    ctx.fillRect(cx - r * 0.4 - 1.2, cy - r * 0.25 - 1.2, 2.4, 2.4);
    ctx.fillRect(cx + r * 0.4 - 1.2, cy - r * 0.25 - 1.2, 2.4, 2.4);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.6, cy + r * 0.35);
    ctx.lineTo(cx - r * 0.3, cy + r * 0.15);
    ctx.lineTo(cx, cy + r * 0.35);
    ctx.lineTo(cx + r * 0.3, cy + r * 0.15);
    ctx.lineTo(cx + r * 0.6, cy + r * 0.35);
    ctx.stroke();
  } else {
    drawEyes(ctx, cx, cy, r, gh.dir);
  }
}

function drawPac(ctx, g) {
  const p = g.pac;
  const cx = p.x * TILE + TILE / 2;
  const cy = p.y * TILE + TILE / 2;
  if (g.phase === PH_DEATH) {
    const q = Math.min(1, (DEATH_TIME - g.timer) / DEATH_TIME);
    if (q < 0.88) {
      drawPacShape(ctx, cx, cy, PAC_R, -Math.PI / 2, 0.1 + q * 1.15 * (Math.PI - 0.1), PAC_COLOR);
    } else {
      const burst = (q - 0.88) / 0.12;
      ctx.strokeStyle = PAC_COLOR;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * TAU;
        ctx.moveTo(cx + Math.cos(a) * (4 + burst * 6), cy + Math.sin(a) * (4 + burst * 6));
        ctx.lineTo(cx + Math.cos(a) * (8 + burst * 8), cy + Math.sin(a) * (8 + burst * 8));
      }
      ctx.stroke();
    }
    return;
  }
  const mouth = 0.08 + 0.62 * Math.abs(Math.sin(p.anim * 2.4 + 1));
  drawPacShape(ctx, cx, cy, PAC_R, PAC_ANGLE[p.face], mouth, PAC_COLOR);
}

export function drawFruit(ctx, kind, cx, cy, s) {
  ctx.strokeStyle = FRUIT_COLORS[kind];
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  switch (kind) {
    case 0:
      ctx.moveTo(cx - 0.35 * s + 0.32 * s, cy + 0.45 * s);
      ctx.arc(cx - 0.35 * s, cy + 0.45 * s, 0.32 * s, 0, TAU);
      ctx.moveTo(cx + 0.45 * s + 0.32 * s, cy + 0.55 * s);
      ctx.arc(cx + 0.45 * s, cy + 0.55 * s, 0.32 * s, 0, TAU);
      ctx.moveTo(cx - 0.35 * s, cy + 0.13 * s);
      ctx.quadraticCurveTo(cx - 0.1 * s, cy - 0.5 * s, cx + 0.2 * s, cy - 0.8 * s);
      ctx.moveTo(cx + 0.45 * s, cy + 0.23 * s);
      ctx.quadraticCurveTo(cx + 0.4 * s, cy - 0.4 * s, cx + 0.2 * s, cy - 0.8 * s);
      ctx.moveTo(cx + 0.2 * s, cy - 0.8 * s);
      ctx.lineTo(cx + 0.65 * s, cy - 0.85 * s);
      break;
    case 1:
      ctx.moveTo(cx - 0.75 * s, cy - 0.45 * s);
      ctx.quadraticCurveTo(cx, cy - 0.7 * s, cx + 0.75 * s, cy - 0.45 * s);
      ctx.quadraticCurveTo(cx + 0.7 * s, cy + 0.4 * s, cx, cy + 0.95 * s);
      ctx.quadraticCurveTo(cx - 0.7 * s, cy + 0.4 * s, cx - 0.75 * s, cy - 0.45 * s);
      ctx.moveTo(cx - 0.35 * s, cy - 0.65 * s);
      ctx.lineTo(cx, cy - 0.95 * s);
      ctx.lineTo(cx + 0.35 * s, cy - 0.65 * s);
      ctx.moveTo(cx - 0.25 * s, cy - 0.05 * s);
      ctx.lineTo(cx - 0.15 * s, cy - 0.05 * s);
      ctx.moveTo(cx + 0.2 * s, cy + 0.15 * s);
      ctx.lineTo(cx + 0.3 * s, cy + 0.15 * s);
      ctx.moveTo(cx - 0.05 * s, cy + 0.45 * s);
      ctx.lineTo(cx + 0.05 * s, cy + 0.45 * s);
      break;
    case 2:
      ctx.moveTo(cx + 0.8 * s, cy + 0.15 * s);
      ctx.arc(cx, cy + 0.15 * s, 0.8 * s, 0, TAU);
      ctx.moveTo(cx, cy - 0.65 * s);
      ctx.lineTo(cx + 0.1 * s, cy - 0.95 * s);
      ctx.moveTo(cx + 0.1 * s, cy - 0.8 * s);
      ctx.lineTo(cx + 0.55 * s, cy - 0.9 * s);
      break;
    case 3:
      ctx.moveTo(cx, cy - 0.45 * s);
      ctx.bezierCurveTo(cx - 0.3 * s, cy - 0.85 * s, cx - 1 * s, cy - 0.5 * s, cx - 0.85 * s, cy + 0.2 * s);
      ctx.bezierCurveTo(cx - 0.75 * s, cy + 0.8 * s, cx - 0.3 * s, cy + 0.95 * s, cx, cy + 0.75 * s);
      ctx.bezierCurveTo(cx + 0.3 * s, cy + 0.95 * s, cx + 0.75 * s, cy + 0.8 * s, cx + 0.85 * s, cy + 0.2 * s);
      ctx.bezierCurveTo(cx + 1 * s, cy - 0.5 * s, cx + 0.3 * s, cy - 0.85 * s, cx, cy - 0.45 * s);
      ctx.moveTo(cx, cy - 0.45 * s);
      ctx.lineTo(cx + 0.1 * s, cy - 0.95 * s);
      break;
    case 4:
      ctx.moveTo(cx + 0.8 * s, cy);
      ctx.arc(cx, cy, 0.8 * s, 0, TAU);
      ctx.moveTo(cx - 0.8 * s, cy);
      ctx.quadraticCurveTo(cx, cy - 0.5 * s, cx + 0.8 * s, cy);
      ctx.moveTo(cx - 0.55 * s, cy + 0.55 * s);
      ctx.quadraticCurveTo(cx, cy + 0.1 * s, cx + 0.55 * s, cy + 0.55 * s);
      ctx.moveTo(cx, cy - 0.8 * s);
      ctx.lineTo(cx, cy + 0.8 * s);
      break;
    case 5:
      ctx.moveTo(cx, cy - 0.95 * s);
      ctx.lineTo(cx + 0.3 * s, cy - 0.2 * s);
      ctx.lineTo(cx + 0.95 * s, cy - 0.45 * s);
      ctx.lineTo(cx + 0.75 * s, cy + 0.35 * s);
      ctx.lineTo(cx + 0.2 * s, cy + 0.3 * s);
      ctx.lineTo(cx, cy + 0.95 * s);
      ctx.lineTo(cx - 0.2 * s, cy + 0.3 * s);
      ctx.lineTo(cx - 0.75 * s, cy + 0.35 * s);
      ctx.lineTo(cx - 0.95 * s, cy - 0.45 * s);
      ctx.lineTo(cx - 0.3 * s, cy - 0.2 * s);
      ctx.closePath();
      break;
    case 6:
      ctx.moveTo(cx - 0.85 * s, cy + 0.6 * s);
      ctx.quadraticCurveTo(cx - 0.55 * s, cy + 0.4 * s, cx - 0.55 * s, cy - 0.15 * s);
      ctx.quadraticCurveTo(cx - 0.55 * s, cy - 0.85 * s, cx, cy - 0.85 * s);
      ctx.quadraticCurveTo(cx + 0.55 * s, cy - 0.85 * s, cx + 0.55 * s, cy - 0.15 * s);
      ctx.quadraticCurveTo(cx + 0.55 * s, cy + 0.4 * s, cx + 0.85 * s, cy + 0.6 * s);
      ctx.closePath();
      ctx.moveTo(cx - 0.2 * s, cy + 0.8 * s);
      ctx.lineTo(cx + 0.2 * s, cy + 0.8 * s);
      break;
    default:
      ctx.moveTo(cx + 0.45 * s, cy - 0.55 * s);
      ctx.arc(cx, cy - 0.55 * s, 0.45 * s, 0, TAU);
      ctx.moveTo(cx, cy - 0.1 * s);
      ctx.lineTo(cx, cy + 0.95 * s);
      ctx.moveTo(cx, cy + 0.55 * s);
      ctx.lineTo(cx + 0.45 * s, cy + 0.55 * s);
      ctx.moveTo(cx, cy + 0.95 * s);
      ctx.lineTo(cx + 0.4 * s, cy + 0.95 * s);
  }
  ctx.stroke();
}

function drawHud(ctx, g, rc) {
  if (rc.score !== g.score) {
    rc.score = g.score;
    rc.scoreText = String(g.score);
  }
  if (rc.hi !== g.hi) {
    rc.hi = g.hi;
    rc.hiText = String(g.hi);
  }
  if (rc.level !== g.level) {
    rc.level = g.level;
    rc.levelText = String(g.level).padStart(2, "0");
  }
  drawPanel(ctx, 6, 8, 170, 46, COLORS.cyan, ["SCORE"]);
  drawPanel(ctx, 190, 8, 170, 46, COLORS.amber, ["HI-SCORE"]);
  drawPanel(ctx, 374, 8, 180, 46, COLORS.rose, ["LIVES"]);
  ctx.font = FONT_VALUE;
  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.text;
  ctx.fillText(rc.scoreText, 14, 45);
  ctx.fillText(rc.hiText, 198, 45);
  const icons = Math.min(g.lives, 7);
  for (let i = 0; i < icons; i += 1) drawPacShape(ctx, 392 + i * 22, 38, 7, 0, 0.45, PAC_COLOR, 1.3);
  if (g.lives > icons) {
    ctx.font = FONT;
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(`+${g.lives - icons}`, 392 + icons * 22 - 8, 42);
  }
  const by = HEIGHT - 34;
  drawPanel(ctx, 6, by, 118, 26, COLORS.lime, ["LEVEL"]);
  drawPanel(ctx, 138, by, 416, 26, COLORS.violet, ["FRUIT"]);
  ctx.font = FONT_BOLD;
  ctx.fillStyle = COLORS.text;
  ctx.fillText(rc.levelText, 70, by + 18);
  const first = Math.max(1, g.level - 6);
  let x = 546;
  for (let lv = g.level; lv >= first; lv -= 1) {
    drawFruit(ctx, fruitKind(lv), x - 8, by + 13, 7);
    x -= 26;
  }
}

function drawDots(ctx, g) {
  const dots = g.dots;
  ctx.fillStyle = "#cbd5e1";
  ctx.beginPath();
  for (let i = 0, n = dots.length; i < n; i += 1) {
    if (dots[i] !== 1) continue;
    const c = i % COLS;
    const r = (i / COLS) | 0;
    ctx.rect(c * TILE + TILE / 2 - 1.5, r * TILE + TILE / 2 - 1.5, 3, 3);
  }
  ctx.fill();
  const pulse = 4.5 + Math.sin(g.time * 8) * 1.3;
  ctx.strokeStyle = COLORS.text;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0, n = dots.length; i < n; i += 1) {
    if (dots[i] !== 2) continue;
    const cx = (i % COLS) * TILE + TILE / 2;
    const cy = ((i / COLS) | 0) * TILE + TILE / 2;
    ctx.moveTo(cx + pulse, cy);
    ctx.arc(cx, cy, pulse, 0, TAU);
  }
  ctx.stroke();
}

function drawCenteredText(ctx, text, x, y, color, font = FONT_READY) {
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.textAlign = "left";
}

// mode: "ready" | "running" | "paused" | "won" | "lost" (React status).
export function drawPacman(ctx, rc, g, mode) {
  ensureWalls(rc);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawHud(ctx, g, rc);
  ctx.save();
  ctx.translate(0, TOP);
  const flashOn = g.phase === PH_FLASH && ((((FLASH_TIME - g.timer) / 0.17) | 0) & 1) === 0;
  ctx.drawImage(flashOn ? rc.flash : rc.walls, 0, 0, WIDTH, MAZE_HEIGHT);
  if (g.phase !== PH_FLASH) drawDots(ctx, g);
  if (g.fruit.active && g.phase !== PH_FLASH) drawFruit(ctx, g.fruit.kind, 13.5 * TILE + TILE / 2, 17 * TILE + TILE / 2, 9);
  const showGhosts = g.phase !== PH_DEATH && g.phase !== PH_FLASH && g.phase !== PH_DONE;
  drawPac(ctx, g);
  if (showGhosts) {
    for (let k = 0; k < 4; k += 1) {
      if (g.phase === PH_EAT && g.eatenGhost === k) continue;
      drawGhost(ctx, g, k, g.ghosts[k]);
    }
  }
  if (g.phase === PH_EAT && g.popup.active) {
    drawCenteredText(ctx, String(g.popup.value), g.popup.x * TILE + TILE / 2, g.popup.y * TILE + TILE / 2 + 4, COLORS.cyan, FONT_BOLD);
  }
  if (g.fruitPopup.active) {
    drawCenteredText(ctx, String(g.fruitPopup.value), 13.5 * TILE + TILE / 2, 17 * TILE + TILE / 2 + 4, COLORS.pink, FONT_BOLD);
  }
  const readyY = 17 * TILE + TILE / 2 + 6;
  if (g.phase === PH_READY) drawCenteredText(ctx, "READY!", WIDTH / 2, readyY, PAC_COLOR);
  else if (g.phase === PH_OVER) drawCenteredText(ctx, "GAME OVER", WIDTH / 2, readyY, COLORS.rose);
  else if (g.phase === PH_DONE) drawCenteredText(ctx, "LEVEL CLEAR", WIDTH / 2, readyY, COLORS.lime);
  ctx.restore();
  if (mode === "ready") {
    drawOverlay(ctx, WIDTH, HEIGHT, "PAC-MAN", "PRESS W A S D TO START", COLORS.amber);
    drawCenteredText(ctx, "READY!", WIDTH / 2, TOP + readyY, PAC_COLOR);
  } else if (mode === "paused") {
    drawOverlay(ctx, WIDTH, HEIGHT, "PAUSED", "PRESS P TO RESUME", COLORS.amber);
  }
}

