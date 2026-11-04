import { useState } from "react";

const PRICING_TIERS = [
  {
    name: "Starter",
    description: "For individuals and side projects.",
    monthly: 0,
    cta: "Get started",
    features: ["1 website", "Community components", "Custom domain", "Basic analytics"],
    missing: ["Team collaboration", "Priority support"],
  },
  {
    name: "Pro",
    description: "For growing teams that ship fast.",
    monthly: 29,
    cta: "Start free trial",
    popular: true,
    features: ["Unlimited websites", "All premium components", "Custom domain", "Advanced analytics", "Team collaboration"],
    missing: ["Priority support"],
  },
  {
    name: "Enterprise",
    description: "For organizations with advanced needs.",
    monthly: 99,
    cta: "Contact sales",
    features: ["Everything in Pro", "SSO & SAML", "Audit logs", "Dedicated success manager", "Team collaboration", "Priority support"],
    missing: [],
  },
];

export default function PricingTable() {
  const [annual, setAnnual] = useState(true);

  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-tight">Simple, transparent pricing</h2>
          <p className="mt-4 text-lg text-slate-500 leading-relaxed">Start free. Upgrade when you&apos;re ready. No hidden fees.</p>

          <div className="mt-10 inline-flex items-center gap-4">
            <div className="relative grid grid-cols-2 rounded-full bg-slate-100 p-2">
              <span
                className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow transition-transform duration-300 ease-out ${ annual ? "translate-x-full" : "translate-x-0" }`}
              />
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className={`relative z-10 rounded-full px-6 py-2 text-sm font-semibold transition ${
                  annual ? "text-slate-500" : "text-slate-900"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                className={`relative z-10 rounded-full px-6 py-2 text-sm font-semibold transition ${
                  annual ? "text-slate-900" : "text-slate-500"
                }`}
              >
                Annual
              </button>
            </div>
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-700">Save 20%</span>
          </div>
        </div>

        <div className="mt-16 grid items-stretch gap-8 lg:grid-cols-3">
          {PRICING_TIERS.map((tier) => {
            const price = annual ? tier.monthly * 0.8 : tier.monthly;
            const priceLabel = Number.isInteger(price) ? String(price) : price.toFixed(2);
            return (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-3xl p-8 transition duration-300 hover:-translate-y-1 ${ tier.popular ? "bg-slate-900 text-white shadow-xl shadow-indigo-500/30 ring-2 ring-indigo-500 lg:scale-105" : "bg-white text-slate-900 ring-1 ring-slate-200 hover:shadow-xl" } ease-out`}
              >
                {tier.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                    Most popular
                  </span>
                )}

                <h3 className="text-lg font-semibold leading-tight tracking-tight">{tier.name}</h3>
                <p className={`mt-2 text-sm ${tier.popular ? "text-slate-400" : "text-slate-500"} leading-relaxed`}>{tier.description}</p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span key={`${tier.name}-${annual}`} className="text-5xl font-bold tracking-tight animate-[pricing-pop_400ms_ease-out]">
                    ${priceLabel}
                  </span>
                  <span className={tier.popular ? "text-slate-400" : "text-slate-500"}>/month</span>
                </div>
                <p className={`mt-2 h-5 text-xs ${tier.popular ? "text-slate-400" : "text-slate-500"} leading-relaxed`}>
                  {annual && price > 0 ? `Billed $${(price * 12).toFixed(2).replace(/\.00$/, "")} yearly` : price > 0 ? "Billed monthly" : "Free forever"}
                </p>

                <a
                  href="#"
                  className={`mt-8 rounded-xl px-4 py-4 text-center text-sm font-semibold ${ tier.popular ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:opacity-90" : "bg-slate-900 hover:bg-slate-700" } transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400`}
                >
                  {tier.cta}
                </a>

                <ul className="mt-8 space-y-4 text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-4 leading-relaxed">
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${tier.popular ? "bg-indigo-500/20 text-indigo-300" : "bg-emerald-100 text-emerald-600"}`}>
                        <svg viewBox="0 0 20 20" className="h-3 w-3 fill-current">
                          <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0z" />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                  {tier.missing.map((f) => (
                    <li key={f} className={`flex items-center gap-4 line-through ${tier.popular ? "text-slate-600" : "text-slate-400"} leading-relaxed`}>
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-100/10 text-xs">✕</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes pricing-pop {
          0% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
