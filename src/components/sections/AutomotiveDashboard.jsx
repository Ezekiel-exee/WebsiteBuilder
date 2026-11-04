import { useState } from "react";

const AUTO_MENUS = ["Drive", "Design", "Range", "Safety"];
const AUTO_SPECS = [
  { label: "0–60 mph", value: "3.2 s", range: 74 },
  { label: "Range", value: "402 mi", range: 88 },
  { label: "Peak power", value: "670 hp", range: 67 },
];

export default function AutomotiveDashboard() {
  const [active, setActive] = useState(0);
  const [specIndex, setSpecIndex] = useState(1);
  const [rpm, setRpm] = useState(62);
  const circumference = 2 * Math.PI * 76;
  const spec = AUTO_SPECS[specIndex];

  const rotateMenu = (direction) => setActive((current) => (current + direction + AUTO_MENUS.length) % AUTO_MENUS.length);

  return (
    <section className="overflow-hidden bg-[#080b10] px-6 py-20 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-lime-300 leading-relaxed">Performance, in motion</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl leading-tight">Made to feel<br />every mile.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-400">A driver-focused dashboard concept with a rotary menu, live tachometer, and adjustable vehicle specs.</p>
        </div>

        <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 to-black p-6 shadow-xl sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr_1fr] lg:items-center">
            <div className="order-2 lg:order-1">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500 leading-relaxed">Vehicle systems</p>
              <div className="mt-4 flex items-center gap-4">
                <button type="button" onClick={() => rotateMenu(-1)} aria-label="Previous dashboard menu" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-slate-300 transition hover:border-lime-300/50 hover:text-lime-200">‹</button>
                <div className="min-w-0 flex-1 text-center">
                  <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Rotary selector</span>
                  <span className="mt-2 block truncate text-xl font-semibold text-lime-100">{AUTO_MENUS[active]}</span>
                </div>
                <button type="button" onClick={() => rotateMenu(1)} aria-label="Next dashboard menu" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-slate-300 transition hover:border-lime-300/50 hover:text-lime-200">›</button>
              </div>
              <div className="mx-auto mt-6 grid h-40 w-40 place-items-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_35%_30%,#334155,#0b0f14_65%)] shadow-[inset_0_2px_16px_rgba(255,255,255,.08),0_20px_40px_rgba(0,0,0,.4)]">
                <button type="button" onClick={() => rotateMenu(1)} aria-label="Rotate steering wheel menu" className="relative grid h-28 w-28 place-items-center rounded-full border-[10px] border-slate-500/60 bg-slate-950 text-xs font-bold tracking-widest text-lime-200 shadow-[inset_0_0_0_2px_rgba(255,255,255,.12)] transition-transform duration-500 ease-out" style={{ transform: `rotate(${active * 90}deg)` }}>
                  <span className="absolute inset-x-1 top-4 h-3 rounded-full bg-slate-400/40" />
                  <span className="absolute inset-x-1 bottom-4 h-3 rounded-full bg-slate-400/40" />
                  <span className="z-10 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-slate-800">EV</span>
                </button>
              </div>
              <div className="mt-6 flex justify-center gap-2">
                {AUTO_MENUS.map((menu, index) => (
                  <button key={menu} type="button" onClick={() => setActive(index)} aria-label={`Select ${menu}`} aria-pressed={active === index} className={`h-1.5 rounded-full transition-all ${active === index ? "w-7 bg-lime-300" : "w-1.5 bg-white/20"}`} />
                ))}
              </div>
            </div>

            <div className="order-1 flex flex-col items-center lg:order-2">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500 leading-relaxed">Power delivery</p>
              <div className="relative mt-4 grid h-64 w-64 place-items-center">
                <svg viewBox="0 0 200 200" className="h-full w-full -rotate-[135deg]" role="img" aria-label={`Tachometer at ${rpm} percent`}>
                  <circle cx="100" cy="100" r="76" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="9" strokeDasharray={`${circumference * 0.75} ${circumference}`} strokeLinecap="round" />
                  <circle cx="100" cy="100" r="76" fill="none" stroke="url(#auto-gauge)" strokeWidth="9" strokeDasharray={`${circumference * 0.75 * rpm / 100} ${circumference}`} strokeLinecap="round" className="transition-all duration-500" />
                  <defs><linearGradient id="auto-gauge"><stop stopColor="#84cc16" /><stop offset="1" stopColor="#22d3ee" /></linearGradient></defs>
                  {Array.from({ length: 11 }, (_, index) => (
                    <line key={index} x1="100" y1="13" x2="100" y2={index % 2 === 0 ? "25" : "20"} stroke="rgba(255,255,255,.42)" strokeWidth={index % 2 === 0 ? "2" : "1"} transform={`rotate(${index * 27 - 135} 100 100)`} />
                  ))}
                </svg>
                <div className="absolute inset-0 grid place-content-center text-center">
                  <span className="font-mono text-5xl font-light tracking-tight text-white">{(rpm * 0.078).toFixed(1)}</span>
                  <span className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-500">x1000 rpm</span>
                  <span className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-lime-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-300" /> Ready</span>
                </div>
              </div>
              <label className="w-full max-w-xs text-center text-xs uppercase tracking-[0.16em] text-slate-500">
                Tachometer response
                <input type="range" min="10" max="100" value={rpm} onChange={(event) => setRpm(Number(event.target.value))} className="mt-3 h-1.5 w-full accent-lime-300" aria-label="Tachometer progress" />
              </label>
            </div>

            <div className="order-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500 leading-relaxed">Vehicle specs</p>
                <span className="grid h-8 w-8 animate-spin place-items-center rounded-full border border-lime-300/30 text-lime-200 [animation-duration:8s]" aria-label="Engine system active">⚙</span>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{spec.label}</span>
                    <p className="mt-2 font-mono text-3xl font-semibold text-white leading-relaxed">{spec.value}</p>
                  </div>
                  <span className="text-xs text-lime-300">SPEC 0{specIndex + 1}</span>
                </div>
                <div className="mt-6 flex h-12 items-end gap-2" aria-hidden="true">
                  {[32, 54, 42, 72, 50, 86, 62, spec.range].map((height, index) => (
                    <span key={index} className="flex-1 rounded-t-sm bg-gradient-to-t from-lime-500/30 to-lime-300 transition-all duration-500" style={{ height: `${height}%`, opacity: 0.45 + index * 0.07 }} />
                  ))}
                </div>
                <label className="mt-6 block text-xs text-slate-500">
                  Explore the spec sheet
                  <input type="range" min="0" max={AUTO_SPECS.length - 1} value={specIndex} onChange={(event) => setSpecIndex(Number(event.target.value))} className="mt-2 h-1.5 w-full accent-lime-300" aria-label="Select vehicle specification" />
                </label>
                <div className="mt-4 flex justify-between text-xs uppercase tracking-wider text-slate-600"><span>Efficiency</span><span>Performance</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
