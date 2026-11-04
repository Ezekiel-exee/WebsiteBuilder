import { useState } from "react";

export default function CtaBanner() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    setTimeout(() => setStatus("success"), 900);
  };

  return (
    <section className="bg-zinc-950 px-6 py-24">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 px-8 py-16 text-center shadow-[0_40px_120px_-30px_rgba(99,102,241,0.8)] sm:px-16 sm:py-20">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-fuchsia-400/40 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-5xl leading-tight">
            Ready to launch your next big idea?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-indigo-100 leading-relaxed">
            Join 25,000+ makers getting weekly design drops, templates, and growth tips.
          </p>

          {status === "success" ? (
            <div className="mx-auto mt-10 inline-flex items-center gap-4 rounded-full bg-white/15 px-6 py-4 font-semibold text-white backdrop-blur">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400 text-sm text-emerald-950">✓</span>
              You&apos;re on the list! Check your inbox.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto mt-10 flex max-w-md flex-col gap-4 sm:flex-row" noValidate>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="Enter your email"
                aria-invalid={status === "error"}
                className={`flex-1 rounded-full border bg-white/10 px-5 py-3.5 text-white placeholder:text-indigo-100/70 outline-none backdrop-blur transition focus:bg-white/20 ${
                  status === "error" ? "border-rose-300" : "border-white/25 focus:border-white/60"
                }`}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-indigo-700 shadow-lg hover:scale-[1.03] disabled:opacity-70 transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              >
                {status === "loading" && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-700" />
                )}
                Get early access
              </button>
            </form>
          )}
          {status === "error" && <p className="mt-4 text-sm text-rose-100 leading-relaxed">Please enter a valid email address.</p>}
        </div>
      </div>
    </section>
  );
}
