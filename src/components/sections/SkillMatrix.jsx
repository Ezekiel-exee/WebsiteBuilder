import { useEffect, useRef, useState } from "react";

const SKILL_MATRIX_GROUPS = [
  { name: "Frontend", icon: "◈", years: 8, skills: [{ name: "React / Next.js", level: 94 }, { name: "TypeScript", level: 90 }, { name: "Accessibility", level: 86 }] },
  { name: "Backend", icon: "⌘", years: 6, skills: [{ name: "Node.js", level: 82 }, { name: "API design", level: 88 }, { name: "SQL / Postgres", level: 78 }] },
  { name: "DevOps", icon: "⌁", years: 5, skills: [{ name: "CI / CD", level: 84 }, { name: "Cloud infrastructure", level: 80 }, { name: "Observability", level: 76 }] },
];

export default function SkillMatrix() {
  const sectionRef = useRef(null);
  const tabRefs = useRef([]);
  const [activeGroup, setActiveGroup] = useState("Frontend");
  const [animate, setAnimate] = useState(false);
  const group = SKILL_MATRIX_GROUPS.find((item) => item.name === activeGroup);

  useEffect(() => {
    const frameWindow = sectionRef.current?.ownerDocument.defaultView;
    if (!frameWindow) return undefined;
    setAnimate(false);
    const frame = frameWindow.requestAnimationFrame(() => setAnimate(true));
    return () => frameWindow.cancelAnimationFrame(frame);
  }, [activeGroup]);

  const handleTabKeyDown = (event, index) => {
    const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    const nextIndex = (index + direction + SKILL_MATRIX_GROUPS.length) % SKILL_MATRIX_GROUPS.length;
    setActiveGroup(SKILL_MATRIX_GROUPS[nextIndex].name);
    tabRefs.current[nextIndex]?.focus();
  };

  const proficiency = (level) => level >= 90 ? "Expert" : level >= 80 ? "Advanced" : "Proficient";

  return (
    <section ref={sectionRef} className="bg-[#f4f2ed] px-6 py-20"><div className="mx-auto max-w-6xl"><div className="flex flex-wrap items-end justify-between gap-6"><div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[.2em] text-violet-700 leading-relaxed">Tools of the trade</p><h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl leading-tight tracking-tight">A toolkit for the whole stack</h2><p className="mt-4 text-slate-600 leading-relaxed">A snapshot of what I reach for and where I do my best work.</p></div><div className="rounded-2xl bg-white px-6 py-4 shadow-sm ring-1 ring-black/5"><p className="text-2xl font-bold text-slate-950 leading-relaxed">8+ years</p><p className="text-xs font-medium uppercase tracking-wider text-slate-500 leading-relaxed">Total experience</p></div></div><div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Skill categories">{SKILL_MATRIX_GROUPS.map((item, index) => <button key={item.name} ref={(element) => { tabRefs.current[index] = element; }} type="button" role="tab" id={`skill-tab-${item.name.toLowerCase()}`} aria-selected={activeGroup === item.name} aria-controls="skill-category-panel" tabIndex={activeGroup === item.name ? 0 : -1} onClick={() => setActiveGroup(item.name)} onKeyDown={(event) => handleTabKeyDown(event, index)} className={`rounded-full px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-700 ${activeGroup === item.name ? "bg-violet-800 text-white" : "bg-white text-slate-600 hover:bg-violet-100"}`}>{item.name}</button>)}</div><article id="skill-category-panel" role="tabpanel" aria-labelledby={`skill-tab-${group.name.toLowerCase()}`} className="mt-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6"><div className="flex items-center gap-4"><span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-xl bg-violet-100 text-xl text-violet-800">{group.icon}</span><div><h3 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">{group.name} mastery</h3><p className="text-sm text-slate-500 leading-relaxed">{group.years} years working in {group.name.toLowerCase()}</p></div></div><span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800">3 core skills</span></div><div className="mt-6 grid gap-6 md:grid-cols-2">{group.skills.map((skill, index) => <div key={skill.name}><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><span className="font-medium text-slate-700">{skill.name}</span><span className="flex items-center gap-2"><span className="rounded-full bg-violet-50 px-2 py-2 text-xs font-semibold text-violet-800">{proficiency(skill.level)}</span><span className="text-sm tabular-nums text-slate-500">{skill.level}%</span></span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${skill.name} proficiency`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={skill.level}><div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-all duration-1000 ease-out motion-reduce:transition-none" style={{ width: animate ? `${skill.level}%` : "0%", transitionDelay: `${index * 100}ms` }} /></div></div>)}</div></article></div></section>
  );
}
