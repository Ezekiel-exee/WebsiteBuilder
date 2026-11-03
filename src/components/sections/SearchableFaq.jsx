import { useMemo, useState } from "react";

const SEARCHABLE_FAQ_ITEMS = [
  { category: "Getting started", question: "How do I set up my workspace?", answer: "Create a workspace, invite your team, then choose the projects and tools you want to bring together." },
  { category: "Getting started", question: "Can I try the product before committing?", answer: "Yes. Start with the free plan and explore the core workflow before choosing a paid tier." },
  { category: "Billing", question: "Can I change my plan later?", answer: "You can upgrade or downgrade from workspace settings. Changes are prorated on your next invoice." },
  { category: "Billing", question: "Which payment methods are supported?", answer: "Most major credit and debit cards are supported. Enterprise plans can also be invoiced annually." },
  { category: "Security", question: "Where is my data stored?", answer: "Workspace data is encrypted in transit and at rest, with configurable retention controls for administrators." },
  { category: "Security", question: "Can I remove a team member?", answer: "Workspace admins can remove members at any time. Their access is revoked immediately." },
];

export default function SearchableFaq() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All topics");
  const [openQuestion, setOpenQuestion] = useState(null);
  const categories = ["All topics", ...new Set(SEARCHABLE_FAQ_ITEMS.map((item) => item.category))];
  const visibleItems = useMemo(() => SEARCHABLE_FAQ_ITEMS.filter((item) => {
    const matchesCategory = category === "All topics" || item.category === category;
    const matchesQuery = `${item.question} ${item.answer} ${item.category}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [category, query]);

  return (
    <section className="bg-slate-50 px-5 py-20 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[.2em] text-indigo-700">Answers, organized</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Find the answer you need</h2>
        </div>
        <label className="mx-auto mt-7 flex max-w-2xl items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
          <span aria-hidden="true" className="text-slate-400">⌕</span>
          <span className="sr-only">Search frequently asked questions</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search setup, billing, security…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="text-xs font-semibold text-indigo-700">Clear</button>}
        </label>

        <div className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Filter FAQs by topic">
          {categories.map((item) => (
            <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`rounded-full px-4 py-2 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 ${category === item ? "bg-indigo-700 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-indigo-50"}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {visibleItems.map((item) => {
            const expanded = openQuestion === item.question;
            const answerId = `faq-answer-${item.question.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
            return (
              <article key={item.question} className="rounded-2xl border border-slate-200 bg-white px-5 shadow-sm">
                <h3>
                  <button type="button" aria-expanded={expanded} aria-controls={answerId} onClick={() => setOpenQuestion(expanded ? null : item.question)} className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-semibold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600">
                    <span>{item.question}</span><span className={`text-xl font-normal text-indigo-700 transition-transform ${expanded ? "rotate-45" : ""}`} aria-hidden="true">+</span>
                  </button>
                </h3>
                <div id={answerId} aria-hidden={!expanded} className={`grid transition-all duration-300 ease-in-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="pb-5 text-sm leading-relaxed text-slate-600">{item.answer}</p>
                  </div>
                </div>
              </article>
            );
          })}
          {!visibleItems.length && <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 md:col-span-2">No questions match those filters. Try another topic or search term.</p>}
        </div>
      </div>
    </section>
  );
}
