import { useState } from "react";

const INQUIRY_STEPS = ["Your details", "Project needs", "Schedule"];
const INQUIRY_BUDGETS = ["Under $5k", "$5k–$15k", "$15k–$50k", "$50k+"];

export default function MultiStepInquiryForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", company: "", budget: "", need: "", date: "" });
  const [submitted, setSubmitted] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const canContinue = step === 0 ? form.name.trim() && form.email.includes("@") : step === 1 ? form.budget && form.need : form.date;

  const submit = (event) => {
    event.preventDefault();
    if (step < INQUIRY_STEPS.length - 1) setStep((current) => current + 1);
    else setSubmitted(true);
  };

  return (
    <section className="bg-slate-950 px-5 py-20 text-white"><div className="mx-auto max-w-3xl"><div className="text-center"><p className="text-sm font-semibold uppercase tracking-[.2em] text-violet-300">Tell us what you&apos;re building</p><h2 className="mt-2 text-3xl font-bold sm:text-4xl">Let&apos;s make a plan</h2><p className="mt-3 text-slate-400">A few quick details help us make our first conversation useful.</p></div>
      <div className="mt-8 flex items-center justify-between">{INQUIRY_STEPS.map((title, index) => <div key={title} className="flex flex-1 items-center last:flex-none"><div className="flex items-center gap-2"><span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${index <= step ? "bg-violet-400 text-slate-950" : "bg-white/10 text-slate-400"}`}>{index < step ? "✓" : index + 1}</span><span className={`hidden text-xs sm:block ${index === step ? "font-semibold text-white" : "text-slate-500"}`}>{title}</span></div>{index < INQUIRY_STEPS.length - 1 && <div className={`mx-3 h-px flex-1 ${index < step ? "bg-violet-400" : "bg-white/10"}`} />}</div>)}</div>
      <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300 transition-all duration-500" style={{ width: `${((step + 1) / INQUIRY_STEPS.length) * 100}%` }} /></div>
      {submitted ? <div role="status" className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-8 text-center"><p className="text-3xl">✓</p><h3 className="mt-3 text-2xl font-bold">Thanks, {form.name}!</h3><p className="mt-2 text-slate-300">Your inquiry is ready. We&apos;ll follow up at {form.email}.</p><button type="button" onClick={() => { setStep(0); setSubmitted(false); }} className="mt-5 text-sm font-semibold text-emerald-300 underline">Start another inquiry</button></div> : <form onSubmit={submit} className="mt-8 rounded-2xl border border-white/10 bg-white/[.04] p-6 sm:p-8">
        {step === 0 && <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm text-slate-300">Full name<input required value={form.name} onChange={(e) => update("name", e.target.value)} autoComplete="name" className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-violet-400" /></label><label className="text-sm text-slate-300">Work email<input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-violet-400" /></label><label className="text-sm text-slate-300 sm:col-span-2">Company (optional)<input value={form.company} onChange={(e) => update("company", e.target.value)} autoComplete="organization" className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-violet-400" /></label></div>}
        {step === 1 && <div><label className="block text-sm text-slate-300">What do you need?<textarea required rows="3" value={form.need} onChange={(e) => update("need", e.target.value)} placeholder="A short overview…" className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-violet-400" /></label><fieldset className="mt-5"><legend className="text-sm text-slate-300">Estimated budget</legend><div className="mt-3 grid grid-cols-2 gap-2">{INQUIRY_BUDGETS.map((budget) => <button key={budget} type="button" onClick={() => update("budget", budget)} className={`rounded-xl border p-3 text-sm transition ${form.budget === budget ? "border-violet-400 bg-violet-400/10 text-white" : "border-white/10 text-slate-400 hover:border-white/30"}`}>{budget}</button>)}</div></fieldset></div>}
        {step === 2 && <div><label className="block text-sm text-slate-300">Preferred date for a first call<input required type="date" min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={(e) => update("date", e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-violet-400" /></label><p className="mt-4 rounded-xl bg-white/5 p-4 text-sm text-slate-400">We&apos;ll confirm availability by email. No calendar invite is created until we agree on a time.</p></div>}
        <div className="mt-8 flex justify-between"><button type="button" disabled={step === 0} onClick={() => setStep((current) => current - 1)} className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 disabled:invisible">Back</button><button type="submit" disabled={!canContinue} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">{step === INQUIRY_STEPS.length - 1 ? "Send inquiry" : "Continue"} →</button></div>
      </form>}
      </div></section>
  );
}
