const MARQUEE_TESTIMONIALS = [
  { name: "Sarah Chen", role: "CTO, Lumina", quote: "We rebuilt our entire marketing site in a weekend. The components are absurdly polished.", seed: "sarah" },
  { name: "Marcus Webb", role: "Founder, Driftwood", quote: "Conversion rate jumped 38% after switching to these landing sections. Unreal.", seed: "marcus" },
  { name: "Aisha Patel", role: "Design Lead, Orbit", quote: "Finally a library that respects design details. Spacing, motion, typography — all perfect.", seed: "aisha" },
  { name: "Diego Ramos", role: "Engineer, Pulse", quote: "Copy, paste, ship. I haven't written a pricing table from scratch in months.", seed: "diego" },
  { name: "Emma Larsson", role: "PM, Northwind", quote: "Our team went from mockup to production in record time. Highly recommend.", seed: "emma" },
  { name: "Kenji Sato", role: "Indie Hacker", quote: "The carousel alone was worth it. My portfolio has never looked better.", seed: "kenji" },
];

function MarqueeTestimonialCard({ item }) {
  return (
    <figure className="w-80 shrink-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-96">
      <div className="mb-3 flex gap-0.5 text-amber-400">
        {"★★★★★".split("").map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </div>
      <blockquote className="text-[15px] leading-relaxed text-slate-700">“{item.quote}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <img
          src={`https://i.pravatar.cc/96?u=${item.seed}`}
          alt={item.name}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
        />
        <div>
          <p className="text-sm font-semibold text-slate-900">{item.name}</p>
          <p className="text-xs text-slate-500">{item.role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

function MarqueeRow({ items, reverse }) {
  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      {/* Content is rendered twice so translating by -50% loops seamlessly */}
      <div
        className={`flex w-max gap-6 py-3 pr-6 group-hover:[animation-play-state:paused] ${
          reverse ? "[animation:marquee-testimonials_45s_linear_infinite_reverse]" : "[animation:marquee-testimonials_40s_linear_infinite]"
        }`}
      >
        {[...items, ...items].map((item, i) => (
          <MarqueeTestimonialCard key={`${item.seed}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function MarqueeTestimonials() {
  const half = Math.ceil(MARQUEE_TESTIMONIALS.length / 2);

  return (
    <section className="overflow-hidden bg-slate-50 py-24">
      <style>{`
        @keyframes marquee-testimonials {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Testimonials</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">Loved by builders worldwide</h2>
        <p className="mt-4 text-slate-500">Join thousands of teams shipping faster. Hover to pause.</p>
      </div>

      <div className="mt-14 space-y-4">
        <MarqueeRow items={MARQUEE_TESTIMONIALS.slice(0, half).concat(MARQUEE_TESTIMONIALS.slice(0, half))} />
        <MarqueeRow items={MARQUEE_TESTIMONIALS.slice(half).concat(MARQUEE_TESTIMONIALS.slice(half))} reverse />
      </div>
    </section>
  );
}
