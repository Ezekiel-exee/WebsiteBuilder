import { useState } from "react";

const HEALTHCARE_DOCTORS = [
  { name: "Dr. Maya Chen", role: "Primary care", initials: "MC", color: "bg-sky-100 text-sky-800" },
  { name: "Dr. Elias Reed", role: "Cardiology", initials: "ER", color: "bg-emerald-100 text-emerald-800" },
  { name: "Dr. Sofia Patel", role: "Family medicine", initials: "SP", color: "bg-violet-100 text-violet-800" },
];
const HEALTHCARE_SYMPTOMS = ["Headache", "Fever", "Cough", "Fatigue", "Sore throat"];

export default function HealthcareExperience() {
  const [doctor, setDoctor] = useState(0);
  const [date, setDate] = useState("2026-11-06");
  const [time, setTime] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [confirmation, setConfirmation] = useState("");

  const toggleSymptom = (symptom) =>
    setSymptoms((current) => current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom]);

  return (
    <section className="bg-slate-50 px-6 py-16 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-rose-700 px-4 py-4 text-white">
          <span className="text-xs font-semibold">Need urgent help? Our care line is available 24 / 7.</span>
          <a href="tel:911" className="rounded-full bg-white px-4 py-2 text-xs font-bold text-rose-800 transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">Call 911 in an emergency</a>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-sky-700 leading-relaxed">Care that fits your life</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl leading-tight tracking-tight">Find your care team.</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600">Choose a clinician and appointment time. We will help you take the next step.</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {HEALTHCARE_DOCTORS.map((item, index) => (
                <button key={item.name} type="button" onClick={() => { setDoctor(index); setConfirmation(""); }} aria-pressed={doctor === index} className={`rounded-xl border p-3 text-left transition ${doctor === index ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100" : "border-slate-200 hover:border-slate-300"}`}>
                  <span className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${item.color}`}>{item.initials}</span>
                  <span className="mt-2 block text-xs font-semibold">{item.name}</span>
                  <span className="mt-2 block text-xs text-slate-500">{item.role}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-semibold text-slate-700">Choose a date
                <input type="date" min="2026-11-04" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm" />
              </label>
              <label className="grid gap-2 text-xs font-semibold text-slate-700">Available time
                <select value={time} onChange={(event) => setTime(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">
                  <option value="">Select a time</option><option>9:30 AM</option><option>11:00 AM</option><option>1:30 PM</option><option>3:00 PM</option>
                </select>
              </label>
            </div>
            <button type="button" onClick={() => setConfirmation(time ? `Request sent for ${HEALTHCARE_DOCTORS[doctor].name} on ${date} at ${time}.` : "Select an available time to continue.")} className="mt-5 w-full rounded-lg bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800">Request appointment</button>
            {confirmation && <p role="status" className="mt-4 text-xs text-sky-800 leading-relaxed">{confirmation}</p>}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-slate-900 p-6 text-white sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300 leading-relaxed">Quick symptom guide</p>
              <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-tight">How are you feeling?</h3>
              <p className="mt-2 text-xs leading-5 text-slate-300">Select what you are experiencing to see a suggested next step. This guide is not a diagnosis.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {HEALTHCARE_SYMPTOMS.map((symptom) => (
                  <button key={symptom} type="button" onClick={() => toggleSymptom(symptom)} aria-pressed={symptoms.includes(symptom)} className={`rounded-full border px-3 py-1.5 text-xs transition ${symptoms.includes(symptom) ? "border-cyan-300 bg-cyan-300/15 text-cyan-100" : "border-white/15 text-slate-300 hover:border-white/30"}`}>{symptom}</button>
                ))}
              </div>
              <p role="status" className="mt-4 rounded-xl bg-white/5 p-4 text-xs leading-5 text-slate-200">{symptoms.length ? "A care team member can help assess your symptoms. Book a same-day visit or call your clinician." : "Choose any symptoms to see care options."}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[["4.9 / 5", "Patient rating"], ["24 / 7", "Nurse line"], ["12 yrs", "Community care"]].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-4"><strong className="block text-sm text-slate-900">{value}</strong><span className="mt-2 block text-xs text-slate-500">{label}</span></div>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500 leading-relaxed">Trusted, accredited care · Private appointments · Insurance support</p>
      </div>
    </section>
  );
}
