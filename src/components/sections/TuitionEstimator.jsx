import { useMemo, useState } from "react";

const TUITION_FEES = [
  { id: "technology", name: "Technology fee", amount: 480 },
  { id: "activity", name: "Campus activities", amount: 320 },
  { id: "transit", name: "Transit pass", amount: 240 },
  { id: "health", name: "Student health plan", amount: 950 },
];

const TUITION_SCHOLARSHIPS = [
  { id: "merit", name: "Merit Award", amount: 5000, range: "$2,000–$8,000 / year", note: "Based on academic achievement" },
  { id: "access", name: "Access Grant", amount: 3000, range: "Need-based", note: "Complete the financial aid application" },
  { id: "fellows", name: "Community Fellows", amount: 2500, range: "Up to $5,000 / year", note: "For leadership and service" },
];

export default function TuitionEstimator() {
  const [residency, setResidency] = useState("In-state");
  const [includeHousing, setIncludeHousing] = useState(true);
  const [includeMealPlan, setIncludeMealPlan] = useState(true);
  const [checkedFees, setCheckedFees] = useState(["technology", "activity"]);
  const [checkedScholarships, setCheckedScholarships] = useState([]);
  const amounts = useMemo(() => {
    const tuition = residency === "In-state" ? 12800 : 28700;
    const housing = includeHousing ? 11200 : 0;
    const mealPlan = includeMealPlan ? 4800 : 0;
    const fees = TUITION_FEES.filter((fee) => checkedFees.includes(fee.id)).reduce((sum, fee) => sum + fee.amount, 0);
    const aid = TUITION_SCHOLARSHIPS.filter((item) => checkedScholarships.includes(item.id)).reduce((sum, item) => sum + item.amount, 0);
    const gross = tuition + housing + mealPlan + fees;
    return { tuition, housing, mealPlan, fees, aid, gross, netTuition: Math.max(0, tuition - aid), net: Math.max(0, gross - aid) };
  }, [residency, includeHousing, includeMealPlan, checkedFees, checkedScholarships]);

  const toggleItem = (setItems, id) => {
    setItems((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <section className="bg-slate-50 px-6 py-20"><div className="mx-auto max-w-6xl"><p className="text-sm font-semibold uppercase tracking-[.2em] text-indigo-700 leading-relaxed">Plan your investment</p><h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl leading-tight tracking-tight">Tuition & financial aid</h2><div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_.8fr]"><div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"><label className="block border-b p-6 text-sm font-medium text-slate-700">Residency<select value={residency} onChange={(event) => setResidency(event.target.value)} className="mt-2 block w-full rounded-lg border border-slate-200 p-3"><option>In-state</option><option>Out-of-state</option></select></label><div className="divide-y px-6"><div className="py-4"><p className="mb-2 text-sm font-semibold leading-relaxed">Living & meal options</p><label className="flex items-center justify-between gap-4 py-2 text-sm text-slate-600"><span className="flex items-center gap-4"><input type="checkbox" checked={includeHousing} onChange={(event) => setIncludeHousing(event.target.checked)} className="h-4 w-4 accent-indigo-700" />On-campus housing</span><span>$11,200</span></label><label className="flex items-center justify-between gap-4 py-2 text-sm text-slate-600"><span className="flex items-center gap-4"><input type="checkbox" checked={includeMealPlan} onChange={(event) => setIncludeMealPlan(event.target.checked)} className="h-4 w-4 accent-indigo-700" />Meal plan</span><span>$4,800</span></label></div><div className="py-4"><p className="mb-2 text-sm font-semibold leading-relaxed">Optional fee estimates</p>{TUITION_FEES.map((fee) => <label key={fee.id} className="flex items-center justify-between py-2 text-sm text-slate-600"><span className="flex items-center gap-4"><input type="checkbox" checked={checkedFees.includes(fee.id)} onChange={() => toggleItem(setCheckedFees, fee.id)} className="h-4 w-4 accent-indigo-700" />{fee.name}</span><span>${fee.amount.toLocaleString()}</span></label>)}</div><div className="space-y-4 py-4 text-sm"><div className="flex justify-between"><span>Tuition</span><strong>${amounts.tuition.toLocaleString()}</strong></div><div className="flex justify-between"><span>Housing & meals</span><strong>${(amounts.housing + amounts.mealPlan).toLocaleString()}</strong></div><div className="flex justify-between"><span>Selected fees</span><strong>${amounts.fees.toLocaleString()}</strong></div><div className="flex justify-between border-t border-slate-100 pt-4"><span>Net tuition after scholarships</span><strong>${amounts.netTuition.toLocaleString()}</strong></div><div className="flex justify-between"><span>Estimated gross cost</span><strong>${amounts.gross.toLocaleString()}</strong></div><div className="flex justify-between text-emerald-800"><span>Selected scholarships</span><strong>−${amounts.aid.toLocaleString()}</strong></div></div></div><div className="flex justify-between gap-4 bg-indigo-950 px-6 py-6 text-white"><span className="font-semibold">Estimated net annual cost</span><strong className="text-xl">${amounts.net.toLocaleString()}</strong></div><p className="p-6 text-xs leading-relaxed text-slate-500">Planning estimate only. Scholarship amounts are sample assumptions; final tuition and aid eligibility are determined by the university.</p></div>
      <aside className="rounded-2xl bg-indigo-950 p-6 text-white"><p className="text-sm font-semibold uppercase tracking-wider text-indigo-300 leading-relaxed">Ways to make it work</p><h3 className="mt-2 text-2xl font-bold leading-tight tracking-tight">Explore financial aid</h3><div className="mt-6 space-y-4">{TUITION_SCHOLARSHIPS.map((item) => <label key={item.id} className="flex cursor-pointer gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 duration-200 ease-out"><input type="checkbox" checked={checkedScholarships.includes(item.id)} onChange={() => toggleItem(setCheckedScholarships, item.id)} className="mt-1 h-4 w-4 accent-emerald-300" /><span className="min-w-0 flex-1"><span className="flex flex-wrap justify-between gap-2"><strong>{item.name}</strong><span className="text-xs text-emerald-300">{item.range}</span></span><span className="mt-2 block text-sm text-indigo-200">{item.note}</span><span className="mt-2 block text-xs text-white/70">Sample estimator value: ${item.amount.toLocaleString()} / year</span></span></label>)}</div><a href="mailto:financialaid@northstar.edu" className="mt-6 block rounded-xl bg-white py-4 text-center text-sm font-semibold text-indigo-950 hover:bg-indigo-100 transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">Talk to financial aid</a></aside></div></div></section>
  );
}
