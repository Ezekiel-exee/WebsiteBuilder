import { useEffect, useRef, useState } from "react";

const EXPERIENCE_TIMELINE_ITEMS = [
  {
    year: "2023 — Now",
    role: "Senior Product Engineer",
    company: "Northstar Labs",
    description: "Leading frontend architecture and design systems for a product serving 2M+ users.",
    achievements: ["Cut page load time by 46%", "Built shared component system used across 4 teams"],
    stack: ["React", "TypeScript", "GraphQL"],
  },
  {
    year: "2020 — 2023",
    role: "Full-stack Developer",
    company: "Studio Meridian",
    description: "Partnered with design teams to ship customer experiences from discovery through launch.",
    achievements: ["Delivered 12 client launches", "Mentored 3 early-career developers"],
    stack: ["Next.js", "Node.js", "Postgres"],
  },
  {
    year: "2018 — 2020",
    role: "Frontend Developer",
    company: "Goodworks Digital",
    description: "Built accessible, performant web applications for mission-driven organizations.",
    achievements: ["Improved accessibility scores to WCAG AA", "Introduced visual regression testing"],
    stack: ["Vue", "Sass", "Jest"],
  },
  {
    year: "2016 — 2018",
    role: "Web Developer",
    company: "Pixel & Pine Studio",
    description: "Created polished, responsive websites for independent brands and local businesses.",
    achievements: ["Launched 20+ client websites", "Built the studio's first reusable UI toolkit"],
    stack: ["JavaScript", "CSS", "WordPress"],
  },
];

export default function ExperienceTimeline() {
  const timelineRef = useRef(null);
  const nodeRefs = useRef([]);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [track, setTrack] = useState({ start: 0, end: 0 });

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return undefined;
    const frameWindow = timeline.ownerDocument.defaultView;
    if (!frameWindow) return undefined;

    let frame = 0;
    let activeStopIndex = -1;
    let targetProgress = -1;
    const updateProgress = () => {
      frame = 0;
      const nodes = nodeRefs.current.slice(0, EXPERIENCE_TIMELINE_ITEMS.length);
      if (
        !timeline.isConnected ||
        nodes.length !== EXPERIENCE_TIMELINE_ITEMS.length ||
        nodes.some((node) => !node?.isConnected)
      ) {
        return;
      }
      const positions = nodes.map((node) => {
        const bounds = node.getBoundingClientRect();
        return bounds.top + frameWindow.scrollY + bounds.height / 2;
      });

      const timelineTop = timeline.getBoundingClientRect().top + frameWindow.scrollY;
      const nextTrack = {
        start: positions[0] - timelineTop,
        end: positions[positions.length - 1] - timelineTop,
      };
      setTrack((current) =>
        current.start === nextTrack.start && current.end === nextTrack.end ? current : nextTrack,
      );

      const focusY = frameWindow.scrollY + Math.min(frameWindow.innerHeight * 0.52, frameWindow.innerHeight - 80);
      let nextStopIndex = positions.length - 1;
      for (let index = 0; index < positions.length - 1; index += 1) {
        const midpoint = (positions[index] + positions[index + 1]) / 2;
        if (focusY < midpoint) {
          nextStopIndex = index;
          break;
        }
      }

      const pathLength = positions[positions.length - 1] - positions[0];
      if (pathLength <= 0) return;

      const nextProgress = (positions[nextStopIndex] - positions[0]) / pathLength;
      if (activeStopIndex !== nextStopIndex || targetProgress !== nextProgress) {
        activeStopIndex = nextStopIndex;
        targetProgress = nextProgress;
        setActiveIndex(nextStopIndex);
        setProgress(nextProgress);
      }
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = frameWindow.requestAnimationFrame(updateProgress);
    };

    const FrameResizeObserver = frameWindow.ResizeObserver;
    const resizeObserver = typeof FrameResizeObserver === "undefined" ? null : new FrameResizeObserver(scheduleUpdate);
    resizeObserver?.observe(timeline);
    nodeRefs.current.forEach((node) => node && resizeObserver?.observe(node));
    frameWindow.addEventListener("scroll", scheduleUpdate, { passive: true });
    frameWindow.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();

    return () => {
      frameWindow.removeEventListener("scroll", scheduleUpdate);
      frameWindow.removeEventListener("resize", scheduleUpdate);
      resizeObserver?.disconnect();
      if (frame) frameWindow.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="overflow-hidden bg-slate-950 px-5 py-20 text-white">
      <style>{`
        @keyframes experience-timeline-glow {
          0%, 100% { box-shadow: 0 0 12px 3px rgba(103, 232, 249, .7), 0 0 30px 8px rgba(34, 211, 238, .28); }
          50% { box-shadow: 0 0 20px 6px rgba(165, 243, 252, .95), 0 0 44px 14px rgba(34, 211, 238, .42); }
        }
        @media (prefers-reduced-motion: reduce) {
          .experience-timeline-motion { animation: none !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[.2em] text-cyan-300">The journey so far</p>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Experience that compounds</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
          The glow holds at each milestone's center and glides smoothly to the next as you scroll.
        </p>

        <div ref={timelineRef} className="relative mt-10 space-y-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-6 w-[2px] rounded-full bg-white/10 sm:left-8"
            style={{ top: `${track.start}px`, height: `${Math.max(0, track.end - track.start)}px` }}
          >
            <div
              className="experience-timeline-motion absolute inset-x-0 top-0 rounded-full bg-gradient-to-b from-violet-400 via-cyan-300 to-emerald-300 shadow-[0_0_16px_2px_rgba(34,211,238,.5)] transition-[height] duration-700 ease-in-out"
              style={{ height: `${progress * 100}%` }}
            />
            <span
              className="experience-timeline-motion absolute -left-[5px] h-3 w-3 rounded-full bg-cyan-100 transition-[top] duration-700 ease-in-out [animation:experience-timeline-glow_2.4s_ease-in-out_infinite]"
              style={{ top: `${progress * 100}%`, transform: "translateY(-50%)" }}
            />
          </div>

          {EXPERIENCE_TIMELINE_ITEMS.map((item, index) => {
            const active = activeIndex === index;

            return (
              <article key={item.company} className="relative pl-14 sm:pl-20">
                <div
                  ref={(node) => {
                    nodeRefs.current[index] = node;
                  }}
                  aria-current={active ? "step" : undefined}
                  className={`rounded-2xl border p-5 transition-all duration-500 sm:p-6 ${
                    active
                      ? "border-cyan-300/50 bg-cyan-300/[.07] shadow-[0_0_36px_-20px_rgba(34,211,238,.75)]"
                      : "border-white/10 bg-white/[.04] hover:border-white/20 hover:bg-white/[.07]"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-500 ${active ? "text-cyan-200" : "text-cyan-300"}`}>
                      {item.year}
                    </p>
                    <span className={`rounded-full border px-3 py-1 text-xs transition-all duration-500 ${active ? "border-cyan-200/50 bg-cyan-300/10 text-cyan-100" : "border-white/10 text-slate-400"}`}>
                      {item.company}
                    </span>
                  </div>
                  <h3 className="mt-2 text-xl font-bold">{item.role}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.description}</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-300">
                    {item.achievements.map((achievement) => (
                      <li key={achievement} className="flex gap-2">
                        <span className="text-emerald-400">↗</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.stack.map((tag) => (
                      <span key={tag} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-300">{tag}</span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
