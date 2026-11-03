import { useEffect, useState } from "react";

const GRADIENT_HERO_WORDS = ["startups", "designers", "developers", "agencies"];

export default function GradientHero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Typewriter loop: type the word, pause, delete it, move to the next word.
  useEffect(() => {
    const word = GRADIENT_HERO_WORDS[wordIndex];
    let delay = deleting ? 45 : 95;
    if (!deleting && text === word) delay = 1600;
    if (deleting && text === "") delay = 300;

    const timer = setTimeout(() => {
      if (!deleting && text === word) {
        setDeleting(true);
      } else if (deleting && text === "") {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % GRADIENT_HERO_WORDS.length);
      } else {
        setText(word.slice(0, text.length + (deleting ? -1 : 1)));
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [text, deleting, wordIndex]);

  return (
    <section className="relative isolate overflow-hidden bg-zinc-950 px-6 py-28 text-white sm:py-36">
      <style>{`
        @keyframes gradient-hero-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.1); }
        }
        @keyframes gradient-hero-shine {
          to { background-position: 200% center; }
        }
      `}</style>

      {/* Grid backdrop */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      {/* Gradient glows */}
      <div className="absolute -top-32 left-1/2 -z-10 h-[28rem] w-[28rem] -translate-x-[80%] rounded-full bg-violet-600/40 blur-[120px] [animation:gradient-hero-float_12s_ease-in-out_infinite]" />
      <div className="absolute top-20 left-1/2 -z-10 h-[24rem] w-[24rem] translate-x-[10%] rounded-full bg-cyan-500/30 blur-[120px] [animation:gradient-hero-float_14s_ease-in-out_infinite_reverse]" />

      <div className="mx-auto max-w-4xl text-center">
        <a
          href="#"
          className="group mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-4 text-sm text-zinc-300 backdrop-blur transition hover:border-white/20"
        >
          <span className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-2.5 py-0.5 text-xs font-semibold text-white">
            New
          </span>
          Version 3.0 is live
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>

        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Build stunning websites
          <br />
          for{" "}
          <span className="bg-[linear-gradient(90deg,#a78bfa,#22d3ee,#f472b6,#a78bfa)] bg-[length:200%_auto] bg-clip-text text-transparent [animation:gradient-hero-shine_4s_linear_infinite]">
            {text}
          </span>
          <span className="ml-1 inline-block w-[3px] animate-pulse bg-cyan-400 align-middle">&nbsp;</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
          Ship polished, conversion-ready pages in minutes. Drop in beautifully crafted sections, tweak
          them with Tailwind, and launch with confidence.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#"
            className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-7 py-3.5 font-semibold shadow-[0_0_40px_-8px_rgba(139,92,246,0.8)] transition hover:shadow-[0_0_60px_-6px_rgba(34,211,238,0.8)]"
          >
            Start building free
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-semibold text-zinc-200 backdrop-blur transition hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch demo
          </a>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-zinc-500">
          {["No credit card required", "14-day free trial", "Cancel anytime"].map((item) => (
            <span key={item} className="flex items-center gap-2">
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-emerald-400">
                <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0z" />
              </svg>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
