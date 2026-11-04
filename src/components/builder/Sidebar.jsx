import { useMemo, useState } from "react";
import Icon from "./Icon";
import { CATEGORIES, COMPONENTS } from "../../data/registry";
import { TEMPLATES } from "../../data/templates";

export default function Sidebar({ route, onNavigate, open, onClose }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.components.some((id) => {
          const c = COMPONENTS[id];
          return [c.name, c.description, ...c.tags].join(" ").toLowerCase().includes(q);
        })
    );
  }, [query]);

  const filteredTemplates = TEMPLATES.filter((t) => !query.trim() || t.name.toLowerCase().includes(query.trim().toLowerCase()));

  const item = (active) =>
    `group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
      active ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
    }`;

  const go = (next) => {
    onNavigate(next);
    onClose();
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-zinc-950/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <a href="#/" onClick={(e) => { e.preventDefault(); go({ type: "category", id: "carousels" }); }} className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="h-8 w-8" />
            <span className="text-lg font-bold tracking-tight text-white">
              Block<span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">smith</span>
            </span>
          </a>
          <button type="button" onClick={onClose} className="text-zinc-400 lg:hidden" aria-label="Close sidebar">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 pb-3">
          <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-zinc-500 focus-within:border-violet-500/50">
            <Icon name="search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search components…"
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
            />
          </label>
        </div>

        <nav className="sidebar-scroll flex-1 space-y-6 overflow-y-auto px-3 pb-6">
          {filteredTemplates.length > 0 && (
            <div>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Page Templates</p>
              {filteredTemplates.map((t) => (
                <button key={t.id} type="button" onClick={() => go({ type: "template", id: t.id })} className={item(route.type === "template" && route.id === t.id)}>
                  <span className={`grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br ${t.accent} text-white`}>
                    <Icon name="layout" className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1">{t.name}</span>
                  <span className="text-[11px] text-zinc-600">{t.sections.length}</span>
                </button>
              ))}
            </div>
          )}

          <div>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Components</p>
            {filtered.map((cat) => {
              const featured = cat.components.some((id) => COMPONENTS[id].featured);
              const categoryButton = (
                <button type="button" onClick={() => go({ type: "category", id: cat.id })} className={item(route.type === "category" && route.id === cat.id)}>
                  <span className="grid h-6 w-6 place-items-center rounded-md border border-white/10 bg-zinc-900 text-zinc-400 group-hover:text-white">
                    <Icon name={cat.icon} className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1">{cat.name}</span>
                  {featured && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]" title="Featured" />}
                  <span className="text-[11px] text-zinc-600">{cat.components.length}</span>
                </button>
              );
              return <div key={cat.id}>{categoryButton}</div>;
            })}
            {filtered.length === 0 && filteredTemplates.length === 0 && (
              <p className="px-3 py-4 text-sm text-zinc-500">No matches for “{query}”.</p>
            )}
          </div>
        </nav>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 p-4">
          <p className="text-xs leading-5 text-zinc-500">
            {Object.keys(COMPONENTS).length} components · {TEMPLATES.length} templates
            <br />
            React · Vite · Tailwind CSS
          </p>
          <button
            type="button"
            onClick={() => go({ type: "arcade", id: "arcade" })}
            aria-label="Open the hidden Code Arcade"
            title="Open Code Arcade"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-zinc-900 text-zinc-400 transition hover:border-cyan-400/25 hover:bg-cyan-400/5 hover:text-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
          >
            <Icon name="gamepad" className="h-5 w-5" />
          </button>
        </div>
      </aside>
    </>
  );
}
