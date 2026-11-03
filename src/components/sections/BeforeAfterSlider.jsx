import { useState } from "react";

export default function BeforeAfterSlider() {
  const [position, setPosition] = useState(52);

  return (
    <section className="bg-slate-950 px-5 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.2em] text-cyan-300">A visible difference</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Before &amp; after, side by side</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-slate-400">Drag the handle or use the arrow keys to compare both versions.</p>
        </div>

        <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-3xl bg-slate-800 shadow-2xl sm:aspect-[16/8]">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85"
            alt="Room before the redesign"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${position}%` }}>
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85"
              alt="Room after the redesign"
              className="absolute inset-0 h-full w-full max-w-none object-cover"
              style={{ width: position ? `${10000 / position}%` : "100%" }}
            />
            <span className="absolute left-4 top-4 rounded-full bg-slate-950/70 px-3 py-1.5 text-xs font-semibold backdrop-blur">AFTER</span>
          </div>
          <span className="absolute right-4 top-4 rounded-full bg-slate-950/70 px-3 py-1.5 text-xs font-semibold backdrop-blur">BEFORE</span>
          <div className="pointer-events-none absolute inset-y-0 z-10" style={{ left: `${position}%` }}>
            <div className="absolute inset-y-0 left-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_16px_rgba(15,23,42,.65)]" />
            <div className="absolute left-0 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-slate-950/70 text-white shadow-xl backdrop-blur">
              <span aria-hidden="true">↔</span>
            </div>
          </div>
          <label htmlFor="before-after-range" className="sr-only">Drag to compare before and after images</label>
          <input
            id="before-after-range"
            type="range"
            min="0"
            max="100"
            value={position}
            onChange={(event) => setPosition(Number(event.target.value))}
            aria-valuetext={`${position}% after image visible`}
            className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0 focus-visible:opacity-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white [touch-action:pan-y]"
          />
        </div>
        <div className="mt-4 flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
          <span>After · {position}%</span><span>Before</span>
        </div>
      </div>
    </section>
  );
}
