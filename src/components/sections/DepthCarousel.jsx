import { useCallback, useEffect, useRef, useState } from "react";

const DEPTH_CAROUSEL_SLIDES = [
  { src: "https://picsum.photos/seed/aurora/800/1000", title: "Northern Lights", tag: "Iceland" },
  { src: "https://picsum.photos/seed/dunes/800/1000", title: "Golden Dunes", tag: "Sahara" },
  { src: "https://picsum.photos/seed/canyon/800/1000", title: "Red Canyon", tag: "Arizona" },
  { src: "https://picsum.photos/seed/lagoon/800/1000", title: "Blue Lagoon", tag: "Maldives" },
  { src: "https://picsum.photos/seed/forest/800/1000", title: "Misty Forest", tag: "Oregon" },
  { src: "https://picsum.photos/seed/summit/800/1000", title: "Alpine Summit", tag: "Switzerland" },
  { src: "https://picsum.photos/seed/harbor/800/1000", title: "Quiet Harbor", tag: "Norway" },
  { src: "https://picsum.photos/seed/bloom/800/1000", title: "Spring Bloom", tag: "Kyoto" },
];

// Visual settings for each distance from the focused slide (0 = center, 1 = adjacent, 2 = outer, 3 = hidden).
const DEPTH_CAROUSEL_LAYERS = [
  { x: 0, scale: 1, rotate: 0, opacity: 1, brightness: 1, blur: 0 },
  { x: 68, scale: 0.8, rotate: 18, opacity: 0.85, brightness: 0.6, blur: 0 },
  { x: 120, scale: 0.62, rotate: 28, opacity: 0.6, brightness: 0.4, blur: 1.5 },
  { x: 160, scale: 0.5, rotate: 34, opacity: 0, brightness: 0.3, blur: 3 },
];

const DEPTH_CAROUSEL_AUTOPLAY_MS = 4000;

export default function DepthCarousel() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const dragStart = useRef(null);
  const total = DEPTH_CAROUSEL_SLIDES.length;

  const goTo = useCallback((index) => setActive(((index % total) + total) % total), [total]);
  const next = useCallback(() => setActive((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setActive((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (!playing || hovered) return;
    const timer = setInterval(next, DEPTH_CAROUSEL_AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [playing, hovered, next, active]);

  // Shortest signed distance on a circular track, so the carousel loops infinitely in both directions.
  const getOffset = (index) => {
    let offset = index - active;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    return offset;
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };

  const handlePointerDown = (e) => {
    dragStart.current = e.clientX;
  };

  const handlePointerUp = (e) => {
    if (dragStart.current === null) return;
    const delta = e.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(delta) > 50) (delta < 0 ? next : prev)();
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-zinc-950 via-indigo-950/60 to-zinc-950 py-20 text-white">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/25 blur-[140px]" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Featured destinations</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Wander somewhere new</h2>
        <p className="mt-4 text-zinc-400">Swipe, drag, click a side card, or use your arrow keys to explore.</p>
      </div>

      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured destinations"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => (dragStart.current = null)}
        className="relative mx-auto mt-14 h-[22rem] max-w-7xl select-none outline-none [perspective:1600px] sm:h-[28rem] lg:h-[32rem]"
      >
        {DEPTH_CAROUSEL_SLIDES.map((slide, index) => {
          const offset = getOffset(index);
          const distance = Math.min(Math.abs(offset), 3);
          const layer = DEPTH_CAROUSEL_LAYERS[distance];
          const direction = Math.sign(offset);
          const isActive = offset === 0;

          return (
            <div
              key={slide.title}
              onClick={() => !isActive && goTo(index)}
              aria-hidden={distance > 2}
              className={`absolute left-1/2 top-0 h-full w-[52%] sm:w-[36%] lg:w-[28%] ${
                isActive ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
              }`}
              style={{
                transform: `translateX(calc(-50% + ${direction * layer.x}%)) scale(${layer.scale}) rotateY(${
                  -direction * layer.rotate
                }deg)`,
                zIndex: 10 - distance,
                opacity: layer.opacity,
                filter: `brightness(${layer.brightness}) blur(${layer.blur}px)`,
                pointerEvents: distance > 2 ? "none" : "auto",
                transition:
                  "transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms ease, filter 700ms ease",
              }}
            >
              <div
                className={`relative h-full w-full overflow-hidden rounded-3xl ring-1 transition-shadow duration-700 ${
                  isActive
                    ? "shadow-[0_30px_80px_-20px_rgba(99,102,241,0.7)] ring-white/30"
                    : "shadow-2xl ring-white/10"
                }`}
              >
                <img
                  src={slide.src}
                  alt={slide.title}
                  draggable={false}
                  className={`h-full w-full object-cover transition-transform duration-[1200ms] ${
                    isActive ? "scale-100" : "scale-110"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div
                  className={`absolute inset-x-0 bottom-0 p-5 transition-all duration-700 sm:p-7 ${
                    isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                >
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                    {slide.tag}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold sm:text-2xl">{slide.title}</h3>
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/20 text-white/70 opacity-60 backdrop-blur-md transition-all duration-300 hover:bg-black/40 hover:text-white hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 sm:left-6 sm:h-12 sm:w-12"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/20 text-white/70 opacity-60 backdrop-blur-md transition-all duration-300 hover:bg-black/40 hover:text-white hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 sm:right-6 sm:h-12 sm:w-12"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="relative mt-12 flex items-center justify-center gap-4 px-6">
        <div className="flex items-center gap-2">
          {DEPTH_CAROUSEL_SLIDES.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-500 ${
                index === active ? "w-8 bg-gradient-to-r from-indigo-400 to-cyan-300" : "w-2 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause autoplay" : "Start autoplay"}
          className="ml-2 grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/5 backdrop-blur transition hover:bg-white/15"
        >
          {playing ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      <p className="relative mt-4 text-center text-sm tabular-nums text-zinc-500">
        {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>
    </section>
  );
}
