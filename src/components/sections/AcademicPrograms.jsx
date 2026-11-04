import { useState } from "react";

const ACADEMIC_PROGRAMS = {
  Undergraduate: [
    { title: "Computer Science, B.S.", dept: "Engineering & Computing", credits: 120, tags: ["STEM", "On campus"], color: "from-indigo-500 to-blue-500", instructor: "computing", modules: ["Programming foundations", "Data structures and algorithms", "Human-computer interaction", "Senior capstone"] },
    { title: "Environmental Studies, B.A.", dept: "Arts & Sciences", credits: 120, tags: ["Field work", "Research"], color: "from-emerald-500 to-teal-500", instructor: "arts", modules: ["Climate systems", "Environmental policy", "Field research methods", "Community impact capstone"] },
    { title: "Business Administration, B.B.A.", dept: "School of Business", credits: 120, tags: ["Internships", "Leadership"], color: "from-amber-500 to-orange-500", instructor: "business", modules: ["Accounting and finance", "Marketing strategy", "Operations management", "Leadership practicum"] },
  ],
  Graduate: [
    { title: "Data Science, M.S.", dept: "Engineering & Computing", credits: 36, tags: ["STEM", "Research"], color: "from-violet-500 to-fuchsia-500", instructor: "computing", modules: ["Statistical learning", "Data engineering", "Responsible AI", "Applied capstone"] },
    { title: "Public Policy, M.P.P.", dept: "School of Public Affairs", credits: 42, tags: ["Policy", "Internships"], color: "from-sky-500 to-cyan-500", instructor: "policy", modules: ["Policy analysis", "Public finance", "Program evaluation", "Policy practicum"] },
  ],
  Online: [
    { title: "Project Management, Certificate", dept: "Continuing Education", credits: 18, tags: ["Flexible", "Online"], color: "from-rose-500 to-pink-500", instructor: "continuing", modules: ["Agile delivery", "Risk and procurement", "Stakeholder leadership", "Portfolio practicum"] },
    { title: "Digital Marketing, M.S.", dept: "School of Business", credits: 30, tags: ["Flexible", "Online"], color: "from-blue-500 to-indigo-500", instructor: "business", modules: ["Audience analytics", "Content strategy", "Search and growth", "Campaign capstone"] },
  ],
};

const ACADEMIC_INSTRUCTORS = {
  computing: { name: "Dr. Avery Chen", title: "Associate Professor · Computing", focus: "Human-centered AI and software systems", initials: "AC" },
  arts: { name: "Prof. Jordan Lee", title: "Associate Professor · Arts & Sciences", focus: "Environmental policy and field research", initials: "JL" },
  business: { name: "Dr. Morgan Patel", title: "Faculty Lead · Business", focus: "Strategy, entrepreneurship, and analytics", initials: "MP" },
  policy: { name: "Dr. Sam Rivera", title: "Program Director · Public Affairs", focus: "Public finance and community outcomes", initials: "SR" },
  continuing: { name: "Alex Kim", title: "Instructor · Continuing Education", focus: "Applied leadership and online learning", initials: "AK" },
};

function downloadAcademicCurriculum(program) {
  const escapePdfText = (value) => String(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const lines = [
    program.credits ? `${program.credits} credit hours` : "Program catalog overview",
    program.instructor ? `Instructor: ${ACADEMIC_INSTRUCTORS[program.instructor].name}` : "Contact admissions for current requirements.",
    ...(program.modules || []).map((module, index) => `${index + 1}. ${module}`),
  ];
  const text = [
    "BT",
    "/F1 24 Tf 72 720 Td (Northstar University) Tj",
    `/F1 16 Tf 0 -36 Td (Syllabus: ${escapePdfText(program.title)}) Tj`,
    ...lines.map((line) => `/F1 11 Tf 0 -24 Td (${escapePdfText(line)}) Tj`),
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${program.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-syllabus.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AcademicPrograms() {
  const [level, setLevel] = useState("Undergraduate");
  const [filter, setFilter] = useState("All");
  const programs = ACADEMIC_PROGRAMS[level].filter((p) => filter === "All" || p.tags.includes(filter));
  const filters = ["All", ...new Set(ACADEMIC_PROGRAMS[level].flatMap((p) => p.tags))];

  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl"><div className="flex flex-wrap items-end justify-between gap-6"><div><p className="text-sm font-semibold uppercase tracking-[.2em] text-indigo-700 leading-relaxed">Find your path</p><h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl leading-tight tracking-tight">Programs built for what&apos;s next</h2></div><button type="button" onClick={() => downloadAcademicCurriculum({ title: `${level} curriculum overview`, modules: ACADEMIC_PROGRAMS[level].map((program) => program.title) })} className="rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-800 hover:bg-indigo-50">↓ Download {level.toLowerCase()} curriculum PDF</button></div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4"><div role="tablist" aria-label="Program level" className="inline-flex rounded-xl bg-slate-100 p-2">{Object.keys(ACADEMIC_PROGRAMS).map((item) => <button key={item} type="button" role="tab" aria-selected={level === item} onClick={() => { setLevel(item); setFilter("All"); }} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${level === item ? "bg-white text-indigo-800 shadow-sm" : "text-slate-500"}`}>{item}</button>)}</div><div className="flex flex-wrap gap-2">{filters.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${filter === item ? "border-indigo-700 bg-indigo-700 text-white" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>{item}</button>)}</div></div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{programs.map((program) => { const instructor = ACADEMIC_INSTRUCTORS[program.instructor]; const detailsId = `curriculum-${program.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`; return <article key={program.title} className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ease-out"><div className={`mb-6 h-1.5 w-16 rounded-full bg-gradient-to-r ${program.color}`} /><p className="text-xs font-semibold uppercase tracking-wider text-indigo-700 leading-relaxed">{program.dept}</p><h3 className="mt-2 text-xl font-bold text-slate-900 leading-tight tracking-tight">{program.title}</h3><p className="mt-2 text-sm text-slate-500 leading-relaxed">{program.credits} credit hours · {level}</p><div className="mt-4 flex flex-wrap gap-2">{program.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2 py-2 text-xs text-slate-600">{tag}</span>)}</div><details className="mt-6 border-t border-slate-100 pt-4"><summary aria-controls={detailsId} className="cursor-pointer text-sm font-semibold text-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600">Instructor & curriculum details</summary><div id={detailsId} className="mt-4"><div className="flex items-center gap-4 rounded-xl bg-indigo-50 p-4"><span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full bg-indigo-800 text-xs font-bold text-white">{instructor.initials}</span><div><p className="text-sm font-semibold text-slate-900 leading-relaxed">{instructor.name}</p><p className="text-xs text-slate-600 leading-relaxed">{instructor.title}</p><p className="mt-2 text-xs text-slate-500 leading-relaxed">{instructor.focus}</p></div></div><ul className="mt-4 space-y-2" aria-label={`${program.title} syllabus modules`}>{program.modules.map((module, index) => <li key={module} className="flex gap-2 text-sm text-slate-600 leading-relaxed"><span className="font-semibold text-indigo-700">{String(index + 1).padStart(2, "0")}</span>{module}</li>)}</ul></div></details><button type="button" onClick={() => downloadAcademicCurriculum(program)} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700">↓ Download syllabus</button></article>; })}</div>
      </div>
    </section>
  );
}
