import Navbar from "../components/sections/Navbar";
import ProductCustomizer from "../components/sections/ProductCustomizer";
import CartDrawer from "../components/sections/CartDrawer";

export default function ProductPage() {
  return (
    <main className="bg-white text-slate-900">
      <Navbar />
      <div className="bg-slate-950 px-6 py-2 text-center text-xs font-medium text-white">Complimentary delivery on orders over $150 · 30-day returns</div>
      <div id="product" className="[&_svg]:transition-transform [&_svg:hover]:scale-110"><ProductCustomizer /></div>
      <section className="bg-slate-50 px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[.8fr_1.2fr]">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-700 leading-relaxed">Made for every day</p><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight">Details that go the distance.</h2><p className="mt-4 text-sm leading-6 text-slate-600">Thoughtful materials, a considered fit, and the comfort to keep moving.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[["Materials", "Recycled knit upper · natural rubber outsole"], ["Fit & care", "True to size · removable insole · machine washable"], ["Shipping", "Free delivery over $150 · easy 30-day returns"], ["Warranty", "One-year craftsmanship guarantee"]].map(([title, detail]) => <details key={title} className="rounded-xl border border-slate-200 bg-white p-4"><summary className="cursor-pointer text-sm font-semibold">{title}</summary><p className="mt-4 text-xs leading-5 text-slate-600">{detail}</p></details>)}
          </div>
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[.7fr_1.3fr]">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-700 leading-relaxed">Reviews</p><p className="mt-2 text-5xl font-semibold leading-relaxed">4.9<span className="text-xl text-slate-400">/5</span></p><p className="mt-2 text-sm text-slate-500 leading-relaxed">Based on 1,284 verified reviews</p></div>
          <div className="space-y-4">{[["5 stars", 86], ["4 stars", 11], ["3 stars", 2], ["2 stars", 1]].map(([label, amount]) => <div key={label} className="grid grid-cols-[4rem_1fr_2.5rem] items-center gap-4 text-xs text-slate-600"><span>{label}</span><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-400" style={{ width: `${amount}%` }} /></div><span className="text-right">{amount}%</span></div>)}</div>
        </div>
      </section>
      <CartDrawer />
      <div className="sticky bottom-0 z-30 flex items-center justify-between border-t border-slate-200 bg-white/95 px-6 py-4 shadow-lg backdrop-blur md:hidden"><span className="text-xs font-semibold">Everyday sneaker · from $189</span><a href="#product" className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">Shop now</a></div>
    </main>
  );
}
