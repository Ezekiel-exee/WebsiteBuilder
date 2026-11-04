const NEIGHBORHOOD_GUIDE = [
  { name: "Walkability", score: 92, note: "Most errands on foot", icon: "🚶", color: "#10b981" },
  { name: "Bikeability", score: 78, note: "Protected routes nearby", icon: "🚲", color: "#0ea5e9" },
  { name: "Public transit", score: 84, note: "Frequent bus connections", icon: "🚇", color: "#8b5cf6" },
  { name: "Schools", score: 96, note: "Highly rated nearby", icon: "🎓", color: "#f59e0b" },
];

const NEIGHBORHOOD_PLACES = [
  { name: "Cedar Grove Elementary", type: "School", distance: "0.4 mi" },
  { name: "Oak Knoll Market", type: "Groceries", distance: "0.2 mi" },
  { name: "Route 12 · Oak & 3rd", type: "Transit", distance: "3 min walk" },
  { name: "Walnut Creek Trail", type: "Parks", distance: "0.7 mi" },
];

export default function NeighborhoodGuide() {
  return (
    <section className="bg-emerald-50 px-6 py-20">
      <div className="mx-auto max-w-6xl"><div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[.2em] text-emerald-800 leading-relaxed">Beyond the front door</p><h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl leading-tight tracking-tight">Get to know the neighborhood</h2><p className="mt-4 text-slate-600 leading-relaxed">Oak Knoll, Austin · a little bit of everything, close to home.</p></div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">{NEIGHBORHOOD_GUIDE.map((item) => <article key={item.name} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-900/5"><div className="flex items-center justify-between gap-4"><span className="text-2xl" aria-hidden="true">{item.icon}</span><div role="img" aria-label={`${item.name} score ${item.score} out of 100`} className="grid h-16 w-16 shrink-0 place-items-center rounded-full p-2" style={{ background: `conic-gradient(${item.color} ${item.score}%, #e2e8f0 ${item.score}% 100%)` }}><div className="grid h-full w-full place-items-center rounded-full bg-white text-sm font-bold text-slate-900">{item.score}</div></div></div><h3 className="mt-4 font-semibold text-slate-900 leading-tight tracking-tight">{item.name}</h3><p className="mt-2 text-sm text-slate-500 leading-relaxed">{item.note}</p></article>)}</div>
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-emerald-900/5"><div className="flex items-center justify-between border-b p-6"><h3 className="font-semibold text-slate-900 leading-tight tracking-tight">Nearby essentials</h3><span className="text-xs text-slate-500">Approximate distance</span></div><div className="divide-y sm:grid sm:grid-cols-2 sm:divide-y-0">{NEIGHBORHOOD_PLACES.map((place) => <div key={place.name} className="flex items-center justify-between gap-4 p-6 sm:border-b"><div><p className="font-medium text-slate-800 leading-relaxed">{place.name}</p><p className="mt-2 text-xs text-slate-500 leading-relaxed">{place.type}</p></div><span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800">{place.distance}</span></div>)}</div></div>
      </div>
    </section>
  );
}
