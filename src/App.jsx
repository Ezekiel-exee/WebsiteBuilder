import { useCallback, useEffect, useState } from "react";
import Sidebar from "./components/builder/Sidebar";
import ShowcaseCard from "./components/builder/ShowcaseCard";
import TemplateView from "./components/builder/TemplateView";
import Icon from "./components/builder/Icon";
import { ToastProvider } from "./components/builder/Toast";
import { CATEGORIES, COMPONENTS } from "./data/registry";
import { TEMPLATES } from "./data/templates";

const DEFAULT_ROUTE = { type: "category", id: "carousels" };

function parseHash() {
  const [, type, id] = window.location.hash.match(/^#\/(category|template)\/([\w-]+)/) || [];
  if (type === "category" && CATEGORIES.some((c) => c.id === id)) return { type, id };
  if (type === "template" && TEMPLATES.some((t) => t.id === id)) return { type, id };
  return DEFAULT_ROUTE;
}

export default function App() {
  const [route, setRoute] = useState(parseHash);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((next) => {
    window.location.hash = `/${next.type}/${next.id}`;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    window.scrollTo({ top: 0, behavior });
  }, []);

  const openSection = useCallback(
    (componentId) => {
      const cat = CATEGORIES.find((c) => c.components.includes(componentId));
      navigate({ type: "category", id: cat.id });
      setTimeout(() => document.getElementById(componentId)?.scrollIntoView({ behavior: "smooth" }), 80);
    },
    [navigate]
  );

  const category = route.type === "category" ? CATEGORIES.find((c) => c.id === route.id) : null;
  const template = route.type === "template" ? TEMPLATES.find((t) => t.id === route.id) : null;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.08),transparent_50%)]" />

        <Sidebar route={route} onNavigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="relative lg:pl-72">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/10 bg-zinc-950/80 px-4 backdrop-blur-xl sm:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-300 lg:hidden"
              aria-label="Open sidebar"
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>
            <nav className="flex min-w-0 items-center gap-2 text-sm">
              <span className="text-zinc-500">{template ? "Templates" : "Components"}</span>
              <span className="text-zinc-700">/</span>
              <span className="truncate font-medium text-white">{template ? template.name : category.name}</span>
            </nav>
            <div className="ml-auto hidden items-center gap-2 text-xs text-zinc-500 md:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Live preview · click “Copy Code” to grab any section
            </div>
          </header>

          <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8">
            {template ? (
              <TemplateView template={template} onOpenSection={openSection} />
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{category.name}</h1>
                  <p className="mt-2 text-zinc-400">
                    {category.components.length} production-ready {category.components.length === 1 ? "component" : "components"}.
                    Each one is a single self-contained file — preview it on any device, then copy and paste.
                  </p>
                </div>
                <div className="space-y-10">
                  {category.components.map((id) => (
                    <ShowcaseCard key={id} id={id} item={COMPONENTS[id]} />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
