import { useEffect, useMemo, useState } from "react";
import { colorToHex } from "../../utils/customizer";

const PALETTE = [
  "#0f172a", "#334155", "#64748b", "#cbd5e1", "#ffffff", "#000000",
  "#7f1d1d", "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e",
];

function normalizeHex(value) {
  const clean = value.trim().replace(/^#/, "");
  if (/^[\da-f]{3}$/i.test(clean)) {
    return `#${clean.split("").map((digit) => digit + digit).join("").toLowerCase()}`;
  }
  return /^[\da-f]{6}$/i.test(clean) ? `#${clean.toLowerCase()}` : null;
}

function hexToRgb(hex) {
  const value = normalizeHex(hex)?.slice(1) || "000000";
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
}

function rgbToHex(red, green, blue) {
  return `#${[red, green, blue].map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`;
}

function hsvToHex(hue, saturation, brightness) {
  const chroma = brightness * saturation;
  const section = hue / 60;
  const secondary = chroma * (1 - Math.abs((section % 2) - 1));
  const offset = brightness - chroma;
  const channels = section < 1 ? [chroma, secondary, 0]
    : section < 2 ? [secondary, chroma, 0]
      : section < 3 ? [0, chroma, secondary]
        : section < 4 ? [0, secondary, chroma]
          : section < 5 ? [secondary, 0, chroma] : [chroma, 0, secondary];
  return rgbToHex(...channels.map((channel) => (channel + offset) * 255));
}

function hexToHsv(hex) {
  const [red, green, blue] = hexToRgb(hex).map((value) => value / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;
  if (delta) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6);
    else if (max === green) hue = 60 * ((blue - red) / delta + 2);
    else hue = 60 * ((red - green) / delta + 4);
  }
  return {
    hue: (hue + 360) % 360,
    saturation: max === 0 ? 0 : delta / max,
    brightness: max,
  };
}

export default function ColorPicker({ label, value, kind, onChange, disabled = false }) {
  const selectedColor = colorToHex(value, kind);
  const [hexInput, setHexInput] = useState(selectedColor);
  const [rgbDraft, setRgbDraft] = useState(hexToRgb(selectedColor).map(String));
  const [wheel, setWheel] = useState(() => hexToHsv(selectedColor));

  useEffect(() => {
    setHexInput(selectedColor);
    setRgbDraft(hexToRgb(selectedColor).map(String));
    setWheel(hexToHsv(selectedColor));
  }, [selectedColor]);

  const rgb = useMemo(() => hexToRgb(selectedColor), [selectedColor]);
  const setColor = (hex) => {
    const normalized = normalizeHex(hex);
    if (!normalized) return;
    setHexInput(normalized);
    setRgbDraft(hexToRgb(normalized).map(String));
    setWheel(hexToHsv(normalized));
    onChange(normalized);
  };

  const updateWheel = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    const distance = Math.min(1, Math.hypot(x, y) / (bounds.width / 2));
    const angle = (Math.atan2(y, x) * 180 / Math.PI + 450) % 360;
    const nextWheel = { hue: angle, saturation: distance, brightness: wheel.brightness };
    setWheel(nextWheel);
    setColor(hsvToHex(nextWheel.hue, nextWheel.saturation, nextWheel.brightness));
  };

  const markerAngle = (wheel.hue - 90) * Math.PI / 180;
  const markerRadius = wheel.saturation * 46;
  const markerStyle = {
    left: `${50 + Math.cos(markerAngle) * markerRadius}%`,
    top: `${50 + Math.sin(markerAngle) * markerRadius}%`,
    backgroundColor: selectedColor,
  };

  return (
    <details className={`group relative min-w-0 ${disabled ? "opacity-40" : ""}`}>
      <summary
        aria-label={`${label} color`}
        aria-disabled={disabled}
        className={`flex h-8 cursor-pointer list-none items-center gap-2 rounded-md border border-white/10 bg-zinc-950 px-2 text-xs text-zinc-100 outline-none transition ${disabled ? "cursor-not-allowed" : "hover:border-white/20 group-open:border-cyan-400/60"}`}
        onClick={(event) => { if (disabled) event.preventDefault(); }}
      >
        <span className="h-4 w-4 shrink-0 rounded border border-white/20" style={{ backgroundColor: selectedColor }} />
        <span className="truncate font-mono uppercase">{selectedColor}</span>
        <span className="ml-auto text-zinc-500">▾</span>
      </summary>
      <div className="absolute left-0 top-full z-[100] mt-2 w-[min(20rem,calc(100vw-3rem))] rounded-xl border border-white/10 bg-zinc-950 p-3 shadow-2xl shadow-black/60">
        <div className="flex items-start gap-3">
          <div
            role="application"
            aria-label={`${label} hue and saturation wheel`}
            className="relative aspect-square w-36 shrink-0 touch-none cursor-crosshair rounded-full"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,${1 - wheel.brightness}), rgba(0,0,0,${1 - wheel.brightness})), radial-gradient(circle, white 0%, transparent 72%), conic-gradient(red, yellow, lime, cyan, blue, magenta, red)`,
            }}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              updateWheel(event);
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) updateWheel(event);
            }}
          >
            <span className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_1px_4px_rgba(0,0,0,.8)]" style={markerStyle} />
          </div>
          <div className="grid min-w-0 flex-1 gap-3">
            <label className="grid gap-1 text-[10px] text-zinc-400">
              Brightness
              <input
                aria-label={`${label} brightness`}
                type="range"
                min="0"
                max="100"
                value={Math.round(wheel.brightness * 100)}
                onChange={(event) => {
                  const brightness = Number(event.target.value) / 100;
                  setWheel((current) => ({ ...current, brightness }));
                  setColor(hsvToHex(wheel.hue, wheel.saturation, brightness));
                }}
                className="w-full accent-cyan-400"
              />
            </label>
            <label className="grid gap-1 text-[10px] text-zinc-400">
              HEX
              <input
                aria-label={`${label} HEX`}
                value={hexInput}
                onChange={(event) => {
                  setHexInput(event.target.value);
                  if (/^#?[\da-f]{6}$/i.test(event.target.value.trim())) {
                    const normalized = normalizeHex(event.target.value);
                    if (normalized) setColor(normalized);
                  }
                }}
                onBlur={() => {
                  const normalized = normalizeHex(hexInput);
                  if (normalized) setColor(normalized);
                  else setHexInput(selectedColor);
                }}
                className="h-8 min-w-0 rounded-md border border-white/10 bg-zinc-900 px-2 font-mono text-xs uppercase text-white outline-none focus:border-cyan-400/60"
                spellCheck="false"
              />
            </label>
          </div>
        </div>
        <fieldset className="mt-3">
          <legend className="mb-1.5 text-[10px] text-zinc-400">RGB</legend>
          <div className="grid grid-cols-3 gap-2">
            {["R", "G", "B"].map((channel, index) => (
              <label key={channel} className="grid gap-1 text-[9px] text-zinc-500">
                {channel}
                <input
                  aria-label={`${label} RGB ${channel}`}
                  type="number"
                  min="0"
                  max="255"
                  value={rgbDraft[index]}
                  onChange={(event) => {
                    const nextDraft = [...rgbDraft];
                    nextDraft[index] = event.target.value;
                    setRgbDraft(nextDraft);
                    if (nextDraft.every((part) => part !== "" && Number.isFinite(Number(part)))) {
                      setColor(rgbToHex(...nextDraft.map((part) => Math.max(0, Math.min(255, Number(part))))));
                    }
                  }}
                  className="h-8 min-w-0 rounded-md border border-white/10 bg-zinc-900 px-2 font-mono text-xs text-white outline-none focus:border-cyan-400/60"
                />
              </label>
            ))}
          </div>
          <output className="mt-1 block text-right font-mono text-[9px] text-zinc-600">
            rgb({rgb.join(", ")})
          </output>
        </fieldset>
        <div className="mt-3 border-t border-white/10 pt-3">
          <p className="mb-2 text-[10px] text-zinc-400">Palette</p>
          <div className="grid grid-cols-8 gap-1.5">
            {PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`${label} palette ${color}`}
                title={color}
                onClick={() => setColor(color)}
                className={`aspect-square rounded border ${selectedColor === color ? "border-white ring-1 ring-cyan-400" : "border-white/10 hover:border-white/60"}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}
