import { useState } from "react";

const PROPERTY_LISTINGS = [
  { title: "Sunlit Hill Country Retreat", address: "2417 Oak Knoll Dr · Austin, TX", price: 749000, beds: 4, baths: 3, sqft: 2640, badge: "Featured", seed: "listing-hill", open: true },
  { title: "Modern Eastside Bungalow", address: "808 Willow St · Austin, TX", price: 589000, beds: 3, baths: 2, sqft: 1820, badge: "Open House", seed: "listing-east", open: false },
  { title: "Lakeview Glass House", address: "16 Lakeshore Ln · Austin, TX", price: 1125000, beds: 5, baths: 4, sqft: 3210, badge: "New", seed: "listing-lake", open: true },
];

export default function PropertyListingGrid() {
  const [saved, setSaved] = useState([]);
  const [photo, setPhoto] = useState({});
  const [calculator, setCalculator] = useState(null);
  const toggleSave = (id) => setSaved((items) => items.includes(id) ? items.filter((x) => x !== id) : [...items, id]);

  return (
    <section className="bg-slate-50 px-5 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm font-semibold uppercase tracking-[.2em] text-emerald-700">Handpicked for you</p><h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Homes worth coming home to</h2></div>
          <a href="#listings" className="text-sm font-semibold text-emerald-800 underline underline-offset-4">View all listings →</a>
        </div>
        <div id="listings" className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {PROPERTY_LISTINGS.map((home, index) => (
            <article key={home.title} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="relative h-60 overflow-hidden">
                <img src={`https://picsum.photos/seed/${home.seed}-${photo[index] || 0}/900/650`} alt={home.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-800">{home.badge}</span>
                <button type="button" aria-label={saved.includes(index) ? "Remove saved home" : "Save home"} aria-pressed={saved.includes(index)} onClick={() => toggleSave(index)} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-rose-500 shadow transition hover:scale-110">
                  <svg viewBox="0 0 24 24" className={`h-5 w-5 ${saved.includes(index) ? "fill-rose-500" : "fill-none"}`} stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z" /></svg>
                </button>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {[0, 1, 2].map((n) => <button key={n} type="button" aria-label={`Show photo ${n + 1}`} onClick={() => setPhoto((p) => ({ ...p, [index]: n }))} className={`h-2 rounded-full transition-all ${photo[index] === n ? "w-5 bg-white" : "w-2 bg-white/60"}`} />)}
                </div>
              </div>
              <div className="p-5">
                <p className="text-2xl font-bold text-slate-900">${home.price.toLocaleString()}</p>
                <h3 className="mt-1 font-semibold text-slate-800">{home.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{home.address}</p>
                <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-sm text-slate-600"><span>{home.beds} beds</span><span>{home.baths} baths</span><span>{home.sqft.toLocaleString()} sqft</span></div>
                <button type="button" onClick={() => setCalculator(home)} className="mt-4 w-full rounded-xl border border-emerald-700 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50">Estimate monthly payment</button>
                {home.open && <p className="mt-3 text-center text-xs font-medium text-emerald-700">Open house this weekend · Ask agent for times</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
      {calculator && <div role="dialog" aria-modal="true" aria-label="Payment estimate" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4" onClick={() => setCalculator(null)}><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}><button type="button" onClick={() => setCalculator(null)} className="float-right text-slate-500" aria-label="Close dialog">✕</button><p className="text-sm text-emerald-700">Quick estimate</p><h3 className="mt-1 text-xl font-bold">{calculator.title}</h3><p className="mt-4 text-sm text-slate-600">See an estimated monthly payment with the mortgage calculator below. Actual terms depend on your lender and loan approval.</p><p className="mt-4 rounded-xl bg-slate-50 p-4 text-2xl font-bold">${Math.round(calculator.price * 0.0065).toLocaleString()}<span className="text-sm font-normal text-slate-500"> / month est.</span></p><button type="button" onClick={() => setCalculator(null)} className="mt-5 w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white">Continue exploring</button></div></div>}
    </section>
  );
}
