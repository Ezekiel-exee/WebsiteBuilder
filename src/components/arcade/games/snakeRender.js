// Canvas renderer for Snake. Everything is redrawn from scratch each frame; the static board
// (grid, border, obstacles) is cached on an offscreen layer per world.
import { COLORS, FONT, drawOverlay, drawPanel } from "../arcadeKit";
import {
  BOARD_H,
  BOARD_W,
  CELL,
  COLS,
  COMBO_WINDOW_MS,
  HEIGHT,
  HUD_H,
  ROWS,
  SPARK_COLORS,
  SPECIALS,
  WIDTH,
  snakeAlpha,
} from "./snakeEngine";

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const LABEL_FONT = `bold 9px ${MONO}`;
const GLYPH_FONT = `bold 10px ${MONO}`;
const POP_FONT = `bold 12px ${MONO}`;
const BODY = 16;
const TAPER = CELL * 3.2;
const BODY_FILL = "#0c1f10";
const SPARK_STYLE = SPARK_COLORS.map((name) => COLORS[name]);
const DASH = [4, 4];
const NO_DASH = [];
const MAX_POINTS = COLS * ROWS + 4;
const PX = new Float32Array(MAX_POINTS);
const PY = new Float32Array(MAX_POINTS);
const PW = new Float32Array(MAX_POINTS);
const OFFSETS = [0, -1, 1];

const layers = new WeakMap();
const hudCaches = new WeakMap();

function buildLayer(world, ratio) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(BOARD_W * ratio);
  canvas.height = Math.round(BOARD_H * ratio);
  const g = canvas.getContext("2d");
  g.setTransform(ratio, 0, 0, ratio, 0, 0);
  g.lineCap = "round";
  g.lineJoin = "round";
  g.fillStyle = COLORS.bg;
  g.fillRect(0, 0, BOARD_W, BOARD_H);
  g.strokeStyle = COLORS.grid;
  g.lineWidth = 1;
  g.beginPath();
  for (let x = 0; x <= COLS; x += 1) {
    g.moveTo(Math.min(x * CELL, BOARD_W - 1) + 0.5, 0);
    g.lineTo(Math.min(x * CELL, BOARD_W - 1) + 0.5, BOARD_H);
  }
  for (let y = 0; y <= ROWS; y += 1) {
    g.moveTo(0, Math.min(y * CELL, BOARD_H - 1) + 0.5);
    g.lineTo(BOARD_W, Math.min(y * CELL, BOARD_H - 1) + 0.5);
  }
  g.stroke();

  g.fillStyle = "rgba(192, 132, 252, 0.09)";
  g.strokeStyle = "rgba(192, 132, 252, 0.35)";
  g.lineWidth = 1;
  g.beginPath();
  for (let i = 0; i < COLS * ROWS; i += 1) {
    if (!world.blocked[i]) continue;
    const x = (i % COLS) * CELL;
    const y = Math.floor(i / COLS) * CELL;
    g.rect(x, y, CELL, CELL);
    g.moveTo(x + 6, y + CELL - 6);
    g.lineTo(x + CELL - 6, y + 6);
  }
  g.fill();
  g.stroke();
  const edges = world.obstacleEdges;
  g.strokeStyle = COLORS.violet;
  g.lineWidth = 2;
  g.beginPath();
  for (let i = 0; i < edges.length; i += 4) {
    g.moveTo(edges[i] * CELL, edges[i + 1] * CELL);
    g.lineTo(edges[i + 2] * CELL, edges[i + 3] * CELL);
  }
  g.stroke();

  if (world.wrap) {
    g.strokeStyle = "rgba(45, 212, 191, 0.55)";
    g.lineWidth = 2;
    g.setLineDash([6, 6]);
    g.strokeRect(1, 1, BOARD_W - 2, BOARD_H - 2);
    g.setLineDash(NO_DASH);
  } else {
    g.strokeStyle = COLORS.rose;
    g.lineWidth = 3;
    g.strokeRect(1.5, 1.5, BOARD_W - 3, BOARD_H - 3);
  }
  return canvas;
}

function getLayer(world, ratio) {
  let layer = layers.get(world);
  if (!layer || layer.ratio !== ratio) {
    layer = { ratio, canvas: buildLayer(world, ratio) };
    layers.set(world, layer);
  }
  return layer.canvas;
}

// Builds the snake polyline in unwrapped pixel space (so it is continuous across wrapped edges):
// interpolated head, every cell center, interpolated tail. Returns the point count.
function buildPath(world, alpha) {
  const { xs, ys, cap } = world;
  const back = 1 - alpha;
  let index = world.head;
  let ux = xs[index];
  let uy = ys[index];
  let rawX = ux;
  let rawY = uy;
  PX[0] = (ux + 0.5 - world.dx * back) * CELL;
  PY[0] = (uy + 0.5 - world.dy * back) * CELL;
  PX[1] = (ux + 0.5) * CELL;
  PY[1] = (uy + 0.5) * CELL;
  let count = 2;
  for (let i = 1; i < world.len; i += 1) {
    index = index === 0 ? cap - 1 : index - 1;
    let ddx = xs[index] - rawX;
    let ddy = ys[index] - rawY;
    if (ddx > COLS / 2) ddx -= COLS;
    else if (ddx < -COLS / 2) ddx += COLS;
    if (ddy > ROWS / 2) ddy -= ROWS;
    else if (ddy < -ROWS / 2) ddy += ROWS;
    ux += ddx;
    uy += ddy;
    rawX = xs[index];
    rawY = ys[index];
    PX[count] = (ux + 0.5) * CELL;
    PY[count] = (uy + 0.5) * CELL;
    count += 1;
  }
  let tdx = world.prevTailX - rawX;
  let tdy = world.prevTailY - rawY;
  if (tdx > COLS / 2) tdx -= COLS;
  else if (tdx < -COLS / 2) tdx += COLS;
  if (tdy > ROWS / 2) tdy -= ROWS;
  else if (tdy < -ROWS / 2) tdy += ROWS;
  PX[count] = (ux + 0.5 + tdx * back) * CELL;
  PY[count] = (uy + 0.5 + tdy * back) * CELL;
  count += 1;
  // Widths taper toward the tail based on distance remaining to the tail tip.
  let remaining = 0;
  PW[count - 1] = BODY * 0.38;
  for (let i = count - 2; i >= 0; i -= 1) {
    remaining += Math.hypot(PX[i + 1] - PX[i], PY[i + 1] - PY[i]);
    PW[i] = BODY * Math.min(1, 0.38 + (0.62 * remaining) / TAPER);
  }
  return count;
}

function strokeTube(ctx, count, extra, color) {
  ctx.strokeStyle = color;
  let open = false;
  for (let i = 0; i < count - 1; i += 1) {
    const width = (PW[i] + PW[i + 1]) * 0.5;
    if (width >= BODY - 0.05) {
      if (!open) {
        ctx.lineWidth = BODY + extra;
        ctx.beginPath();
        ctx.moveTo(PX[i], PY[i]);
        open = true;
      }
      ctx.lineTo(PX[i + 1], PY[i + 1]);
    } else {
      if (open) {
        ctx.stroke();
        open = false;
      }
      ctx.lineWidth = width + extra;
      ctx.beginPath();
      ctx.moveTo(PX[i], PY[i]);
      ctx.lineTo(PX[i + 1], PY[i + 1]);
      ctx.stroke();
    }
  }
  if (open) ctx.stroke();
}

function snakeColor(world) {
  if (world.status === "lost") return COLORS.rose;
  if (world.turboMs > 0) return COLORS.sky;
  if (world.sleepMs > 0) return COLORS.violet;
  return COLORS.lime;
}

function drawHead(ctx, world, x, y) {
  if (world.shield > 0) {
    ctx.strokeStyle = COLORS.pink;
    ctx.lineWidth = 1.5;
    ctx.setLineDash(DASH);
    ctx.lineDashOffset = -world.time * 0.03;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash(NO_DASH);
  }
}

function drawSnake(ctx, world, alpha) {
  const count = buildPath(world, alpha);
  const color = snakeColor(world);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < count; i += 1) {
    if (PX[i] < minX) minX = PX[i];
    if (PX[i] > maxX) maxX = PX[i];
    if (PY[i] < minY) minY = PY[i];
    if (PY[i] > maxY) maxY = PY[i];
  }
  const margin = 20;
  const hx = PX[0];
  const hy = PY[0];
  // With wrap-around the unwrapped path can leave the board; redraw shifted copies that re-enter on the other side.
  for (let oyi = 0; oyi < (world.wrap ? 3 : 1); oyi += 1) {
    const oy = OFFSETS[oyi] * BOARD_H;
    if (maxY + oy < -margin || minY + oy > BOARD_H + margin) continue;
    for (let oxi = 0; oxi < (world.wrap ? 3 : 1); oxi += 1) {
      const ox = OFFSETS[oxi] * BOARD_W;
      if (maxX + ox < -margin || minX + ox > BOARD_W + margin) continue;
      ctx.save();
      ctx.translate(ox, oy);
      strokeTube(ctx, count, 4, color);
      strokeTube(ctx, count, 0, BODY_FILL);
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(PX[0], PY[0]);
      for (let i = 1; i < count - 1; i += 1) ctx.lineTo(PX[i], PY[i]);
      ctx.stroke();
      ctx.globalAlpha = 1;
      drawHead(ctx, world, hx, hy);
      ctx.restore();
    }
  }
}

function drawByte(ctx, world) {
  const { food } = world;
  if (food.x < 0) return;
  const cx = (food.x + 0.5) * CELL;
  const cy = (food.y + 0.5) * CELL;
  const age = world.time - world.foodBorn;
  const pop = age < 160 ? 0.55 + (0.45 * age) / 160 : 1;
  const pulse = 1 + Math.sin(world.time * 0.006) * 0.06;
  const size = 8.5 * pop * pulse;
  ctx.fillStyle = "rgba(34, 211, 238, 0.12)";
  ctx.fillRect(cx - size, cy - size, size * 2, size * 2);
  ctx.strokeStyle = COLORS.cyan;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cx - size, cy - size, size * 2, size * 2);
  ctx.strokeStyle = "rgba(34, 211, 238, 0.35)";
  ctx.lineWidth = 1;
  const outer = size + 3.5;
  ctx.strokeRect(cx - outer, cy - outer, outer * 2, outer * 2);
  ctx.font = GLYPH_FONT;
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.cyan;
  ctx.fillText("01", cx, cy + 3.5);
  ctx.textAlign = "left";
}

function drawSpecial(ctx, world) {
  const { special } = world;
  if (!special.active) return;
  const style = SPECIALS[special.type];
  const color = COLORS[style.color];
  const cx = (special.x + 0.5) * CELL;
  const cy = (special.y + 0.5) * CELL;
  const fraction = Math.max(0, special.ttl / special.maxTtl);
  if (fraction < 0.25 && Math.floor(world.time / 140) % 2 === 0) return;
  const age = world.time - special.born;
  const pop = age < 180 ? 0.5 + (0.5 * age) / 180 : 1;
  const r = 11.5 * pop;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.closePath();
  ctx.fillStyle = "rgba(8, 10, 15, 0.9)";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 15.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.font = special.type === "commit" || special.type === "gc" ? LABEL_FONT : GLYPH_FONT;
  ctx.fillText(style.glyph, cx, cy + 3.5);
  ctx.font = LABEL_FONT;
  const labelX = Math.min(BOARD_W - 34, Math.max(34, cx));
  const labelY = cy > 40 ? cy - 20 : cy + 28;
  ctx.fillText(style.label, labelX, labelY);
  ctx.textAlign = "left";
}

function drawEffects(ctx, world) {
  for (let i = 0; i < world.plife.length; i += 1) {
    const life = world.plife[i];
    if (life <= 0) continue;
    ctx.globalAlpha = Math.min(1, life / world.pmax[i]);
    ctx.strokeStyle = SPARK_STYLE[world.pcolor[i]];
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(world.px[i], world.py[i]);
    ctx.lineTo(world.px[i] - world.pvx[i] * 80, world.py[i] - world.pvy[i] * 80);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.font = POP_FONT;
  ctx.textAlign = "center";
  for (let i = 0; i < world.popups.length; i += 1) {
    const slot = world.popups[i];
    if (slot.life <= 0) continue;
    const progress = 1 - slot.life / slot.max;
    ctx.globalAlpha = Math.min(1, slot.life / 300);
    ctx.fillStyle = COLORS[slot.color];
    ctx.fillText(slot.text, Math.min(BOARD_W - 40, Math.max(40, slot.x)), Math.max(14, slot.y - progress * 20));
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
}

function hudLines(world) {
  let cache = hudCaches.get(world);
  if (!cache) {
    cache = { key: "", p1: [], p2: [], p3: [], p4: [] };
    hudCaches.set(world, cache);
  }
  const turbo = Math.ceil(world.turboMs / 1000);
  const sleep = Math.ceil(world.sleepMs / 1000);
  const speed = Math.round(10000 / world.tickMs) / 10;
  const key = `${world.eaten}|${world.score}|${world.hi}|${world.len}|${world.combo}|${world.shield}|${turbo}|${sleep}|${speed}`;
  if (cache.key !== key) {
    cache.key = key;
    cache.p1 = [`LV ${world.level} ${world.layoutName}`, `BYTES ${world.eaten}/${world.target}`, `LENGTH ${world.len}`];
    cache.p2 = [`SCORE ${world.score}`, `HI ${world.hi}`, world.wrap ? "EDGES WRAP" : "WALLS SOLID"];
    cache.p3 = [`COMBO x${world.combo}`, "TIMER", `NEXT +${10 * Math.min(5, world.combo + 1)}`];
    cache.p4 = [turbo > 0 ? `TURBO ${turbo}s` : sleep > 0 ? `SLEEP ${sleep}s` : "FX NONE", world.shield > 0 ? "SHIELD ON" : "SHIELD OFF", `SPEED ${speed}/s`];
  }
  return cache;
}

function drawHud(ctx, world) {
  const panelW = (WIDTH - 16 - 24) / 4;
  const lines = hudLines(world);
  const fx = world.turboMs > 0 ? COLORS.sky : world.sleepMs > 0 ? COLORS.violet : world.shield > 0 ? COLORS.pink : COLORS.muted;
  drawPanel(ctx, 8, 6, panelW, 48, COLORS.cyan, lines.p1);
  drawPanel(ctx, 8 + (panelW + 8), 6, panelW, 48, COLORS.lime, lines.p2);
  drawPanel(ctx, 8 + (panelW + 8) * 2, 6, panelW, 48, COLORS.amber, lines.p3);
  drawPanel(ctx, 8 + (panelW + 8) * 3, 6, panelW, 48, fx, lines.p4);
  // progress toward the byte target
  const barX = 8 + 110;
  const barW = panelW - 110 - 10;
  ctx.strokeStyle = COLORS.dim;
  ctx.strokeRect(barX + 0.5, 6 + 22.5, barW, 6);
  ctx.fillStyle = COLORS.cyan;
  ctx.fillRect(barX + 1, 6 + 23, (barW - 1) * Math.min(1, world.eaten / world.target), 5);
  // combo timer
  const comboX = 8 + (panelW + 8) * 2 + 52;
  const comboW = panelW - 52 - 10;
  ctx.strokeStyle = COLORS.dim;
  ctx.strokeRect(comboX + 0.5, 6 + 22.5, comboW, 6);
  ctx.fillStyle = world.combo > 1 ? COLORS.amber : COLORS.dim;
  ctx.fillRect(comboX + 1, 6 + 23, (comboW - 1) * Math.min(1, world.comboMs / COMBO_WINDOW_MS), 5);
  ctx.font = FONT;
}

// mode: null while running, otherwise "ready" | "paused" | "won" | "lost".
export function drawSnake2d(ctx, world, mode) {
  const ratio = ctx.canvas.width / WIDTH;
  const alpha = snakeAlpha(world);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.save();
  ctx.translate(0, HUD_H);
  ctx.drawImage(getLayer(world, ratio), 0, 0, BOARD_W, BOARD_H);
  ctx.beginPath();
  ctx.rect(0, 0, BOARD_W, BOARD_H);
  ctx.clip();
  drawByte(ctx, world);
  drawSpecial(ctx, world);
  drawSnake(ctx, world, alpha);
  drawEffects(ctx, world);
  if (mode === "ready") {
    drawOverlay(ctx, BOARD_W, BOARD_H, "PRESS W A S D TO START", "Eat bytes. Avoid obstacles and your own tail.", COLORS.lime, [
      `LEVEL ${world.level} · ${world.layoutName} · ${world.wrap ? "edges wrap around" : "walls are solid"}`,
      "Arrow keys or swipes also steer · P pauses",
    ]);
  } else if (mode === "paused") {
    drawOverlay(ctx, BOARD_W, BOARD_H, "PAUSED", "Press P to resume", COLORS.amber);
  } else if (mode === "won") {
    drawOverlay(ctx, BOARD_W, BOARD_H, `LEVEL ${world.level} CLEARED`, "Loading the next level…", COLORS.cyan, [`SCORE ${world.score}`]);
  }
  ctx.restore();
  drawHud(ctx, world);
}
