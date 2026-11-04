import { useState } from "react";

const PRODUCT_VARIANTS = [
  { name: "Midnight", color: "#1e293b", light: "#475569", price: 189, detail: "A clean, versatile everyday finish.", badge: "BEST SELLER", badgeClass: "bg-slate-900 text-white" },
  { name: "Glacier", color: "#7dd3fc", light: "#e0f2fe", price: 199, detail: "Cool-toned color with a soft matte surface.", badge: "NEW COLORWAY", badgeClass: "bg-sky-100 text-sky-950" },
  { name: "Citrus", color: "#bef264", light: "#ecfccb", price: 195, detail: "A bright limited-run colorway.", badge: "LIMITED RUN", badgeClass: "bg-lime-200 text-lime-950" },
  { name: "Clay", color: "#c08457", light: "#fed7aa", price: 189, detail: "Warm earth tones, made for daily use.", badge: "EARTH TONES", badgeClass: "bg-orange-100 text-orange-950" },
];

export default function ProductCustomizer() {
  const [selected, setSelected] = useState(0);
  const [added, setAdded] = useState(false);
  const variant = PRODUCT_VARIANTS[selected];
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const moveSelection = (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    setSelected((current) => (current + direction + PRODUCT_VARIANTS.length) % PRODUCT_VARIANTS.length);
  };

  return (
    <section className="bg-white px-6 py-20 text-slate-900">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative grid min-h-[340px] place-items-center overflow-hidden rounded-[2rem] p-8 sm:min-h-[470px]" style={{ background: `radial-gradient(circle at 50% 42%, ${variant.light} 0%, #f8fafc 58%, #e2e8f0 100%)` }}>
          <span aria-live="polite" className={`absolute left-5 top-5 rounded-full px-4 py-2 text-xs font-semibold shadow-sm backdrop-blur transition-colors duration-300 ${variant.badgeClass}`}>{variant.badge}</span>
          <svg viewBox="0 0 500 320" role="img" aria-label={`${variant.name} sneaker preview`} className="w-full max-w-[480px] drop-shadow-2xl transition-all duration-500">
            <ellipse cx="255" cy="266" rx="170" ry="18" fill="#0f172a" opacity=".14" />
            <path d="M72 206c28-12 55-17 79-32 19-12 37-32 50-54l21-35 42 12c12 33 31 52 63 63l82 28c21 7 34 22 34 39 0 17-13 28-35 28H102c-34 0-53-16-53-36 0-7 8-13 23-13Z" fill={variant.color} stroke="#0f172a" strokeOpacity=".2" strokeWidth="5" />
            <path d="M101 234h313c18 0 29 7 29 18 0 10-11 17-30 17H104c-35 0-55-8-55-22 0-10 15-13 52-13Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="5" />
            <path d="m202 116 38 14-31 45m31-45 38 17-32 40m32-40 38 18-31 34" fill="none" stroke={variant.light} strokeLinecap="round" strokeLinejoin="round" strokeWidth="10" />
            <path d="M98 202c20-12 39-18 60-22m-83 42 58 4m126-15 33 6m14 1 32 9" fill="none" stroke="#fff" strokeLinecap="round" strokeOpacity=".72" strokeWidth="7" />
          </svg>
          <span className="absolute bottom-5 right-5 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-xs font-semibold text-slate-600 backdrop-blur">Free shipping</span>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[.2em] text-indigo-700 leading-relaxed">Made to move</p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl leading-tight">The everyday sneaker</h2>
          <p className="mt-4 max-w-lg leading-relaxed text-slate-600">A lightweight silhouette with all-day cushioning and a durable, flexible sole.</p>
          <p className="mt-6 text-3xl font-bold leading-relaxed">{money.format(variant.price)} <span className="text-sm font-normal text-slate-500">USD</span></p>

          <fieldset className="mt-8" onKeyDown={moveSelection}>
            <legend className="text-sm font-semibold">Color · <span className="font-normal text-slate-600">{variant.name}</span></legend>
            <div role="radiogroup" aria-label="Choose a color" className="mt-4 flex flex-wrap gap-4">
              {PRODUCT_VARIANTS.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  role="radio"
                  aria-checked={selected === index}
                  aria-label={item.name}
                  tabIndex={selected === index ? 0 : -1}
                  onClick={() => { setSelected(index); setAdded(false); }}
                  className={`grid h-10 w-10 place-items-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${selected === index ? "ring-2 ring-indigo-700 ring-offset-2" : "hover:scale-110"}`}
                  style={{ backgroundColor: item.color }}
                >
                  {selected === index && <span aria-hidden="true" className="text-sm text-white">✓</span>}
                </button>
              ))}
            </div>
          </fieldset>
          <p aria-live="polite" className="mt-4 text-sm text-slate-600 leading-relaxed">{variant.detail}</p>
          <ul className="mt-6 space-y-2 text-sm text-slate-700">
            <li>✓ Recycled knit upper</li><li>✓ Responsive foam cushioning</li><li>✓ 30-day easy returns</li>
          </ul>
          <button type="button" onClick={() => setAdded(true)} className="mt-7 w-full rounded-xl bg-slate-950 px-6 py-4 font-semibold text-white transition hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 sm:w-auto">
            {added ? `${variant.name} added to bag ✓` : "Add to bag"}
          </button>
        </div>
      </div>
    </section>
  );
}
