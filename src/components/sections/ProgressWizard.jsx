import { useState } from "react";

const PROGRESS_WIZARD_STEPS = ["Your team", "Your goal", "Ready to launch"];
const PROGRESS_WIZARD_GOALS = ["Onboard customers", "Ship a new product", "Improve operations"];

export default function ProgressWizard() {
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState({ name: "", email: "", team: "", goal: "", launchDate: "" });
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);
  const update = (key, value) => setDetails((current) => ({ ...current, [key]: value }));

  const next = (event) => {
    event.preventDefault();
    const valid = step === 0
      ? details.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email) && details.team
      : step === 1
        ? Boolean(details.goal)
        : Boolean(details.launchDate);
    if (!valid) {
      setMessage("Complete the required fields to continue.");
      return;
    }
    setMessage("");
    if (step < PROGRESS_WIZARD_STEPS.length - 1) setStep((current) => current + 1);
    else setComplete(true);
  };

  return (
    <section className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-5 py-20 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[.2em] text-indigo-700">A guided launch</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Make progress, one step at a time</h2>
        </div>
        <div className="mt-8 flex items-center" aria-label="Progress">
          {PROGRESS_WIZARD_STEPS.map((title, index) => (
            <div key={title} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <span
                  aria-current={index === step ? "step" : undefined}
                  className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition-all duration-300 ${
                    index < step ? "bg-emerald-500 text-white" : index === step ? "bg-indigo-700 text-white ring-4 ring-indigo-100" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {index < step ? "✓" : index === 0 ? "★" : index + 1}
                </span>
                <span className={`hidden text-xs sm:block ${index === step ? "font-semibold text-indigo-800" : "text-slate-500"}`}>{title}</span>
              </div>
              {index < PROGRESS_WIZARD_STEPS.length - 1 && <div className={`mx-3 mb-5 h-1 flex-1 rounded-full transition-colors duration-500 ${index < step ? "bg-emerald-400" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={next} className="mt-7 rounded-3xl border border-white bg-white p-6 shadow-xl shadow-indigo-900/5 sm:p-9">
          {complete ? (
            <div role="status" className="py-8 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-2xl text-emerald-700">✓</span>
              <h3 className="mt-4 text-2xl font-bold">You&apos;re ready, {details.name}!</h3>
              <p className="mt-2 text-slate-600">Your {details.goal.toLowerCase()} plan is set for {details.launchDate}.</p>
              <button type="button" onClick={() => { setComplete(false); setStep(0); }} className="mt-5 text-sm font-semibold text-indigo-700 underline">Start again</button>
            </div>
          ) : (
            <>
              {step === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">Name
                    <input required value={details.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  </label>
                  <label className="text-sm font-medium text-slate-700">Work email
                    <input required type="email" value={details.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  </label>
                  <label className="text-sm font-medium text-slate-700 sm:col-span-2">Team size
                    <select required value={details.team} onChange={(event) => update("team", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100">
                      <option value="">Choose your team size</option><option>1–5 people</option><option>6–20 people</option><option>21–100 people</option><option>100+ people</option>
                    </select>
                  </label>
                </div>
              )}
              {step === 1 && (
                <fieldset>
                  <legend className="text-lg font-semibold">What would you like to accomplish?</legend>
                  <div className="mt-4 grid gap-3">
                    {PROGRESS_WIZARD_GOALS.map((goal) => (
                      <label key={goal} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${details.goal === goal ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-300"}`}>
                        <input type="radio" name="wizard-goal" checked={details.goal === goal} onChange={() => update("goal", goal)} className="accent-indigo-700" />
                        <span className="text-sm font-medium">{goal}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
              {step === 2 && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Target start date
                    <input required type="date" value={details.launchDate} onChange={(event) => update("launchDate", event.target.value)} className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  </label>
                  <div className="mt-5 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-900"><strong>Milestone unlocked:</strong> Your team and goal are ready. Choose a date to finish the plan.</div>
                </div>
              )}
              {message && <p role="alert" className="mt-4 text-sm text-rose-700">{message}</p>}
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                <button type="button" disabled={step === 0} onClick={() => { setMessage(""); setStep((current) => current - 1); }} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:invisible">Back</button>
                <button type="submit" className="rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700">
                  {step === PROGRESS_WIZARD_STEPS.length - 1 ? "Finish setup" : "Continue"} <span aria-hidden="true">→</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
