import { COLORS, FONT, clearCanvas, drawOverlay, drawPanel } from "../arcadeKit";
import { FLAG, HIDDEN, OPEN, canChord, formatTime } from "./minesweeperEngine";

export const REVEAL_MS = 200;

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const NUMBER_COLORS = ["", COLORS.cyan, COLORS.lime, COLORS.rose, COLORS.violet, COLORS.amber, COLORS.teal, COLORS.pink, COLORS.text];
const DIGITS = ["", "1", "2", "3", "4", "5", "6", "7", "8"];
const SPIKES = Array.from({ length: 8 }, (_, i) => [Math.cos((i * Math.PI) / 4), Math.sin((i * Math.PI) / 4)]);
const HIDDEN_FILL = "#0e131b";
const OPEN_FILL = "#05070b";
const BEVEL_LIGHT = "rgba(148, 163, 184, 0.38)";
const BEVEL_DARK = "rgba(2, 6, 12, 0.9)";

function drawFlag(ctx, x, y, c, color) {
  const px = x + c * 0.42;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(px, y + c * 0.2);
  ctx.lineTo(px, y + c * 0.78);
  ctx.moveTo(x + c * 0.28, y + c * 0.78);
  ctx.lineTo(x + c * 0.62, y + c * 0.78);
  ctx.moveTo(px, y + c * 0.2);
  ctx.lineTo(x + c * 0.74, y + c * 0.35);
  ctx.lineTo(px, y + c * 0.5);
  ctx.stroke();
}

function drawMine(ctx, x, y, c, color) {
  const cx = x + c / 2;
  const cy = y + c / 2;
  const r = c * 0.2;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  for (let i = 0; i < 8; i += 1) {
    const [dx, dy] = SPIKES[i];
    ctx.moveTo(cx + dx * r, cy + dy * r);
    ctx.lineTo(cx + dx * c * 0.34, cy + dy * c * 0.34);
  }
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.55, cy - r * 0.2);
  ctx.lineTo(cx - r * 0.2, cy - r * 0.55);
  ctx.stroke();
}

function drawCross(ctx, x, y, c, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + c * 0.22, y + c * 0.22);
  ctx.lineTo(x + c * 0.78, y + c * 0.78);
  ctx.moveTo(x + c * 0.78, y + c * 0.22);
  ctx.lineTo(x + c * 0.22, y + c * 0.78);
  ctx.stroke();
}

function drawHidden(ctx, x, y, c, hot) {
  ctx.fillStyle = hot ? "rgba(34, 211, 238, 0.14)" : HIDDEN_FILL;
  ctx.fillRect(x + 1, y + 1, c - 2, c - 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = BEVEL_LIGHT;
  ctx.beginPath();
  ctx.moveTo(x + 1.5, y + c - 1.5);
  ctx.lineTo(x + 1.5, y + 1.5);
  ctx.lineTo(x + c - 1.5, y + 1.5);
  ctx.stroke();
  ctx.strokeStyle = BEVEL_DARK;
  ctx.beginPath();
  ctx.moveTo(x + c - 1.5, y + 1.5);
  ctx.lineTo(x + c - 1.5, y + c - 1.5);
  ctx.lineTo(x + 1.5, y + c - 1.5);
  ctx.stroke();
  ctx.strokeStyle = hot ? COLORS.cyan : "#1f2a3a";
  ctx.strokeRect(x + 0.5, y + 0.5, c - 1, c - 1);
}

function drawOpen(ctx, x, y, c) {
  ctx.fillStyle = OPEN_FILL;
  ctx.fillRect(x, y, c, c);
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, c - 1, c - 1);
}

function drawHud(ctx, v) {
  const { game, layout } = v;
  const pad = 16;
  const gap = 8;
  const unit = (layout.width - pad * 2 - gap * 4) / 5.5;
  const widths = [unit * 1.5, unit, unit, unit, unit];
  const left = game.mines - game.flags;
  const time = formatTime(game.elapsed);
  const levelScore = v.score - v.startScore;
  const panels = [
    [COLORS.cyan, [`LEVEL ${v.level}`, `${game.rows}×${game.cols} · ${game.mines} mines`, v.difficulty.toUpperCase()]],
    [COLORS.rose, ["MINES", String(left), `${game.flags} flagged`]],
    [COLORS.amber, ["TIME", time, game.result !== "playing" ? "stopped" : game.placed ? "ticking" : "waiting"]],
    [COLORS.lime, ["BEST", v.best === null ? "--:--" : formatTime(v.best, true), "this board"]],
    [COLORS.violet, ["SCORE", String(v.score), `+${levelScore} lvl`]],
  ];
  let x = pad;
  for (let i = 0; i < panels.length; i += 1) {
    drawPanel(ctx, x, 12, widths[i] - 1, 48, panels[i][0], panels[i][1]);
    x += widths[i] + gap;
  }
}

export function drawMinesweeper(ctx, v) {
  const { game, layout, anim, now } = v;
  const { cell: c, ox, oy, width, height } = layout;
  const cols = game.cols;
  if (!layout.numFont) layout.numFont = `bold ${Math.max(10, Math.floor(c * 0.56))}px ${MONO}`;
  const lost = game.result === "lost";
  const won = game.result === "won";
  const overlay = v.mode !== null;
  const pulse = 0.5 + 0.5 * Math.sin(now / 130);

  clearCanvas(ctx, width, height, true, 40);
  drawHud(ctx, v);

  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.font = layout.numFont;
  const hover = overlay ? -1 : v.hover;
  const chordPreview = hover >= 0 && game.cell[hover] === OPEN && game.adj[hover] > 0 && !lost && !won;
  const hx = chordPreview ? hover % cols : -9;
  const hy = chordPreview ? (hover - hx) / cols : -9;

  for (let i = 0; i < game.n; i += 1) {
    const col = i % cols;
    const row = (i - col) / cols;
    const x = ox + col * c;
    const y = oy + row * c;
    const state = game.cell[i];
    const stamp = anim[i];
    const pending = stamp > now;
    const flash = stamp > 0 && !pending && now - stamp < REVEAL_MS ? 1 - (now - stamp) / REVEAL_MS : 0;

    if (state === OPEN && !pending) {
      if (game.mine[i]) {
        drawOpen(ctx, x, y, c);
        const pulseFill = 0.2 + 0.14 * pulse;
        ctx.fillStyle = `rgba(251, 113, 133, ${pulseFill})`;
        ctx.fillRect(x + 1, y + 1, c - 2, c - 2);
        drawMine(ctx, x, y, c, COLORS.rose);
      } else {
        drawOpen(ctx, x, y, c);
        if (flash > 0) {
          ctx.fillStyle = `rgba(34, 211, 238, ${flash * 0.3})`;
          ctx.fillRect(x, y, c, c);
        }
        const n = game.adj[i];
        if (n > 0) {
          ctx.fillStyle = NUMBER_COLORS[n];
          ctx.fillText(DIGITS[n], x + c / 2, y + c / 2 + 1);
        }
      }
      continue;
    }

    const isHot = i === hover || (chordPreview && state === HIDDEN && Math.abs(col - hx) <= 1 && Math.abs(row - hy) <= 1);
    if (lost && game.mine[i] && state !== FLAG) {
      drawOpen(ctx, x, y, c);
      drawMine(ctx, x, y, c, COLORS.muted);
      continue;
    }
    if (lost && state === FLAG && !game.mine[i]) {
      drawOpen(ctx, x, y, c);
      drawFlag(ctx, x, y, c, COLORS.dim);
      drawCross(ctx, x, y, c, COLORS.rose);
      continue;
    }
    drawHidden(ctx, x, y, c, isHot);
    if (state === FLAG) drawFlag(ctx, x, y, c, won ? COLORS.lime : COLORS.amber);
  }

  ctx.lineWidth = 1;
  ctx.strokeStyle = COLORS.dim;
  ctx.strokeRect(ox - 3.5, oy - 3.5, layout.boardW + 7, layout.boardH + 7);
  if (won || lost) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = won ? `rgba(163, 230, 53, ${0.55 + 0.45 * pulse})` : `rgba(251, 113, 133, ${0.5 + 0.4 * pulse})`;
    ctx.strokeRect(ox - 4, oy - 4, layout.boardW + 8, layout.boardH + 8);
  }

  if (!overlay && !won && !lost) {
    const cx = ox + (v.cursor % cols) * c;
    const cy = oy + Math.floor(v.cursor / cols) * c;
    ctx.strokeStyle = COLORS.cyan;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx + 2, cy + 2, c - 4, c - 4);
    if (canChord(game, v.cursor)) {
      ctx.strokeStyle = COLORS.violet;
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 1.5, cy - 1.5, c + 3, c + 3);
    }
  }

  ctx.textBaseline = "alphabetic";
  ctx.font = FONT;
  ctx.textAlign = "center";
  ctx.fillStyle = won ? COLORS.lime : lost ? COLORS.rose : COLORS.muted;
  ctx.fillText(v.message, width / 2, oy + layout.boardH + 22);
  ctx.textAlign = "left";

  if (v.mode === "ready") drawOverlay(ctx, width, height, "MINESWEEPER", "CLICK OR PRESS A KEY TO START", COLORS.lime, [`${game.rows}×${game.cols} · ${game.mines} MINES · FIRST TILE IS ALWAYS SAFE`]);
  else if (v.mode === "paused") drawOverlay(ctx, width, height, "PAUSED", "PRESS P OR CLICK TO RESUME", COLORS.amber);
}
