import { useRef, useState } from "react";

const CRANE_PROJECTS = [
  { title: "Northstar campus", detail: "12 buildings · phase 2", value: "$24M", color: "from-amber-400 to-orange-500" },
  { title: "Harbor renewal", detail: "Waterfront · 68% complete", value: "68%", color: "from-cyan-400 to-blue-500" },
  { title: "Alder residences", detail: "240 homes · on schedule", value: "240", color: "from-emerald-400 to-teal-500" },
];

export default function ConstructionCrane() {
  const sceneRef = useRef(null);
  const [hookPosition, setHookPosition] = useState(50);
  const [carried, setCarried] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [notice, setNotice] = useState("Choose a project load, then move the hook to its drop zone.");

  const pickUp = (index) => {
    setCarried(index);
    setNotice(`${CRANE_PROJECTS[index].title} is on the hook. Choose a drop zone.`);
  };
  const dropLoad = (zone) => {
    if (carried === null) {
      setNotice("Select a project load before placing it.");
      return;
    }
    const project = CRANE_PROJECTS[carried];
    setUpdates((current) => [`${project.title} placed in ${zone}`, ...current].slice(0, 3));
    setCarried(null);
    setNotice(`${project.title} update delivered to ${zone}.`);
  };
  const handleHookPointerMove = (event) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const bounds = sceneRef.current.getBoundingClientRect();
    const position = ((event.clientX - bounds.left) / bounds.width) * 100;
    setHookPosition(Math.min(82, Math.max(12, position)));
  };
  const handleHookKeyDown = (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      setHookPosition((position) => Math.max(12, position - 2));
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setHookPosition((position) => Math.min(82, position + 2));
    } else if (event.key === "Home") {
      event.preventDefault();
      setHookPosition(12);
    } else if (event.key === "End") {
      event.preventDefault();
      setHookPosition(82);
    }
  };

  return (
    <section className="overflow-hidden bg-[#101820] px-6 py-20 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300 leading-relaxed">Built together</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-5xl leading-tight tracking-tight">Big plans are<br className="hidden sm:block" /> moving into place.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-300">Pick up a project update and deliver it to a site zone. Drag the hook to line up your next move.</p>
        </div>

        <div className="relative mt-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-800 to-slate-950 p-6 sm:p-8">
          <div ref={sceneRef} className="relative h-64 overflow-hidden rounded-2xl bg-slate-900/70 sm:h-72">
            <div className="absolute inset-x-0 bottom-0 h-14 border-t border-amber-100/20 bg-[linear-gradient(90deg,transparent_0_8%,rgba(245,158,11,.16)_8%_9%,transparent_9%_45%,rgba(245,158,11,.16)_45%_46%,transparent_46%_100%)]" />
            <div className="absolute bottom-10 left-[9%] h-28 w-5 rotate-[25deg] origin-bottom bg-gradient-to-r from-amber-300 to-amber-600 shadow-lg" />
            <div className="absolute bottom-[8.8rem] left-[8%] h-3 w-[72%] rounded-full bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 shadow-[0_8px_24px_rgba(245,158,11,.2)]" />
            <div className="absolute bottom-[8.8rem] left-[82%] h-3 w-16 -rotate-[18deg] origin-left rounded-full bg-amber-400" />
            <div className="absolute bottom-[8.8rem] h-24 w-1 bg-amber-300/80 transition-[left] duration-150 ease-out" style={{ left: `${hookPosition}%` }} />
            <button
              type="button"
              role="slider"
              aria-valuemin={12}
              aria-valuemax={82}
              aria-valuenow={Math.round(hookPosition)}
              aria-valuetext={`Hook at ${Math.round(hookPosition)} percent`}
              onPointerDown={(event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={handleHookPointerMove}
              onPointerUp={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
              }}
              onKeyDown={handleHookKeyDown}
              className="absolute z-10 grid h-10 w-10 -translate-x-1/2 touch-none cursor-grab place-items-center rounded-lg border border-amber-200/50 bg-amber-400 text-slate-950 shadow-[0_0_24px_rgba(251,191,36,.35)] transition-[left,box-shadow] duration-150 ease-out active:cursor-grabbing"
              style={{ left: `${hookPosition}%`, top: "calc(100% - 9.5rem)" }}
              aria-label={carried === null ? "Move crane hook" : `Move crane hook carrying ${CRANE_PROJECTS[carried].title}`}
            >
              <span className="text-lg font-black">⌄</span>
            </button>
            {carried !== null && (
              <div className="absolute z-20 -translate-x-1/2 rounded-lg border border-amber-200/40 bg-slate-800 px-4 py-2 text-center shadow-xl" style={{ left: `${hookPosition}%`, top: "calc(100% - 5.2rem)" }}>
                <span className="block text-xs font-bold text-amber-200">{CRANE_PROJECTS[carried].value}</span>
                <span className="block max-w-32 truncate text-xs text-slate-300">{CRANE_PROJECTS[carried].title}</span>
              </div>
            )}
            <div className="absolute bottom-4 right-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Site overview · live</div>
          </div>

          <label className="mt-6 grid gap-2 text-xs font-medium text-slate-300">
            Move the crane hook
            <input
              type="range"
              min="12"
              max="82"
              value={hookPosition}
              onChange={(event) => setHookPosition(Number(event.target.value))}
              className="h-2 w-full cursor-ew-resize accent-amber-400"
              aria-label="Move crane hook"
            />
          </label>

          <div className="mt-6 grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 leading-relaxed">Project loads · select to pick up</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {CRANE_PROJECTS.map((project, index) => (
                  <button
                    key={project.title}
                    type="button"
                    onClick={() => pickUp(index)}
                    aria-pressed={carried === index}
                    className={`rounded-xl border p-3 text-left transition hover:-translate-y-1 ${carried === index ? "border-amber-300 bg-amber-300/10" : "border-white/10 bg-white/5 hover:border-white/25"}`}
                  >
                    <span className={`mb-4 block h-1 w-12 rounded-full bg-gradient-to-r ${project.color}`} />
                    <span className="block text-xs font-semibold text-white">{project.title}</span>
                    <span className="mt-2 block text-xs text-slate-400">{project.detail}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 leading-relaxed">Drop zones</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {["North", "Harbor", "Alder"].map((zone) => (
                  <button key={zone} type="button" onClick={() => dropLoad(zone)} className="rounded-lg border border-dashed border-amber-200/30 px-2 py-2 text-[10px] text-amber-100 transition hover:bg-amber-300/10">
                    {zone}
                  </button>
                ))}
              </div>
              <p role="status" className="mt-4 min-h-8 text-xs leading-4 text-slate-400">{notice}</p>
              {updates.length > 0 && <p className="border-t border-white/10 pt-2 text-xs text-emerald-300 leading-relaxed">{updates[0]}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
