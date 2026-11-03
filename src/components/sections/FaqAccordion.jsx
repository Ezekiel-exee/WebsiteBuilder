import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "Can I use the components in commercial projects?",
    a: "Absolutely. Every component is licensed for unlimited personal and commercial projects, including client work.",
  },
  {
    q: "Do I need to install any extra dependencies?",
    a: "No. Each section is a self-contained React component that only relies on React and Tailwind CSS. Copy, paste, and you're done.",
  },
  {
    q: "Are the components accessible?",
    a: "Yes. We use semantic HTML, proper ARIA attributes, visible focus states, and keyboard navigation wherever it matters.",
  },
  {
    q: "How do I customize colors and fonts?",
    a: "Simply edit the Tailwind utility classes directly in the JSX, or extend your Tailwind theme to apply brand colors globally.",
  },
  {
    q: "Do you offer refunds?",
    a: "If you're not happy within 30 days of purchase, contact us and we'll issue a full refund — no questions asked.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">FAQ</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Frequently asked questions</h2>
          <p className="mt-4 leading-relaxed text-slate-500">
            Can&apos;t find the answer you&apos;re looking for? Reach out to our{" "}
            <a href="#" className="font-semibold text-indigo-600 underline-offset-4 hover:underline">
              support team
            </a>
            .
          </p>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {FAQ_ITEMS.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? -1 : i)}
                  aria-expanded={open}
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span
                    className={`text-lg font-medium transition-colors ${
                      open ? "text-indigo-600" : "text-slate-900 group-hover:text-indigo-600"
                    }`}
                  >
                    {item.q}
                  </span>
                  <span
                    className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                      open ? "rotate-180 border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-slate-500"
                    }`}
                  >
                    <span className="absolute h-0.5 w-3 rounded bg-current" />
                    <span
                      className={`absolute h-3 w-0.5 rounded bg-current transition-transform duration-300 ${
                        open ? "scale-y-0" : "scale-y-100"
                      }`}
                    />
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 pr-12 leading-relaxed text-slate-600">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
