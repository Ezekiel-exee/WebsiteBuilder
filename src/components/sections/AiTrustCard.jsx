import { useState } from "react";

const AI_TRUST_SOURCES = [
  { title: "Q2 customer research", detail: "Interview synthesis · 18 participants · Updated Jun 14, 2025" },
  { title: "Product analytics overview", detail: "Event data · 90-day window · Updated Jun 12, 2025" },
  { title: "Support conversation themes", detail: "Support export · 1,204 conversations · Updated Jun 10, 2025" },
];

export default function AiTrustCard() {
  const [feedback, setFeedback] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const insight = "Customers who complete onboarding within their first session are more likely to return in week two. A guided checklist may help reduce early drop-off.";

  const copyInsight = async () => {
    try {
      await navigator.clipboard.writeText(insight);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopyError("Clipboard access is unavailable in this browser.");
    }
  };

  return (
    <section className="bg-slate-100 px-5 py-20 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[.2em] text-violet-700">Transparent by design</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">AI insight, with its receipts</h2>
        </div>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800">
                <span className="h-2 w-2 rounded-full bg-violet-500" aria-hidden="true" /> AI-generated insight
              </span>
              <h3 className="mt-4 text-xl font-bold">A clearer first session could improve retention</h3>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-emerald-800">92%</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Confidence</p>
            </div>
          </div>

          <p className="mt-5 leading-relaxed text-slate-600">{insight}</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100" role="meter" aria-label="Confidence" aria-valuemin="0" aria-valuemax="100" aria-valuenow="92">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: "92%" }} />
          </div>

          <details className="group mt-6 rounded-2xl border border-slate-200">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-semibold text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500">
              <span>Sources used · {AI_TRUST_SOURCES.length}</span>
              <span className="transition group-open:rotate-180" aria-hidden="true">⌄</span>
            </summary>
            <ul className="space-y-2 border-t border-slate-100 p-3">
              {AI_TRUST_SOURCES.map((source) => (
                <li key={source.title} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-800">{source.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{source.detail}</p>
                </li>
              ))}
            </ul>
          </details>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-500">Was this insight useful?</p>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Helpful" aria-pressed={feedback === "up"} onClick={() => setFeedback(feedback === "up" ? "" : "up")} className={`rounded-lg border px-3 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 ${feedback === "up" ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>👍</button>
              <button type="button" aria-label="Not helpful" aria-pressed={feedback === "down"} onClick={() => setFeedback(feedback === "down" ? "" : "down")} className={`rounded-lg border px-3 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 ${feedback === "down" ? "border-rose-300 bg-rose-50 text-rose-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>👎</button>
              <button type="button" onClick={copyInsight} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500">
                {copied ? "Copied" : "Copy insight"}
              </button>
            </div>
          </div>
          {copyError && <p role="status" className="mt-3 text-right text-xs text-rose-700">{copyError}</p>}
        </article>
      </div>
    </section>
  );
}
