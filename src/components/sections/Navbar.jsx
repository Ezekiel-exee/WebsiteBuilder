import { useState } from "react";

const NAVBAR_LINKS = ["Product", "Features", "Pricing", "Customers", "Docs"];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-black">
            N
          </span>
          Nebula
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {NAVBAR_LINKS.map((link) => (
            <li key={link}>
              <a
                href="#"
                className="relative text-sm font-medium text-zinc-400 hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-gradient-to-r after:from-violet-400 after:to-cyan-400 hover:after:w-full transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-4 md:flex">
          <a href="#" className="text-sm font-medium text-zinc-300 hover:text-white transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
            Sign in
          </a>
          <a
            href="#"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          >
            Get started
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="relative grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white md:hidden"
        >
          <span
            className={`absolute h-0.5 w-5 bg-current transition-transform duration-300 ${ open ? "rotate-45" : "-translate-y-1.5" }`}
          />
          <span className={`absolute h-0.5 w-5 bg-current transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
          <span
            className={`absolute h-0.5 w-5 bg-current transition-transform duration-300 ${ open ? "-rotate-45" : "translate-y-1.5" }`}
          />
        </button>
      </nav>

      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-300 md:hidden ${ open ? "grid-rows-[1fr]" : "grid-rows-[0fr]" }`}
      >
        <div className="min-h-0">
          <ul className="space-y-2 border-t border-white/10 px-6 py-4">
            {NAVBAR_LINKS.map((link) => (
              <li key={link}>
                <a href="#" className="block rounded-lg px-4 py-2 text-zinc-300 hover:bg-white/5 hover:text-white transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
                  {link}
                </a>
              </li>
            ))}
            <li className="pt-2 leading-relaxed">
              <a
                href="#"
                className="block rounded-lg bg-white px-4 py-2 text-center font-semibold text-zinc-900 transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              >
                Get started
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
