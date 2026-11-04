import { useState } from "react";

const PROPERTY_SEARCH_TYPES = ["House", "Condo", "Townhouse", "Any type"];
const PROPERTY_SEARCH_AMENITIES = ["Pool", "Garage", "Pet-friendly", "Outdoor space"];

export default function PropertySearchHero() {
  const [mode, setMode] = useState("Buy");
  const [location, setLocation] = useState("Austin, TX");
  const [type, setType] = useState("Any type");
  const [minPrice, setMinPrice] = useState(300000);
  const [maxPrice, setMaxPrice] = useState(850000);
  const [minSqft, setMinSqft] = useState(800);
  const [maxSqft, setMaxSqft] = useState(2500);
  const [amenities, setAmenities] = useState([]);
  const [searched, setSearched] = useState(false);
  const toggleAmenity = (amenity) => {
    setAmenities((current) => current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity]);
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 px-6 py-20 text-white sm:py-28">
      <img src="https://picsum.photos/seed/modernhome/1800/900" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/30" />
      <div className="relative mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[.22em] text-emerald-300 leading-relaxed">Find your place</p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl leading-tight">A better move starts here.</h1>
        <p className="mt-4 max-w-xl text-lg text-slate-300 leading-relaxed">Explore homes, neighborhoods, and the next chapter that feels like you.</p>

        <div className="mt-10 max-w-4xl rounded-2xl border border-white/15 bg-slate-900/80 p-4 shadow-xl backdrop-blur-xl sm:p-6">
          <div className="mb-6 flex gap-2" role="tablist" aria-label="Listing status">
            {["Buy", "Rent", "Sold"].map((item) => (
              <button key={item} type="button" role="tab" aria-selected={mode === item} onClick={() => setMode(item)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${mode === item ? "bg-emerald-400 text-slate-950" : "text-slate-300 hover:bg-white/10"}`}>
                {item}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.2fr_1.2fr_auto]">
            <label className="text-xs font-medium text-slate-400">Location
              <select value={location} onChange={(e) => setLocation(e.target.value)} className="mt-2 block w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-emerald-400">
                {["Austin, TX", "Brooklyn, NY", "Los Angeles, CA", "Miami, FL", "Seattle, WA"].map((city) => <option key={city}>{city}</option>)}
              </select>
            </label>
            <fieldset className="text-xs font-medium text-slate-400"><legend>Property type</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {PROPERTY_SEARCH_TYPES.map((item) => <button key={item} type="button" aria-pressed={type === item} onClick={() => setType(item)} className={`rounded-lg border px-2.5 py-2 text-xs transition ${type === item ? "border-emerald-400 bg-emerald-400/10 text-emerald-200" : "border-white/10 text-slate-300 hover:border-white/30"}`}>{item}</button>)}
              </div>
            </fieldset>
            <button type="button" onClick={() => setSearched(true)} className="self-end rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-slate-950 transition-all duration-300 hover:bg-emerald-300">
              Search homes
            </button>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <fieldset className="space-y-4">
              <legend className="text-xs font-semibold uppercase tracking-wider text-slate-300">Price range · ${minPrice.toLocaleString()}–${maxPrice.toLocaleString()}</legend>
              <label className="block text-xs text-slate-400">Minimum price
                <input aria-label="Minimum price" type="range" min="150000" max="1975000" step="25000" value={minPrice} onChange={(event) => setMinPrice(Math.min(Number(event.target.value), maxPrice - 25000))} className="mt-2 block w-full accent-emerald-400" />
              </label>
              <label className="block text-xs text-slate-400">Maximum price
                <input aria-label="Maximum price" type="range" min="175000" max="2000000" step="25000" value={maxPrice} onChange={(event) => setMaxPrice(Math.max(Number(event.target.value), minPrice + 25000))} className="mt-2 block w-full accent-emerald-400" />
              </label>
            </fieldset>
            <fieldset className="space-y-4">
              <legend className="text-xs font-semibold uppercase tracking-wider text-slate-300">Home size · {minSqft.toLocaleString()}–{maxSqft.toLocaleString()} sq ft</legend>
              <label className="block text-xs text-slate-400">Minimum square feet
                <input aria-label="Minimum square feet" type="range" min="500" max="5900" step="100" value={minSqft} onChange={(event) => setMinSqft(Math.min(Number(event.target.value), maxSqft - 100))} className="mt-2 block w-full accent-emerald-400" />
              </label>
              <label className="block text-xs text-slate-400">Maximum square feet
                <input aria-label="Maximum square feet" type="range" min="600" max="6000" step="100" value={maxSqft} onChange={(event) => setMaxSqft(Math.max(Number(event.target.value), minSqft + 100))} className="mt-2 block w-full accent-emerald-400" />
              </label>
            </fieldset>
          </div>
          <fieldset className="mt-6">
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-300">Must-have amenities</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {PROPERTY_SEARCH_AMENITIES.map((amenity) => (
                <button key={amenity} type="button" aria-pressed={amenities.includes(amenity)} onClick={() => toggleAmenity(amenity)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300 ${amenities.includes(amenity) ? "border-emerald-300 bg-emerald-300/15 text-emerald-100" : "border-white/15 text-slate-300 hover:border-white/35"}`}>
                  {amenity}
                </button>
              ))}
            </div>
          </fieldset>
          {searched && <p role="status" className="mt-4 text-sm text-emerald-200 leading-relaxed">Searching {mode.toLowerCase()} listings in {location} · {type} · ${minPrice.toLocaleString()}–${maxPrice.toLocaleString()} · {minSqft.toLocaleString()}–{maxSqft.toLocaleString()} sq ft · {amenities.length ? amenities.join(", ") : "any amenities"}.</p>}
        </div>
      </div>
    </section>
  );
}
