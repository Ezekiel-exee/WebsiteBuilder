import { useEffect, useRef } from "react";

// Shared look for every arcade canvas game (matches Byte Brawl): dark terminal background,
// thin outline line-art, monospace text, cyan/lime/rose/amber/violet accents.
export const COLORS = {
  bg: "#080a0f",
  grid: "#111923",
  panel: "#0b0d12",
  dim: "#475569",
  muted: "#94a3b8",
  text: "#e2e8f0",
  cyan: "#22d3ee",
  lime: "#a3e635",
  rose: "#fb7185",
  amber: "#fbbf24",
  violet: "#c084fc",
  sky: "#38bdf8",
  orange: "#fb923c",
  teal: "#2dd4bf",
  pink: "#f472b6",
};

export const FONT = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
export const FONT_BOLD = "bold 14px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
export const FONT_TITLE = "bold 20px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export const DIFFICULTY_IDS = ["easy", "medium", "hard"];

// Maps a KeyboardEvent to a direction vector (WASD + arrows) or null.
export function directionFromKey(key) {
  switch (key.toLowerCase()) {
    case "w":
    case "arrowup":
      return { x: 0, y: -1 };
    case "s":
    case "arrowdown":
      return { x: 0, y: 1 };
    case "a":
    case "arrowleft":
      return { x: -1, y: 0 };
    case "d":
    case "arrowright":
      return { x: 1, y: 0 };
    default:
      return null;
  }
}

export function clearCanvas(ctx, width, height, withGrid = true, cell = 40) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, width, height);
  if (!withGrid) return;
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= width; x += cell) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
  }
  for (let y = 0; y <= height; y += cell) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
  }
  ctx.stroke();
}

// Outlined HUD box with up to three lines of text: title (colored), then two muted lines.
export function drawPanel(ctx, x, y, w, h, color, lines = []) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w, h);
  ctx.font = FONT;
  ctx.textAlign = "left";
  lines.forEach((line, index) => {
    ctx.fillStyle = index === 0 ? color : COLORS.muted;
    ctx.fillText(line, x + 8, y + 15 + index * 14);
  });
}

// Centered dimmed overlay used for READY / PAUSED / stage banners.
export function drawOverlay(ctx, width, height, title, subtitle = "", color = COLORS.lime, extraLines = []) {
  ctx.fillStyle = "rgba(8, 10, 15, 0.72)";
  ctx.fillRect(0, 0, width, height);
  ctx.textAlign = "center";
  ctx.font = FONT_TITLE;
  ctx.fillStyle = color;
  ctx.fillText(title, width / 2, height / 2 - 6);
  ctx.font = "12px ui-monospace, monospace";
  ctx.fillStyle = COLORS.muted;
  if (subtitle) ctx.fillText(subtitle, width / 2, height / 2 + 20);
  extraLines.forEach((line, index) => ctx.fillText(line, width / 2, height / 2 + 40 + index * 18));
  ctx.textAlign = "left";
}

// Fixed-timestep game loop. While `running` is false it renders once (so overlays/final frames show).
// update(dt) advances the simulation by exactly `step` seconds; render() draws the current state.
// Both callbacks are read through a ref, so they may close over fresh React state without restarting the loop.
export function useGameLoop({ running, step = 1 / 60, maxSteps = 6, update, render, deps = [] }) {
  const callbacks = useRef({ update, render });
  callbacks.current = { update, render };
  useEffect(() => {
    if (!running) {
      callbacks.current.render();
      return undefined;
    }
    let frame = 0;
    let previous = 0;
    let accumulator = 0;
    const tick = (time) => {
      const delta = previous ? Math.min((time - previous) / 1000, step * maxSteps) : 0;
      previous = time;
      accumulator += delta;
      let steps = 0;
      while (accumulator >= step && steps < maxSteps) {
        callbacks.current.update(step);
        accumulator -= step;
        steps += 1;
      }
      callbacks.current.render();
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, step, maxSteps, ...deps]);
}

// Sets up a HiDPI-aware canvas context at a logical size; returns the 2D context.
export function prepareCanvas(canvas, width, height) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
    canvas.width = width * ratio;
    canvas.height = height * ratio;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  return ctx;
}
