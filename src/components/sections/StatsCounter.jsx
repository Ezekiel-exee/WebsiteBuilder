import { useEffect, useRef, useState } from "react";

const STATS_COUNTER_ITEMS = [
  { value: 250, suffix: "K+", label: "Active users" },
  { value: 99.99, suffix: "%", label: "Uptime SLA", decimals: 2 },
  { value: 140, suffix: "+", label: "Countries" },
  { value: 4.9, suffix: "/5", label: "Average rating", decimals: 1 },
];

function StatsCountUp({ value, decimals = 0, start }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!start) return;
    let frame;
    const duration = 1800;
    const begin = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - begin) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, value]);

  return display.toFixed(decimals);
}

export default function StatsCounter() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {STATS_COUNTER_ITEMS.map((stat, i) => (
            <div
              key={stat.label}
              className={`group bg-white p-8 text-center transition-all duration-700 hover:bg-slate-50 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <p className="bg-gradient-to-br from-slate-900 to-slate-500 bg-clip-text text-5xl font-bold tabular-nums tracking-tight text-transparent">
                <StatsCountUp value={stat.value} decimals={stat.decimals} start={visible} />
                {stat.suffix}
              </p>
              <p className="mt-3 text-sm font-medium uppercase tracking-wider text-slate-500">{stat.label}</p>
              <div className="mx-auto mt-4 h-1 w-0 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-500 group-hover:w-12" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
