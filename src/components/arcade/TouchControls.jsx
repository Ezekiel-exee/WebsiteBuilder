import { useRef, useState } from "react";

export const DIR_VECTORS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

const NO_DIRECTIONS = new Set();
const SURFACE = "border border-white/15 bg-zinc-900/70 backdrop-blur-sm shadow-lg shadow-black/40";

function buzz(ms = 8) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // Haptics are optional.
  }
}

// Console-style D-pad: one touch surface, so a thumb can slide between directions without lifting.
// Reports individual directions through onPress/onRelease so each game can map them like keyboard keys.
export function DPad({ onPress, onRelease, diagonals = false, label = "Directional pad" }) {
  const surface = useRef(null);
  const held = useRef(NO_DIRECTIONS);
  const pointer = useRef(null);
  const [lit, setLit] = useState(NO_DIRECTIONS);

  const apply = (next) => {
    const previous = held.current;
    if (next.size === previous.size && [...next].every((direction) => previous.has(direction))) return;
    held.current = next;
    setLit(next);
    for (const direction of previous) if (!next.has(direction)) onRelease?.(direction);
    let pressed = false;
    for (const direction of next) {
      if (previous.has(direction)) continue;
      pressed = true;
      onPress?.(direction);
    }
    if (pressed) buzz(6);
  };

  const read = (event) => {
    const rect = surface.current.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    const next = new Set();
    if (Math.hypot(x, y) < 0.2) return next;
    const ax = Math.abs(x);
    const ay = Math.abs(y);
    const horizontal = diagonals ? ax > ay * 0.5 : ax >= ay;
    const vertical = diagonals ? ay > ax * 0.5 : ay > ax;
    if (horizontal) next.add(x > 0 ? "right" : "left");
    if (vertical) next.add(y > 0 ? "down" : "up");
    return next;
  };

  const release = (event) => {
    if (pointer.current !== event.pointerId) return;
    pointer.current = null;
    apply(NO_DIRECTIONS);
  };

  const arm = (direction, glyph, position) => (
    <span
      aria-hidden="true"
      className={`absolute grid h-[calc(var(--pad)/3)] w-[calc(var(--pad)/3)] place-items-center font-mono text-base transition-colors ${position} ${lit.has(direction) ? "bg-cyan-300/30 text-cyan-100" : "bg-zinc-900/70 text-zinc-400"} ${SURFACE}`}
    >
      {glyph}
    </span>
  );

  return (
    <div
      ref={surface}
      role="group"
      aria-label={label}
      onPointerDown={(event) => {
        if (pointer.current !== null) return;
        event.preventDefault();
        pointer.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        apply(read(event));
      }}
      onPointerMove={(event) => {
        if (pointer.current === event.pointerId) apply(read(event));
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={(event) => event.preventDefault()}
      className="pointer-events-auto relative h-[var(--pad)] w-[var(--pad)] shrink-0 touch-none select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]"
    >
      {arm("up", "▲", "left-1/2 top-0 -translate-x-1/2 rounded-t-xl")}
      {arm("down", "▼", "bottom-0 left-1/2 -translate-x-1/2 rounded-b-xl")}
      {arm("left", "◀", "left-0 top-1/2 -translate-y-1/2 rounded-l-xl")}
      {arm("right", "▶", "right-0 top-1/2 -translate-y-1/2 rounded-r-xl")}
      <span aria-hidden="true" className="absolute left-1/2 top-1/2 h-[calc(var(--pad)/3)] w-[calc(var(--pad)/3)] -translate-x-1/2 -translate-y-1/2 bg-zinc-900/70" />
    </div>
  );
}

const TONES = {
  cyan: "border-cyan-300/40 text-cyan-100",
  rose: "border-rose-300/40 text-rose-100",
  amber: "border-amber-300/40 text-amber-100",
  lime: "border-lime-300/40 text-lime-100",
  zinc: "border-white/20 text-zinc-100",
};
const TONE_DOWN = {
  cyan: "bg-cyan-300/35",
  rose: "bg-rose-300/35",
  amber: "bg-amber-300/35",
  lime: "bg-lime-300/35",
  zinc: "bg-white/25",
};

// Round press-and-hold action button. Each button tracks its own pointer, so several can be held at once.
export function PadButton({ label, hint, onPress, onRelease, tone = "cyan", className = "" }) {
  const [down, setDown] = useState(false);
  const pointer = useRef(null);
  const end = (event) => {
    if (pointer.current !== event.pointerId) return;
    pointer.current = null;
    setDown(false);
    onRelease?.();
  };
  return (
    <button
      type="button"
      aria-label={hint || label}
      onPointerDown={(event) => {
        if (pointer.current !== null) return;
        event.preventDefault();
        pointer.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        setDown(true);
        buzz(10);
        onPress?.();
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => event.stopPropagation()}
      className={`pointer-events-auto grid h-[calc(var(--pad)*0.45)] w-[calc(var(--pad)*0.45)] touch-none select-none place-items-center rounded-full font-mono text-xs font-bold tracking-wide transition-colors [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] ${SURFACE} ${TONES[tone]} ${down ? TONE_DOWN[tone] : ""} ${className}`}
    >
      {label}
    </button>
  );
}

const BRAWL_KEYS = { left: "a", right: "d", down: "s", up: "w" };

// Shared gamepad layout for Byte Brawl (solo and online): D-pad moves/jumps/drops, FIRE is easiest to reach, JUMP above it.
export function brawlTouch(holdKey, releaseKey, onPause) {
  return {
    dpad: { diagonals: true, onPress: (direction) => holdKey(BRAWL_KEYS[direction]), onRelease: (direction) => releaseKey(BRAWL_KEYS[direction]) },
    buttons: [
      { id: "fire", label: "FIRE", tone: "rose", onPress: () => holdKey("j"), onRelease: () => releaseKey("j") },
      { id: "jump", label: "JUMP", tone: "cyan", onPress: () => holdKey("w"), onRelease: () => releaseKey("w") },
    ],
    onPause,
  };
}

// Positions action buttons like a gamepad: the first is the easiest to reach (lower right), the rest fan up and left.
const SLOTS = ["bottom-0 right-0", "bottom-[calc(var(--pad)*0.32)] right-[calc(var(--pad)*0.5)]", "bottom-[calc(var(--pad)*0.53)] right-0"];

// Fixed bottom overlay shown on touch devices and narrow screens only. Games describe what it contains.
export function TouchDock({ dpad, buttons = [], onPause, extra }) {
  return (
    <>
      <div aria-hidden="true" className="hidden h-60 max-sm:block pointer-coarse:block" />
      <div
        role="group"
        aria-label="Touch controls"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden items-end justify-between gap-3 bg-gradient-to-t from-black/60 to-transparent px-3 pt-10 pb-[max(1rem,env(safe-area-inset-bottom))] [--pad:clamp(8rem,40vw,10.5rem)] max-sm:flex pointer-coarse:flex"
      >
        {dpad ? <DPad {...dpad} /> : <div className="min-w-0 flex-1">{extra}</div>}
        {onPause && (
          <button
            type="button"
            onClick={onPause}
            aria-label="Pause or resume"
            className={`pointer-events-auto absolute left-1/2 top-2 -translate-x-1/2 touch-manipulation rounded-full px-4 py-1.5 font-mono text-[11px] font-semibold tracking-widest text-zinc-200 ${SURFACE}`}
          >
            II PAUSE
          </button>
        )}
        {buttons.length > 0 && (
          <div className="relative h-[var(--pad)] w-[var(--pad)] shrink-0">
            {buttons.map((button, index) => (
              <PadButton key={button.id} {...button} className={`absolute ${SLOTS[index] ?? SLOTS[0]}`} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
