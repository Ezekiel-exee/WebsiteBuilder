import { useEffect, useMemo, useRef, useState } from "react";

const ROI_CALCULATOR_FORMAT = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function RoiCalculator() {
  const sectionRef = useRef(null);
  const [teamSize, setTeamSize] = useState(8);
  const [monthlyTasks, setMonthlyTasks] = useState(1200);
  const [conversionLift, setConversionLift] = useState(4);
  const [displayTotal, setDisplayTotal] = useState(0);
  const animatedTotalRef = useRef(0);
  const estimate = useMemo(() => {
    const hoursReturned = Math.min(teamSize * 40, monthlyTasks * 12 * 0.65 / 60);
    const laborValue = hoursReturned * 42;
    const conversionValue = monthlyTasks * (conversionLift / 100) * 85;
    const platformCost = monthlyTasks * 0.035;
    return { hoursReturned, laborValue, conversionValue, platformCost, total: laborValue + conversionValue - platformCost };
  }, [teamSize, monthlyTasks, conversionLift]);

  useEffect(() => {
    const frameWindow = sectionRef.current?.ownerDocument.defaultView;
    if (!frameWindow) return undefined;
    const from = animatedTotalRef.current;
    const to = estimate.total;
    const start = frameWindow.performance.now();
    const duration = 500;
    let frame = 0;
    const animateCount = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      const value = Math.round(from + (to - from) * eased);
      animatedTotalRef.current = value;
      setDisplayTotal(value);
      if (progress < 1) frame = frameWindow.requestAnimationFrame(animateCount);
      else {
        animatedTotalRef.current = to;
        setDisplayTotal(to);
      }
    };
    frame = frameWindow.requestAnimationFrame(animateCount);
    return () => frameWindow.cancelAnimationFrame(frame);
  }, [estimate.total]);

  return (
    <section ref={sectionRef} className="bg-slate-950 px-5 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[.2em] text-emerald-300">Plan with confidence</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">See the value before you scale</h2>
          <p className="mt-3 text-slate-400">Adjust the assumptions to estimate your monthly operational impact.</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.9fr]">
          <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[.04] p-6 sm:p-8">
            <label className="block">
              <span className="flex items-center justify-between text-sm font-medium"><span>Team size</span><strong className="text-emerald-200">{teamSize} people</strong></span>
              <input aria-label="Team size" type="range" min="1" max="40" value={teamSize} onChange={(event) => setTeamSize(Number(event.target.value))} className="mt-4 w-full accent-emerald-400" />
              <span className="mt-1 flex justify-between text-xs text-slate-500"><span>1</span><span>40</span></span>
            </label>
            <label className="block">
              <span className="flex items-center justify-between text-sm font-medium"><span>Tasks per month</span><strong className="text-emerald-200">{monthlyTasks.toLocaleString()}</strong></span>
              <input aria-label="Tasks per month" type="range" min="100" max="5000" step="100" value={monthlyTasks} onChange={(event) => setMonthlyTasks(Number(event.target.value))} className="mt-4 w-full accent-emerald-400" />
              <span className="mt-1 flex justify-between text-xs text-slate-500"><span>100</span><span>5,000</span></span>
            </label>
            <label className="block">
              <span className="flex items-center justify-between text-sm font-medium"><span>Conversion lift</span><strong className="text-emerald-200">{conversionLift}%</strong></span>
              <input aria-label="Conversion lift" type="range" min="0" max="15" value={conversionLift} onChange={(event) => setConversionLift(Number(event.target.value))} className="mt-4 w-full accent-emerald-400" />
              <span className="mt-1 flex justify-between text-xs text-slate-500"><span>0%</span><span>15%</span></span>
            </label>
            <p className="text-xs leading-relaxed text-slate-500">Estimate uses 12 minutes saved per task, a $42 hourly cost, and an $85 average order value. Replace these assumptions with your own data.</p>
          </div>

          <div className="rounded-3xl border border-emerald-300/20 bg-gradient-to-br from-emerald-400/10 to-cyan-400/[.04] p-6 sm:p-8">
            <p className="text-sm font-medium text-emerald-100">Estimated monthly value</p>
            <p className="mt-2 text-5xl font-bold tracking-tight tabular-nums">{ROI_CALCULATOR_FORMAT.format(displayTotal)}</p>
            <p className="mt-2 text-sm text-slate-400 tabular-nums">{ROI_CALCULATOR_FORMAT.format(displayTotal * 12)} annualized · {estimate.hoursReturned.toFixed(0)} team hours returned</p>
            <div className="mt-8 space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">Labor value</span><span>{ROI_CALCULATOR_FORMAT.format(estimate.laborValue)}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-300 transition-all duration-300" style={{ width: `${Math.min(100, estimate.laborValue / Math.max(estimate.total, 1) * 100)}%` }} /></div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">Conversion value</span><span>{ROI_CALCULATOR_FORMAT.format(estimate.conversionValue)}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-300 transition-all duration-300" style={{ width: `${Math.min(100, estimate.conversionValue / Math.max(estimate.total, 1) * 100)}%` }} /></div>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-4 text-sm"><span className="text-slate-400">Estimated platform cost</span><span className="text-slate-300">−{ROI_CALCULATOR_FORMAT.format(estimate.platformCost)}</span></div>
            </div>
            <p className="mt-6 text-xs text-slate-500">Illustrative estimate only; actual results vary by workflow and adoption.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
