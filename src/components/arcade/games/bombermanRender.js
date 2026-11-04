// Canvas renderer for Bomberman: outline-only line art in the Byte Brawl terminal style.
import { COLORS, FONT, FONT_BOLD, drawOverlay, drawPanel } from "../arcadeKit";
import { COLS, ROWS, TILE, VIEW_COLS, VIEW_W, FIELD_W, FIELD_H, HUD_H, CANVAS_W, CANVAS_H, SOFT, POWERUPS, POWERUP_ORDER, ENEMY_TYPES, stageObjective, stageInfo } from "./bombermanEngine";

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const PI = Math.PI;

let layerCache = { key: "", canvas: null };
let softCache = { key: "", canvas: null };

function makeCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width);
  canvas.height = Math.ceil(height);
  return canvas;
}

function staticLayer(accent, ratio) {
  const key = `${accent}|${ratio}`;
  if (layerCache.key === key) return layerCache.canvas;
  const canvas = makeCanvas(FIELD_W * ratio, FIELD_H * ratio);
  const g = canvas.getContext("2d");
  g.scale(ratio, ratio);
  g.fillStyle = COLORS.bg;
  g.fillRect(0, 0, FIELD_W, FIELD_H);
  g.strokeStyle = COLORS.grid;
  g.lineWidth = 1;
  g.beginPath();
  for (let x = 0; x <= FIELD_W; x += TILE) {
    g.moveTo(x + 0.5, 0);
    g.lineTo(x + 0.5, FIELD_H);
  }
  for (let y = 0; y <= FIELD_H; y += TILE) {
    g.moveTo(0, y + 0.5);
    g.lineTo(FIELD_W, y + 0.5);
  }
  g.stroke();
  g.strokeStyle = accent;
  g.lineJoin = "round";
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const border = x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1;
      if (!border && !(x % 2 === 0 && y % 2 === 0)) continue;
      const px = x * TILE;
      const py = y * TILE;
      g.globalAlpha = border ? 0.45 : 0.9;
      g.lineWidth = border ? 1 : 2;
      g.strokeRect(px + 3, py + 3, TILE - 6, TILE - 6);
      g.lineWidth = 1;
      g.globalAlpha = border ? 0.25 : 0.55;
      g.beginPath();
      g.moveTo(px + 3, py + 3);
      g.lineTo(px + TILE - 3, py + TILE - 3);
      g.moveTo(px + TILE - 3, py + 3);
      g.lineTo(px + 3, py + TILE - 3);
      if (!border) {
        g.strokeRect(px + 12, py + 12, TILE - 24, TILE - 24);
      }
      g.stroke();
    }
  }
  g.globalAlpha = 1;
  layerCache = { key, canvas };
  return canvas;
}

function softSprite(ratio) {
  const key = String(ratio);
  if (softCache.key === key) return softCache.canvas;
  const canvas = makeCanvas(TILE * ratio, TILE * ratio);
  const g = canvas.getContext("2d");
  g.scale(ratio, ratio);
  g.strokeStyle = COLORS.muted;
  g.lineWidth = 1.5;
  g.setLineDash([5, 3]);
  g.strokeRect(4, 4, TILE - 8, TILE - 8);
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(4, 14);
  g.lineTo(TILE - 4, 14);
  g.moveTo(4, 26);
  g.lineTo(TILE - 4, 26);
  g.moveTo(20, 4);
  g.lineTo(20, 14);
  g.moveTo(11, 14);
  g.lineTo(11, 26);
  g.moveTo(29, 14);
  g.lineTo(29, 26);
  g.moveTo(20, 26);
  g.lineTo(20, TILE - 4);
  g.stroke();
  softCache = { key, canvas };
  return canvas;
}

function diamond(ctx, x, y, r, color, glyph, font = "bold 11px " + MONO) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r, y);
  ctx.closePath();
  ctx.stroke();
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.fillText(glyph, x, y + r * 0.36);
}

// ---------- sprites ----------

function drawBomber(ctx, p, clock, color) {
  const moving = p.moving;
  const swing = moving ? Math.sin(p.walk * 0.28) : 0;
  const bob = moving ? -Math.abs(swing) * 1.6 : Math.sin(clock * 3) * 0.4;
  ctx.save();
  ctx.translate(p.x, p.y + 3 + bob);
  if (p.state === "dying") {
    const t = 1 - p.deathT / 1.5;
    ctx.rotate(t * 14);
    const s = Math.max(0.2, 1 - t * 0.8);
    ctx.scale(s, s);
    ctx.globalAlpha = Math.max(0, 1 - t * 0.9);
  } else ctx.scale(0.88, 0.88);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -9, 8, 0, PI * 2);
  ctx.moveTo(0, -17);
  ctx.lineTo(0, -21);
  ctx.moveTo(-8, -12.5);
  ctx.lineTo(8, -12.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -24, 2.2, 0, PI * 2);
  ctx.stroke();
  ctx.beginPath();
  const face = p.face;
  if (face === 2) {
    ctx.moveTo(-3.5, -10);
    ctx.lineTo(-3.5, -6.5);
    ctx.moveTo(3.5, -10);
    ctx.lineTo(3.5, -6.5);
  } else if (face === 1 || face === 3) {
    const s = face === 1 ? 1 : -1;
    ctx.moveTo(s * 3.5, -10);
    ctx.lineTo(s * 3.5, -6.5);
    ctx.moveTo(s * 8, -6);
    ctx.lineTo(s * 4.5, -4);
  } else {
    ctx.moveTo(-4.5, -8.5);
    ctx.lineTo(4.5, -8.5);
  }
  ctx.moveTo(-5, -1);
  ctx.lineTo(5, -1);
  ctx.lineTo(6.5, 9);
  ctx.lineTo(-6.5, 9);
  ctx.closePath();
  const leg = swing * 4.5;
  ctx.moveTo(-3, 9);
  ctx.lineTo(-3 + leg, 16);
  ctx.moveTo(3, 9);
  ctx.lineTo(3 - leg, 16);
  if (face === 1 || face === 3) {
    const s = face === 1 ? 1 : -1;
    ctx.moveTo(0, 1);
    ctx.lineTo(s * (5 + swing * 3), 7);
    ctx.moveTo(0, 1);
    ctx.lineTo(-s * (4 + swing * 3), 6);
  } else {
    ctx.moveTo(-5, 1);
    ctx.lineTo(-9, 6 + leg * 0.4);
    ctx.moveTo(5, 1);
    ctx.lineTo(9, 6 - leg * 0.4);
  }
  ctx.stroke();
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawEnemy(ctx, e, clock) {
  const cfg = ENEMY_TYPES[e.type];
  const dyingT = e.alive ? 0 : 1 - Math.max(0, e.dyingT) / 0.6;
  if (e.alive && e.invuln > 0 && Math.floor(clock * 14) % 2 === 0) return;
  const a = e.anim;
  const look = e.dx * 2;
  ctx.save();
  ctx.translate(e.x, e.y);
  if (!e.alive) {
    ctx.rotate(dyingT * 6);
    ctx.scale(1 - dyingT * 0.7, 1 - dyingT * 0.7);
    ctx.globalAlpha = 1 - dyingT;
  }
  ctx.strokeStyle = cfg.color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  switch (e.type) {
    case "bug": {
      ctx.ellipse(0, 2, 11, 8, 0, 0, PI * 2);
      for (let i = -1; i <= 1; i += 1) {
        const w = Math.sin(a * 9 + i * 2) * 2;
        ctx.moveTo(-9 + i * 3, 4 + i * 2);
        ctx.lineTo(-15, 8 + i * 4 + w);
        ctx.moveTo(9 + i * 3 - i * 6, 4 + i * 2);
        ctx.lineTo(15, 8 + i * 4 - w);
      }
      ctx.moveTo(-3, -5);
      ctx.lineTo(-7, -12);
      ctx.moveTo(3, -5);
      ctx.lineTo(7, -12);
      ctx.moveTo(0, -6);
      ctx.lineTo(0, 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-4 + look, -1, 1.5, 0, PI * 2);
      ctx.arc(4 + look, -1, 1.5, 0, PI * 2);
      break;
    }
    case "leak": {
      const squash = 1 + Math.sin(a * 6) * 0.08;
      ctx.scale(1 / squash, squash);
      ctx.moveTo(0, -15);
      ctx.bezierCurveTo(6, -7, 11, -1, 11, 5);
      ctx.arc(0, 5, 11, 0, PI, false);
      ctx.bezierCurveTo(-11, -1, -6, -7, 0, -15);
      ctx.moveTo(-5, 12);
      ctx.lineTo(-5, 15);
      ctx.moveTo(4, 14);
      ctx.lineTo(4, 17 + Math.sin(a * 8) * 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-4 + look, 3, 1.6, 0, PI * 2);
      ctx.arc(4 + look, 3, 1.6, 0, PI * 2);
      break;
    }
    case "spider": {
      ctx.arc(0, 1, 7, 0, PI * 2);
      for (let i = 0; i < 4; i += 1) {
        const w = Math.sin(a * 10 + i * 1.7) * 2;
        const y = -5 + i * 4.5;
        ctx.moveTo(-6, y * 0.6 + 1);
        ctx.lineTo(-12, y - 3 + w);
        ctx.lineTo(-16, y + 6);
        ctx.moveTo(6, y * 0.6 + 1);
        ctx.lineTo(12, y - 3 - w);
        ctx.lineTo(16, y + 6);
      }
      ctx.moveTo(-2, 7);
      ctx.lineTo(-2, 10);
      ctx.moveTo(2, 7);
      ctx.lineTo(2, 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-3 + look * 0.5, -1, 1.8, 0, PI * 2);
      ctx.arc(3 + look * 0.5, -1, 1.8, 0, PI * 2);
      break;
    }
    case "ghost": {
      ctx.setLineDash([4, 3]);
      ctx.globalAlpha *= 0.75 + Math.sin(a * 4) * 0.2;
      ctx.moveTo(-11, 10);
      ctx.lineTo(-11, -2);
      ctx.arc(0, -2, 11, PI, 0);
      ctx.lineTo(11, 10);
      const wave = Math.sin(a * 8) * 1.5;
      ctx.lineTo(7, 6 + wave);
      ctx.lineTo(3.5, 10);
      ctx.lineTo(0, 6 - wave);
      ctx.lineTo(-3.5, 10);
      ctx.lineTo(-7, 6 + wave);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(-4 + look, -3, 2, 0, PI * 2);
      ctx.arc(4 + look, -3, 2, 0, PI * 2);
      break;
    }
    case "glitch": {
      const tick = Math.floor(clock * 18);
      const jx = ((tick * 7) % 5) - 2;
      const jy = ((tick * 3) % 5) - 2;
      ctx.rect(-9 + jx, -9, 18, 18);
      ctx.stroke();
      ctx.strokeStyle = COLORS.pink;
      ctx.beginPath();
      ctx.rect(-9 - jx, -9 + jy, 18, 18);
      ctx.moveTo(-12, -3 + jy);
      ctx.lineTo(12, -3 + jy);
      ctx.moveTo(-12 + jx, 5);
      ctx.lineTo(12 - jx, 5);
      ctx.stroke();
      ctx.strokeStyle = cfg.color;
      ctx.beginPath();
      ctx.moveTo(-5, -4);
      ctx.lineTo(-2, -4);
      ctx.moveTo(2, -4);
      ctx.lineTo(5, -4);
      break;
    }
    case "daemon": {
      const pulse = 1 + Math.sin(a * 10) * 0.08;
      ctx.arc(0, 0, 10 * pulse, 0, PI * 2);
      ctx.moveTo(-7, -7);
      ctx.lineTo(-11, -15);
      ctx.lineTo(-3, -10);
      ctx.moveTo(7, -7);
      ctx.lineTo(11, -15);
      ctx.lineTo(3, -10);
      ctx.moveTo(0, 10);
      ctx.lineTo(0, 17);
      ctx.moveTo(-3, 14);
      ctx.lineTo(0, 17);
      ctx.lineTo(3, 14);
      ctx.moveTo(-5, -1);
      ctx.lineTo(-2, 1);
      ctx.moveTo(5, -1);
      ctx.lineTo(2, 1);
      ctx.moveTo(-4, 5);
      ctx.lineTo(-2, 7);
      ctx.lineTo(0, 5);
      ctx.lineTo(2, 7);
      ctx.lineTo(4, 5);
      break;
    }
    default: {
      ctx.scale(1.45, 1.45);
      ctx.lineWidth = 1.5;
      ctx.rect(-11, -8, 22, 18);
      ctx.moveTo(-11, -8);
      ctx.lineTo(-14, -16);
      ctx.lineTo(-6, -8);
      ctx.moveTo(11, -8);
      ctx.lineTo(14, -16);
      ctx.lineTo(6, -8);
      ctx.rect(-8, -3, 5, 5);
      ctx.rect(3, -3, 5, 5);
      ctx.moveTo(-6, 6);
      ctx.lineTo(6, 6);
      ctx.moveTo(-3, 6);
      ctx.lineTo(-3, 10);
      ctx.moveTo(0, 6);
      ctx.lineTo(0, 10);
      ctx.moveTo(3, 6);
      ctx.lineTo(3, 10);
    }
  }
  ctx.stroke();
  ctx.restore();
  ctx.globalAlpha = 1;
  if (e.type === "boss" && e.alive) {
    ctx.strokeStyle = cfg.color;
    ctx.lineWidth = 1;
    for (let i = 0; i < e.maxHp; i += 1) {
      ctx.beginPath();
      ctx.rect(e.x - e.maxHp * 4 + i * 8 + 0.5, e.y - 33, 6, 5);
      if (i < e.hp) ctx.fillStyle = cfg.color;
      if (i < e.hp) ctx.fill();
      ctx.stroke();
    }
  }
}

function drawBomb(ctx, bomb) {
  const cx = (bomb.x + 0.5) * TILE;
  const cy = (bomb.y + 0.5) * TILE + 2;
  const urgency = bomb.remote ? 0.4 : 1 - Math.max(0, bomb.fuse) / 2;
  const pulse = Math.sin(bomb.age * (7 + urgency * 14));
  const r = 12 + pulse * (1 + urgency * 1.5);
  const hot = !bomb.remote && bomb.fuse < 0.6 && Math.floor(bomb.age * 12) % 2 === 0;
  ctx.strokeStyle = bomb.remote ? COLORS.cyan : hot ? COLORS.rose : COLORS.amber;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 5, PI * 1.05, PI * 1.45);
  ctx.moveTo(cx + 4, cy - r + 1);
  ctx.quadraticCurveTo(cx + 9, cy - r - 5, cx + 12, cy - r - 4);
  ctx.stroke();
  const spark = 3 + Math.abs(pulse) * 2;
  ctx.strokeStyle = COLORS.rose;
  ctx.beginPath();
  ctx.moveTo(cx + 12 - spark, cy - r - 4);
  ctx.lineTo(cx + 12 + spark, cy - r - 4);
  ctx.moveTo(cx + 12, cy - r - 4 - spark);
  ctx.lineTo(cx + 12, cy - r - 4 + spark);
  ctx.stroke();
  if (bomb.remote) {
    ctx.fillStyle = COLORS.cyan;
    ctx.font = "bold 10px " + MONO;
    ctx.textAlign = "center";
    ctx.fillText("D", cx, cy + 4);
  }
}

// Draws the four arms of a flame cell in "up" local space, rotated into place by quarter turns.
function armPoint(ctx, cx, cy, sin, cos, ax, ay, line) {
  const x = cx + ax * cos - ay * sin;
  const y = cy + ax * sin + ay * cos;
  if (line) ctx.lineTo(x, y);
  else ctx.moveTo(x, y);
}

function flameArms(ctx, cx, cy, mask) {
  const h = 7;
  const edge = -TILE / 2;
  for (let d = 0; d < 4; d += 1) {
    const sin = d === 1 ? 1 : d === 3 ? -1 : 0;
    const cos = d === 0 ? 1 : d === 2 ? -1 : 0;
    if (mask & (1 << d)) {
      armPoint(ctx, cx, cy, sin, cos, -h, -h, false);
      armPoint(ctx, cx, cy, sin, cos, -h, edge, true);
      armPoint(ctx, cx, cy, sin, cos, h, -h, false);
      armPoint(ctx, cx, cy, sin, cos, h, edge, true);
      armPoint(ctx, cx, cy, sin, cos, 0, -4, false);
      armPoint(ctx, cx, cy, sin, cos, 3, -9, true);
      armPoint(ctx, cx, cy, sin, cos, -3, -14, true);
      armPoint(ctx, cx, cy, sin, cos, 3, -19, true);
      armPoint(ctx, cx, cy, sin, cos, 0, edge, true);
    } else {
      armPoint(ctx, cx, cy, sin, cos, -h, -h, false);
      armPoint(ctx, cx, cy, sin, cos, h, -h, true);
    }
  }
}

function drawFlame(ctx, index, life, mask) {
  const x = index % COLS;
  const y = (index - x) / COLS;
  const cx = (x + 0.5) * TILE;
  const cy = (y + 0.5) * TILE;
  const t = life / 0.5;
  ctx.globalAlpha = Math.min(1, 0.45 + t);
  ctx.strokeStyle = t > 0.5 ? COLORS.amber : COLORS.rose;
  ctx.lineWidth = 2;
  ctx.beginPath();
  flameArms(ctx, cx, cy, mask);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawDoor(ctx, world) {
  const door = world.exit;
  const cx = (door.x + 0.5) * TILE;
  const cy = (door.y + 0.5) * TILE;
  const open = world.foes === 0;
  const pulse = 0.5 + Math.sin(world.clock * (open ? 7 : 3)) * 0.5;
  ctx.strokeStyle = open ? COLORS.cyan : COLORS.dim;
  ctx.globalAlpha = open ? 0.6 + pulse * 0.4 : 0.9;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy + 16);
  ctx.lineTo(cx - 12, cy - 6);
  ctx.arc(cx, cy - 6, 12, PI, 0);
  ctx.lineTo(cx + 12, cy + 16);
  ctx.closePath();
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (open) {
    ctx.moveTo(cx - 12, cy + 16);
    ctx.lineTo(cx - 5, cy + 12);
    ctx.lineTo(cx - 5, cy - 10);
    ctx.lineTo(cx - 12, cy - 6);
    ctx.moveTo(cx + 3, cy + 6);
    ctx.lineTo(cx + 3, cy + 1);
    ctx.moveTo(cx, cy + 3.5);
    ctx.lineTo(cx + 6, cy + 3.5);
  } else {
    ctx.setLineDash([3, 3]);
    ctx.rect(cx - 7, cy - 8, 14, 22);
    ctx.moveTo(cx - 7, cy - 8);
    ctx.lineTo(cx + 7, cy + 14);
    ctx.moveTo(cx + 7, cy - 8);
    ctx.lineTo(cx - 7, cy + 14);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  if (open) {
    ctx.strokeStyle = COLORS.cyan;
    ctx.setLineDash([4, 5]);
    ctx.lineDashOffset = -world.clock * 14;
    ctx.beginPath();
    ctx.arc(cx, cy, 17 + pulse * 2, 0, PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = open ? COLORS.cyan : COLORS.dim;
  ctx.font = "bold 8px " + MONO;
  ctx.textAlign = "center";
  ctx.fillText("EXIT", cx, cy - 25);
}

function drawItem(ctx, world) {
  const item = world.item;
  if (!item.revealed || item.taken || item.gone) return;
  const power = POWERUPS[item.type];
  const cx = (item.x + 0.5) * TILE;
  const cy = (item.y + 0.5) * TILE;
  const pulse = 1 + Math.sin(world.clock * 6) * 0.12;
  ctx.lineWidth = 2;
  diamond(ctx, cx, cy, 13 * pulse, power.color, power.glyph, "bold 12px " + MONO);
  ctx.font = "8px " + MONO;
  ctx.fillText(power.label, cx, cy - 17);
}

function drawFx(ctx, world) {
  const fx = world.fx;
  for (let i = 0; i < fx.length; i += 1) {
    const f = fx[i];
    const k = f.t / f.life;
    ctx.globalAlpha = 1 - k;
    ctx.strokeStyle = f.color;
    ctx.fillStyle = f.color;
    if (f.kind === "text") {
      ctx.font = "bold 11px " + MONO;
      ctx.textAlign = "center";
      ctx.fillText(f.text, f.x, f.y - k * 22);
    } else {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r + k * 26, 0, PI * 2);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

// ---------- HUD ----------

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function drawHud(ctx, world, hi) {
  const p = world.player;
  ctx.fillStyle = COLORS.panel;
  ctx.fillRect(0, 0, CANVAS_W, HUD_H);
  const top = 5;
  const h = 50;
  drawPanel(ctx, 6, top, 118, h, COLORS.cyan, ["SCORE"]);
  ctx.font = FONT_BOLD;
  ctx.fillStyle = COLORS.text;
  ctx.fillText(String(world.score).padStart(6, "0"), 14, top + 33);
  ctx.font = FONT;
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(`HI ${String(Math.max(hi, world.score)).padStart(6, "0")}`, 14, top + 46);

  const low = world.timeLeft <= 30 || world.timeUp;
  drawPanel(ctx, 130, top, 92, h, low ? COLORS.rose : COLORS.lime, ["TIME"]);
  ctx.font = FONT_BOLD;
  ctx.fillStyle = low && Math.floor(world.clock * 3) % 2 === 0 ? COLORS.rose : COLORS.text;
  ctx.fillText(formatTime(world.timeLeft), 138, top + 33);
  ctx.font = FONT;
  ctx.fillStyle = world.timeUp ? COLORS.rose : COLORS.muted;
  ctx.fillText(world.timeUp ? "OVERDUE!" : `+${Math.floor(world.timeLeft) * 10} bonus`, 138, top + 46);

  drawPanel(ctx, 228, top, 92, h, COLORS.rose, ["LIVES"]);
  ctx.strokeStyle = COLORS.rose;
  ctx.lineWidth = 1.5;
  const shown = Math.min(Math.max(world.lives, 0), 5);
  for (let i = 0; i < shown; i += 1) {
    const x = 242 + i * 14;
    ctx.beginPath();
    ctx.arc(x, top + 30, 4.5, 0, PI * 2);
    ctx.moveTo(x, top + 25.5);
    ctx.lineTo(x, top + 22);
    ctx.moveTo(x - 4, top + 35);
    ctx.lineTo(x + 4, top + 35);
    ctx.stroke();
  }
  ctx.font = FONT;
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(world.lives > 5 ? `x${world.lives}` : p.state === "dying" ? "..." : `${Math.max(0, world.lives)} left`, 236, top + 46);

  drawPanel(ctx, 326, top, 128, h, world.info.accent, [`STAGE ${world.info.label}`]);
  ctx.font = FONT;
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(world.info.areaName, 334, top + 29);
  ctx.fillStyle = world.foes === 0 ? COLORS.lime : COLORS.text;
  ctx.fillText(`FOES ${world.foes}`, 334, top + 43);

  drawPanel(ctx, 460, top, CANVAS_W - 466, h, COLORS.amber, ["POWER-UPS"]);
  let slot = 0;
  for (let i = 0; i < POWERUP_ORDER.length; i += 1) {
    const id = POWERUP_ORDER[i];
    let label;
    if (id === "fire") label = `${p.fire}`;
    else if (id === "bomb") label = `${p.bombs}`;
    else if (id === "speed") label = `${p.speed + 1}`;
    else if (id === "mystery") label = p.mystery > 0 ? `${Math.ceil(p.mystery)}s` : null;
    else label = p[id] ? "ON" : null;
    if (label === null) continue;
    const x = 472 + slot * 26;
    ctx.lineWidth = 1.5;
    diamond(ctx, x, top + 29, 8, POWERUPS[id].color, POWERUPS[id].glyph, "bold 9px " + MONO);
    ctx.font = "8px " + MONO;
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(label, x, top + 46);
    slot += 1;
  }
  ctx.textAlign = "left";
}

function caption(ctx, text, y, color) {
  ctx.font = "bold 11px " + MONO;
  const w = text.length * 6.9 + 18;
  ctx.fillStyle = "rgba(8, 10, 15, 0.82)";
  ctx.fillRect(VIEW_W / 2 - w / 2, y - 12, w, 20);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(VIEW_W / 2 - w / 2 + 0.5, y - 11.5, w, 20);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(text, VIEW_W / 2, y + 3);
  ctx.textAlign = "left";
}

// overlay: null | "ready" | "paused" | "won" | "lost"
export function drawBomberman(ctx, world, overlay, hi = 0, nextLabel = "") {
  const ratio = ctx.getTransform().a || 1;
  const camX = Math.round(world.cam * ratio) / ratio;
  const info = world.info;
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  const p = world.player;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, HUD_H, VIEW_W, FIELD_H);
  ctx.clip();
  ctx.drawImage(staticLayer(info.accent, ratio), camX * ratio, 0, VIEW_W * ratio, FIELD_H * ratio, 0, HUD_H, VIEW_W, FIELD_H);
  ctx.translate(-camX, HUD_H);

  const c0 = Math.max(0, Math.floor(camX / TILE));
  const c1 = Math.min(COLS - 1, c0 + VIEW_COLS);
  const sprite = softSprite(ratio);
  for (let y = 1; y < ROWS - 1; y += 1) {
    for (let x = c0; x <= c1; x += 1) {
      if (world.tiles[y * COLS + x] === SOFT) ctx.drawImage(sprite, x * TILE, y * TILE, TILE, TILE);
    }
  }

  if (world.exit.revealed) drawDoor(ctx, world);
  drawItem(ctx, world);

  for (let y = 1; y < ROWS - 1; y += 1) {
    for (let x = c0; x <= c1; x += 1) {
      const index = y * COLS + x;
      if (world.flame[index] > 0) drawFlame(ctx, index, world.flame[index], world.flameMask[index]);
    }
  }
  for (let i = 0; i < world.bombs.length; i += 1) drawBomb(ctx, world.bombs[i]);

  const clock = world.clock;
  for (let i = 0; i < world.enemies.length; i += 1) {
    const enemy = world.enemies[i];
    if (enemy.x > camX - 40 && enemy.x < camX + VIEW_W + 40) drawEnemy(ctx, enemy, clock);
  }

  const blink = p.state === "alive" && p.invuln > 0 && Math.floor(clock * 12) % 2 === 0;
  if (!blink) {
    let color = COLORS.cyan;
    if (p.mystery > 0) {
      const colors = [COLORS.teal, COLORS.lime, COLORS.amber, COLORS.pink];
      color = colors[Math.floor(clock * 10) % colors.length];
    }
    drawBomber(ctx, p, clock, color);
    if (p.mystery > 0 || (p.invuln > 0 && p.state === "alive")) {
      ctx.strokeStyle = p.mystery > 0 ? COLORS.teal : COLORS.muted;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 24, 0, PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  drawFx(ctx, world);
  ctx.restore();

  drawHud(ctx, world, hi);

  if (!overlay) {
    if (world.timeUpBanner > 0 && Math.floor(world.clock * 4) % 2 === 0) caption(ctx, "TIME UP! THE DAEMONS ARE HUNTING YOU", HUD_H + 36, COLORS.rose);
    else if (world.msgT > 0 && world.msg) caption(ctx, world.msg, HUD_H + 36, COLORS.amber);
    else caption(ctx, stageObjective(world), HUD_H + 16, world.foes === 0 && world.exit.revealed ? COLORS.cyan : COLORS.muted);
  }

  if (overlay === "ready") {
    const stage = stageInfo(info.level, world.difficulty);
    const foes = stage.roster.map(([type, count]) => `${count}× ${ENEMY_TYPES[type].name}`).join("  ·  ");
    drawOverlay(ctx, CANVAS_W, CANVAS_H, `STAGE ${info.label} — PRESS W A S D TO START`, `OBJECTIVE: FIND THE EXIT DOOR · KILL ALL ${world.foes} ENEMIES · STEP INTO THE EXIT`, info.accent, [
      foes,
      `${info.areaName} AREA · TIME ${formatTime(world.timeMax)} · A POWER-UP IS HIDDEN UNDER A BLOCK`,
      "SPACE / J BOMB · K / ENTER DETONATE · P PAUSE",
    ]);
  } else if (overlay === "paused") {
    drawOverlay(ctx, CANVAS_W, CANVAS_H, "PAUSED — PRESS P", "FIND THE EXIT, KILL EVERY ENEMY, THEN WALK INTO THE DOOR", COLORS.amber);
  } else if (overlay === "won") {
    drawOverlay(ctx, CANVAS_W, CANVAS_H, "STAGE CLEAR", `TIME BONUS +${world.clearBonus}  ·  NEXT: STAGE ${nextLabel}`, COLORS.lime);
  } else if (overlay === "lost") {
    drawOverlay(ctx, CANVAS_W, CANVAS_H, "GAME OVER", `STAGE ${info.label} · SCORE ${world.score}`, COLORS.rose);
  }
  ctx.textAlign = "left";
}
