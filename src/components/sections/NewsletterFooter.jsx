import { useState } from "react";

const NEWSLETTER_FOOTER_COLUMNS = [
  { title: "Product", links: ["Features", "Templates", "Integrations", "Pricing", "Changelog"] },
  { title: "Company", links: ["About", "Careers", "Blog", "Press", "Partners"] },
  { title: "Resources", links: ["Documentation", "Guides", "Community", "Support", "Status"] },
  { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Licenses"] },
];

const NEWSLETTER_FOOTER_SOCIALS = [
  { name: "X", path: "M18.9 2H22l-7.6 8.7L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8.1-9.3L1.5 2h6.9l4.8 6.3L18.9 2zm-1.2 18h1.7L7.4 3.9H5.6L17.7 20z" },
  { name: "GitHub", path: "M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z" },
  { name: "LinkedIn", path: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.7 4.8 6.1V21h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9z" },
  { name: "YouTube", path: "M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.8 15.1V8.9l5.7 3.1-5.7 3.1z" },
];

export default function NewsletterFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="relative overflow-hidden bg-zinc-950 text-zinc-400">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 pb-10 pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <a href="#" className="flex items-center gap-2 text-xl font-bold text-white transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 font-black">
                N
              </span>
              Nebula
            </a>
            <p className="mt-6 max-w-sm leading-relaxed">
              The fastest way to design, build, and launch beautiful websites. Made for teams that care about craft.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes("@")) setSubscribed(true);
              }}
              className="mt-8 max-w-sm"
            >
              <label htmlFor="footer-email" className="text-sm font-semibold text-white">
                Subscribe to our newsletter
              </label>
              <div className="mt-4 flex rounded-xl border border-white/10 bg-white/5 p-2 transition focus-within:border-violet-500/60 focus-within:ring-4 focus-within:ring-violet-500/10">
                <input
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  disabled={subscribed}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white placeholder:text-zinc-600 outline-none"
                />
                <button
                  type="submit"
                  disabled={subscribed}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-violet-200 disabled:bg-emerald-400 transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                >
                  {subscribed ? "Subscribed ✓" : "Subscribe"}
                </button>
              </div>
              <p className="mt-2 text-xs text-zinc-600 leading-relaxed">No spam. Unsubscribe at any time.</p>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {NEWSLETTER_FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold text-white leading-tight tracking-tight">{col.title}</h3>
                <ul className="mt-4 space-y-4 text-sm">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="hover:translate-x-0.5 hover:text-white transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col-reverse items-center justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm leading-relaxed">© {new Date().getFullYear()} Nebula Inc. All rights reserved.</p>
          <div className="flex gap-4">
            {NEWSLETTER_FOOTER_SOCIALS.map((s) => (
              <a
                key={s.name}
                href="#"
                aria-label={s.name}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 hover:-translate-y-0.5 hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-white transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
