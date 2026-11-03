import { useState } from "react";

const SPLIT_HERO_STATS = [
  { value: "120+", label: "Projects shipped" },
  { value: "98%", label: "Client retention" },
  { value: "12", label: "Design awards" },
];

export default function SplitHero() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.includes("@")) setSent(true);
  };

  return (
    <section className="relative overflow-hidden bg-stone-50 px-6 py-20 sm:py-28">
      <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-orange-300/40 blur-3xl" />
      <div className="absolute -bottom-40 left-10 h-80 w-80 rounded-full bg-rose-300/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            <span className="h-px w-8 bg-orange-600" />
            Creative studio
          </p>
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-stone-900 sm:text-6xl lg:text-7xl">
            We craft brands people{" "}
            <em className="relative whitespace-nowrap text-orange-600">
              remember
              <svg viewBox="0 0 200 12" className="absolute -bottom-2 left-0 w-full" preserveAspectRatio="none">
                <path d="M2 9c50-6 146-8 196-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </em>
            .
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-stone-600">
            An independent design studio building identities, websites, and digital products for ambitious
            companies around the world.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="flex-1 rounded-full border border-stone-300 bg-white px-5 py-3.5 text-stone-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
            />
            <button
              type="submit"
              className="rounded-full bg-stone-900 px-6 py-3.5 font-semibold text-white transition hover:bg-orange-600"
            >
              {sent ? "We'll be in touch ✓" : "Start a project"}
            </button>
          </form>

          <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-stone-200 pt-8">
            {SPLIT_HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="text-3xl font-bold text-stone-900">{stat.value}</dt>
                <dd className="mt-1 text-sm text-stone-500">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://picsum.photos/seed/studio-a/600/800"
              alt="Studio work"
              className="h-80 w-full rounded-3xl object-cover shadow-xl transition duration-500 hover:-rotate-2 hover:scale-[1.03]"
            />
            <div className="flex flex-col gap-4 pt-12">
              <img
                src="https://picsum.photos/seed/studio-b/600/500"
                alt="Studio detail"
                className="h-48 w-full rounded-3xl object-cover shadow-xl transition duration-500 hover:rotate-2 hover:scale-[1.03]"
              />
              <img
                src="https://picsum.photos/seed/studio-c/600/500"
                alt="Studio team"
                className="h-48 w-full rounded-3xl object-cover shadow-xl transition duration-500 hover:-rotate-2 hover:scale-[1.03]"
              />
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-2xl">
            <div className="flex -space-x-2">
              {["a", "b", "c"].map((s) => (
                <img
                  key={s}
                  src={`https://i.pravatar.cc/80?u=split-${s}`}
                  alt=""
                  className="h-9 w-9 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
            <div className="text-sm">
              <p className="font-semibold text-stone-900">★★★★★ 4.9/5</p>
              <p className="text-stone-500">from 300+ reviews</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
