import { useMemo, useState } from "react";

export default function MortgageCalculator() {
  const [price, setPrice] = useState(650000);
  const [down, setDown] = useState(20);
  const [years, setYears] = useState(30);
  const [rate, setRate] = useState(6.5);
  const details = useMemo(() => {
    const principal = price * (1 - down / 100);
    const monthlyRate = rate / 1200;
    const payment = monthlyRate ? principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -years * 12)) : principal / (years * 12);
    const tax = price * 0.011 / 12;
    const insurance = price * 0.0035 / 12;
    return { principal, payment, tax, insurance, total: payment + tax + insurance };
  }, [price, down, years, rate]);
  const money = (n) => `$${Math.round(n).toLocaleString()}`;
  const paymentParts = [
    { label: "Principal & interest", amount: details.payment, color: "bg-cyan-300" },
    { label: "Property tax (est.)", amount: details.tax, color: "bg-emerald-300" },
    { label: "Home insurance (est.)", amount: details.insurance, color: "bg-violet-300" },
  ];

  return (
    <section className="bg-white px-5 py-20">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_.8fr]">
        <div><p className="text-sm font-semibold uppercase tracking-[.2em] text-emerald-700">Plan with confidence</p><h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Mortgage calculator</h2><p className="mt-3 text-slate-500">Adjust the numbers to explore an estimated monthly payment.</p>
          <div className="mt-8 space-y-7">
            <label className="block text-sm font-medium text-slate-700">Home price <span className="float-right font-bold text-slate-900">{money(price)}</span><input aria-label="Home price" type="range" min="150000" max="1500000" step="5000" value={price} onChange={(e) => setPrice(+e.target.value)} className="mt-3 block w-full accent-emerald-700" /></label>
            <label className="block text-sm font-medium text-slate-700">Down payment <span className="float-right font-bold text-slate-900">{down}% · {money(price * down / 100)}</span><input aria-label="Down payment" type="range" min="5" max="50" value={down} onChange={(e) => setDown(+e.target.value)} className="mt-3 block w-full accent-emerald-700" /></label>
            <div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Loan term <span className="float-right font-bold text-slate-900">{years} years</span><input aria-label="Loan term" type="range" min="10" max="30" step="5" value={years} onChange={(e) => setYears(+e.target.value)} className="mt-4 block w-full accent-emerald-700" /></label><label className="text-sm font-medium text-slate-700">Interest rate<input aria-label="Interest rate" type="number" min="0.1" max="20" step="0.1" value={rate} onChange={(e) => setRate(Math.max(0.1, +e.target.value || 0.1))} className="mt-2 block w-full rounded-xl border border-slate-200 p-3" /></label></div>
          </div>
        </div>
        <aside className="rounded-3xl bg-slate-950 p-7 text-white sm:p-9"><p className="text-sm text-emerald-300">Estimated monthly payment</p><p className="mt-2 text-5xl font-bold tracking-tight">{money(details.total)}</p><p className="mt-2 text-sm text-slate-400">Principal, taxes & insurance</p><div className="mt-8 space-y-5 border-t border-white/10 pt-6 text-sm">{paymentParts.map((part) => { const share = Math.round(part.amount / details.total * 100); return <div key={part.label}><div className="flex justify-between gap-3"><span className="text-slate-400">{part.label}</span><strong>{money(part.amount)} · {share}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label={`${part.label} share`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={share}><div className={`h-full rounded-full transition-all duration-300 ${part.color}`} style={{ width: `${share}%` }} /></div></div>; })}<div className="flex justify-between border-t border-white/10 pt-4"><span className="text-slate-400">Loan amount</span><strong>{money(details.principal)}</strong></div></div><p className="mt-7 text-xs leading-relaxed text-slate-500">Illustration only; excludes HOA, PMI, and lender fees. Rates and taxes are assumptions, not a loan offer.</p></aside>
      </div>
    </section>
  );
}
