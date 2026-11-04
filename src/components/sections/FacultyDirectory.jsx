import { useMemo, useState } from "react";

const FACULTY_DIRECTORY = [
  { name: "Dr. Maya Brooks", role: "Associate Professor", dept: "Computer Science", hours: "Tue 2–4 PM", email: "maya.brooks@northstar.edu", phone: "+1-555-0101", seed: "faculty-maya" },
  { name: "Prof. Elijah Chen", role: "Department Chair", dept: "Environmental Studies", hours: "Wed 10 AM–12 PM", email: "elijah.chen@northstar.edu", phone: "+1-555-0102", seed: "faculty-elijah" },
  { name: "Dr. Sofia Rivera", role: "Assistant Professor", dept: "Computer Science", hours: "Thu 1–3 PM", email: "sofia.rivera@northstar.edu", phone: "+1-555-0103", seed: "faculty-sofia" },
  { name: "Prof. Noah Williams", role: "Professor", dept: "Business", hours: "Mon 3–5 PM", email: "noah.williams@northstar.edu", phone: "+1-555-0104", seed: "faculty-noah" },
  { name: "Dr. Amina Yusuf", role: "Lecturer", dept: "Environmental Studies", hours: "Fri 9–11 AM", email: "amina.yusuf@northstar.edu", phone: "+1-555-0105", seed: "faculty-amina" },
  { name: "Prof. Theo Martin", role: "Clinical Faculty", dept: "Business", hours: "By appointment", email: "theo.martin@northstar.edu", phone: "+1-555-0106", seed: "faculty-theo" },
];

export default function FacultyDirectory() {
  const [department, setDepartment] = useState("All departments");
  const [query, setQuery] = useState("");
  const departments = ["All departments", ...new Set(FACULTY_DIRECTORY.map((person) => person.dept))];
  const faculty = useMemo(() => FACULTY_DIRECTORY.filter((person) => (department === "All departments" || person.dept === department) && `${person.name} ${person.role} ${person.dept}`.toLowerCase().includes(query.toLowerCase())), [department, query]);

  return (
    <section className="bg-white px-6 py-20"><div className="mx-auto max-w-6xl"><p className="text-sm font-semibold uppercase tracking-[.2em] text-indigo-700 leading-relaxed">People behind the learning</p><h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl leading-tight tracking-tight">Meet our faculty</h2><div className="mt-8 flex flex-col gap-4 sm:flex-row"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search faculty…" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500" /><select value={department} onChange={(e) => setDepartment(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700">{departments.map((dept) => <option key={dept}>{dept}</option>)}</select></div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{faculty.map((person) => <article key={person.email} className="rounded-2xl border border-slate-200 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ease-out"><div className="flex items-center gap-4"><img src={`https://i.pravatar.cc/160?u=${person.seed}`} alt={person.name} className="h-16 w-16 rounded-2xl object-cover" /><div><h3 className="font-bold text-slate-900 leading-tight tracking-tight">{person.name}</h3><p className="mt-2 text-sm text-slate-500 leading-relaxed">{person.role}</p></div></div><span className="mt-4 inline-block rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-800">{person.dept}</span><p className="mt-4 text-sm text-slate-600 leading-relaxed">Office hours · <strong>{person.hours}</strong></p><div className="mt-4 flex gap-2"><a href={`mailto:${person.email}`} className="flex-1 rounded-lg bg-indigo-800 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-700 transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">Email</a><a href={`tel:${person.phone}`} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">Call</a></div></article>)}</div>
      {faculty.length === 0 && <p className="py-12 text-center text-slate-500 leading-relaxed">No faculty match your filters.</p>}
      </div></section>
  );
}
