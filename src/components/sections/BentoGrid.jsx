import { useRef, useState } from "react";

const BENTO_ITEMS = [
  {
    title: "Lightning-fast builds",
    body: "Edge-optimized output that loads in under a second, everywhere on the planet.",
    icon: "bolt",
    className: "md:col-span-2 md:row-span-2",
    accent: "from-amber-400/30 to-orange-500/10",
  },
  {
    title: "Real-time collaboration",
    body: "Edit together with live cursors and comments.",
    icon: "users",
    className: "",
    accent: "from-sky-400/30 to-blue-500/10",
  },
  {
    title: "Bank-grade security",
    body: "SOC 2 Type II, SSO, and audit logs built in.",
    icon: "shield",
    className: "",
    accent: "from-emerald-400/30 to-teal-500/10",
  },
  {
    title: "Insightful analytics",
    body: "Track every visit, click, and conversion with privacy-first analytics.",
    icon: "chart",
    className: "md:col-span-2",
    accent: "from-fuchsia-400/30 to-violet-500/10",
  },
  {
    title: "AI copilot",
    body: "Generate copy and layouts from a single prompt.",
    icon: "sparkles",
    className: "",
    accent: "from-pink-400/30 to-rose-500/10",
  },
];

function BentoIcon({ name }) {
  const paths = {
    bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
    users: (
      <>
        <circle cx="9" cy="8" r="4" />
        <path d="M2 21c0-4 3-6 7-6s7 2 7 6M16 4a4 4 0 0 1 0 8M22 21c0-3-2-5-4-5.5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
    chart: <path d="M3 3v18h18M7 15l4-4 3 3 6-7" />,
    sparkles: <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5zM19 15l1 2.5 2.5 1-2.5 1L19 22l-1-2.5-2.5-1 2.5-1L19 15z" />,
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-125"
    >
      {paths[name]}
    </svg>
  );
}

function BentoTiltCard({ item, featured }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glowX: 50, glowY: 50 });

  const handleMove = (e) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (0.5 - py) * 10, y: (px - 0.5) * 10, glowX: px * 100, glowY: py * 100 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0, glowX: 50, glowY: 50 })}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 p-7 transition-transform duration-200 ease-out ${item.className}`}
      style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br opacity-40 transition-opacity duration-500 group-hover:opacity-100 ${item.accent}`} />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${tilt.glowX}% ${tilt.glowY}%, rgba(255,255,255,0.12), transparent 40%)`,
        }}
      />
      <div className="relative flex h-full flex-col">
        <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/10 text-white">
          <BentoIcon name={item.icon} />
        </div>
        <h3 className={`font-semibold text-white ${featured ? "text-2xl sm:text-3xl" : "text-lg"}`}>{item.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.body}</p>

        {featured && (
          <div className="mt-auto pt-8">
            <div className="flex h-32 items-end gap-2">
              {[40, 65, 50, 80, 60, 95, 75, 100].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-amber-500/40 to-amber-300 transition-all duration-700"
                  style={{ height: `${h}%`, opacity: 0.5 + i * 0.06, transitionDelay: `${i * 40}ms` }}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-zinc-500">Average load time: 0.4s</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BentoGrid() {
  return (
    <section className="bg-zinc-950 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">Features</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Everything you need to ship
          </h2>
          <p className="mt-4 text-zinc-400">A complete toolkit designed for modern teams. Hover the cards to explore.</p>
        </div>

        <div className="mt-16 grid auto-rows-[minmax(200px,auto)] gap-4 md:grid-cols-3">
          {BENTO_ITEMS.map((item, i) => (
            <BentoTiltCard key={item.title} item={item} featured={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
