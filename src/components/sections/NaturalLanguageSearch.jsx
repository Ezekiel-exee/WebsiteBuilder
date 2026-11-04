import { useMemo, useState } from "react";

export default function NaturalLanguageSearch() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const extractedFilters = useMemo(() => {
    const filters = [];
    const bedrooms = query.match(/\b(\d+)\s*[- ]?\s*bed(?:room)?s?\b/i);
    const budget = query.match(/\b(?:under|below|less than)\s*\$?([\d,]+)/i);
    const location = query.match(/\b(?:near|in|around)\s+(.+?)(?=\s+(?:under|below|with|for)\b|$)/i);
    const propertyType = query.match(/\b(apartment|condo|house|townhome|studio)\b/i);
    if (bedrooms) filters.push(`${bedrooms[1]} bedrooms`);
    if (location) filters.push(`Near ${location[1].trim()}`);
    if (budget) filters.push(`Under $${budget[1]}/mo`);
    if (propertyType) filters.push(propertyType[1][0].toUpperCase() + propertyType[1].slice(1));
    return filters;
  }, [query]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-6 py-24 text-white">
      <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-violet-500/20 blur-[100px]" />
      <div className="relative mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[.2em] text-cyan-300 leading-relaxed">Search the way you think</p>
        <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl leading-tight">Tell us what you&apos;re looking for.</h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">Use everyday language. We&apos;ll turn your request into useful filters.</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (query.trim()) setSearched(true);
          }}
          className="mt-9 flex flex-col gap-3 rounded-3xl border border-white/15 bg-white/[.08] p-3 shadow-2xl shadow-black/20 backdrop-blur-xl sm:flex-row sm:items-center"
        >
          <label htmlFor="natural-search-query" className="sr-only">Describe what you are looking for</label>
          <input
            id="natural-search-query"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearched(false);
            }}
            placeholder="Find a 2-bedroom apartment near downtown under $2,500/mo"
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 sm:text-base"
          />
          <button type="submit" className="rounded-2xl bg-cyan-300 px-6 py-4 font-semibold text-slate-950 hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white transition-all duration-200 ease-out focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
            Search
          </button>
        </form>
        <div className="mt-4 flex min-h-8 flex-wrap gap-2" aria-live="polite" aria-label="Detected search filters">
          {extractedFilters.map((filter) => (
            <span key={filter} className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-xs font-medium text-cyan-100">{filter}</span>
          ))}
          {!extractedFilters.length && <span className="text-xs text-slate-500">Try “2-bedroom apartment near downtown under $2,500/mo”</span>}
        </div>
        {searched && <p role="status" className="mt-6 text-sm text-emerald-200 leading-relaxed">Search ready · {extractedFilters.length} filters detected. Connect this form to your search endpoint.</p>}
      </div>
    </section>
  );
}
