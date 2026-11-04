import { useEffect, useRef, useState } from "react";

const GLASS_DOCK_ITEMS = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "discover", label: "Discover", icon: "◇" },
  { id: "saved", label: "Saved", icon: "♡" },
  { id: "profile", label: "Profile", icon: "○" },
];

export default function GlassDock() {
  const dockRef = useRef(null);
  const [active, setActive] = useState("home");
  const [top, setTop] = useState(24);

  useEffect(() => {
    const frameWindow = dockRef.current?.ownerDocument.defaultView;
    if (!frameWindow) return undefined;
    let lastScrollY = frameWindow.scrollY;
    let frame = 0;
    const updateTop = (nextTop) => {
      setTop((current) => (current === nextTop ? current : nextTop));
    };
    const placeAtBottom = () => {
      const height = dockRef.current?.offsetHeight ?? 64;
      updateTop(Math.max(16, frameWindow.innerHeight - height - 24));
    };
    const updateDock = () => {
      if (frame) return;
      frame = frameWindow.requestAnimationFrame(() => {
        frame = 0;
        const currentScrollY = frameWindow.scrollY;
        if (Math.abs(currentScrollY - lastScrollY) < 2) return;
        const height = dockRef.current?.offsetHeight ?? 64;
        updateTop(currentScrollY > lastScrollY ? Math.max(16, frameWindow.innerHeight - height - 24) : 24);
        lastScrollY = currentScrollY;
      });
    };
    placeAtBottom();
    frameWindow.addEventListener("scroll", updateDock, { passive: true });
    frameWindow.addEventListener("resize", placeAtBottom);
    return () => {
      frameWindow.removeEventListener("scroll", updateDock);
      frameWindow.removeEventListener("resize", placeAtBottom);
      if (frame) frameWindow.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="relative min-h-[120vh] overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[.2em] text-cyan-300 leading-relaxed">A little more room</p>
        <h2 className="mt-4 text-4xl font-bold sm:text-5xl leading-tight tracking-tight">Navigation that floats</h2>
        <p className="mt-4 text-slate-300 leading-relaxed">Scroll up or down to watch the glass dock move to the opposite edge.</p>
      </div>
      <nav
        ref={dockRef}
        aria-label="Floating product navigation"
        className="group fixed left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-2 text-white shadow-xl shadow-black/30 backdrop-blur-2xl transition-all duration-500 ease-in-out hover:scale-[1.03] hover:bg-white/15"
        style={{ top, transitionProperty: "top, transform, background-color" }}
      >
        {GLASS_DOCK_ITEMS.map((item) => {
          const selected = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-current={selected ? "page" : undefined}
              onClick={() => setActive(item.id)}
              className={`flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl px-3 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200 ${
                selected ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center text-xl" aria-hidden="true">{item.icon}</span>
              <span className={`max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold opacity-0 transition-all duration-300 group-hover:max-w-20 group-hover:opacity-100 ${selected ? "max-w-20 opacity-100" : ""} ease-out`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </section>
  );
}
