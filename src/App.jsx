import { useCallback, useEffect, useState } from "react";
import Sidebar from "./components/builder/Sidebar";
import ShowcaseCard from "./components/builder/ShowcaseCard";
import CustomizerPanel from "./components/builder/CustomizerPanel";
import TemplateView from "./components/builder/TemplateView";
import ArcadePage from "./components/arcade/ArcadePage";
import Icon from "./components/builder/Icon";
import { ToastProvider } from "./components/builder/Toast";
import { CATEGORIES, COMPONENTS } from "./data/registry";
import { TEMPLATES } from "./data/templates";
import { DEFAULT_CUSTOMIZATION } from "./utils/customizer";

const DEFAULT_ROUTE = { type: "category", id: "carousels" };
const NO_OVERRIDES = {};
const DESKTOP_QUERY = "(min-width: 1024px)";

function parseHash() {
  if (/^#\/arcade(\/|$)/.test(window.location.hash)) return { type: "arcade", id: "arcade" };
  const [, type, id] = window.location.hash.match(/^#\/(category|template)\/([\w-]+)/) || [];
  if (type === "category" && CATEGORIES.some((c) => c.id === id)) return { type, id };
  if (type === "template" && TEMPLATES.some((t) => t.id === id)) return { type, id };
  return DEFAULT_ROUTE;
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export default function App() {
  const [route, setRoute] = useState(parseHash);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [componentCustomizations, setComponentCustomizations] = useState({});
  const [elementOverrides, setElementOverrides] = useState({});
  const [selectedTargets, setSelectedTargets] = useState({});
  const [selectedComponentId, setSelectedComponentId] = useState(() => {
    const activeCategory = CATEGORIES.find((item) => item.id === parseHash().id);
    return activeCategory?.components[0] || Object.keys(COMPONENTS)[0];
  });
  const [discoveredTargets, setDiscoveredTargets] = useState({});

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((next) => {
    window.location.hash = next.type === "arcade" ? "/arcade" : `/${next.type}/${next.id}`;
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
  const isArcade = route.type === "arcade";
  const customization = componentCustomizations[selectedComponentId] || DEFAULT_CUSTOMIZATION;
  const selectedOverrides = elementOverrides[selectedComponentId] || {};
  const selectedTarget = selectedTargets[selectedComponentId] || "component";
  const activeSettings = { ...customization, ...(selectedOverrides[selectedTarget] || {}) };
  const availableTargets = discoveredTargets[category?.id]?.[selectedComponentId] || ["component"];
  const handleCustomizerChange = useCallback((update) => {
    if (selectedTarget === "component") {
      setComponentCustomizations((current) => ({
        ...current,
        [selectedComponentId]: update(current[selectedComponentId] || DEFAULT_CUSTOMIZATION),
      }));
      return;
    }
    setElementOverrides((current) => {
      const componentOverrides = current[selectedComponentId] || {};
      const active = { ...customization, ...(componentOverrides[selectedTarget] || {}) };
      const next = update(active);
      const scoped = { ...(componentOverrides[selectedTarget] || {}) };
      Object.keys(next).forEach((key) => {
        if (next[key] === customization[key]) delete scoped[key];
        else scoped[key] = next[key];
      });
      return { ...current, [selectedComponentId]: { ...componentOverrides, [selectedTarget]: scoped } };
    });
  }, [customization, selectedComponentId, selectedTarget]);
  const handleTargetsDiscovered = useCallback((componentId, targets) => {
    setDiscoveredTargets((current) => {
      const categoryTargets = current[category.id] || {};
      if (categoryTargets[componentId]?.length === targets.length &&
          categoryTargets[componentId]?.every((target, index) => target === targets[index])) return current;
      return { ...current, [category.id]: { ...categoryTargets, [componentId]: targets } };
    });
  }, [category?.id]);

  useEffect(() => {
    const activeCategory = route.type === "category" ? CATEGORIES.find((item) => item.id === route.id) : null;
    setSelectedComponentId(activeCategory?.components[0] || "");
    setStudioOpen(false);
  }, [route.type, route.id]);

  useEffect(() => {
    const name = isArcade ? "Code Arcade" : template ? template.name : category.name;
    document.title = `${name} — Blocksmith`;
  }, [isArcade, template, category]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (isDesktop) setSidebarOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setShowTop(window.scrollY > 900));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollToTop = useCallback(() => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    window.scrollTo({ top: 0, behavior });
  }, []);

  const handleSelectTarget = useCallback((target) => {
    setSelectedTargets((current) => ({ ...current, [selectedComponentId]: target }));
  }, [selectedComponentId]);

  const handleSelectComponent = useCallback((componentId) => {
    setSelectedComponentId(componentId);
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    document.getElementById(componentId)?.scrollIntoView({ behavior, block: "start" });
  }, []);

  return (
    <ToastProvider>
      <div className="builder-shell min-h-screen bg-zinc-950 text-zinc-100">
        <a href="#main-content" onClick={(e) => { e.preventDefault(); document.getElementById("main-content")?.focus({ preventScroll: false }); }} className="skip-link">
          Skip to content
        </a>
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.08),transparent_50%)]" />

        <Sidebar route={route} onNavigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="relative lg:pl-72">
          <header className="ui-focus sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/10 bg-zinc-950/80 px-4 backdrop-blur-xl sm:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-zinc-300 transition hover:bg-white/5 hover:text-white lg:hidden"
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
              <span className="text-zinc-500">{isArcade ? "Arcade" : template ? "Templates" : "Components"}</span>
              <span className="text-zinc-700" aria-hidden="true">/</span>
              <span aria-current="page" className="truncate font-medium text-white">{isArcade ? "Games" : template ? template.name : category.name}</span>
            </nav>
            <div className="ml-auto hidden items-center gap-2 text-xs text-zinc-400 md:flex">
              <span className={`h-2 w-2 rounded-full ${isArcade ? "bg-cyan-300" : "animate-pulse bg-emerald-400 motion-reduce:animate-none"}`} />
              {isArcade ? "Local arcade · no sign-in required" : "Live preview · click “Copy Code” to grab any section"}
            </div>
          </header>

          <div id="main-content" tabIndex={-1} className="outline-none">
          {isArcade ? (
            <ArcadePage onBack={() => navigate({ type: "category", id: "interactive-widgets" })} />
          ) : (
            <main className="ui-focus mx-auto max-w-[1680px] px-4 py-6 sm:px-8 sm:py-8">
              {template ? (
                <TemplateView key={template.id} template={template} onOpenSection={openSection} />
              ) : (
                <>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{category.name}</h1>
                  <p className="mt-2 max-w-3xl text-zinc-400">
                    {category.components.length} production-ready {category.components.length === 1 ? "component" : "components"}.
                    Each one is a single self-contained file — preview it on any device, then copy and paste.
                  </p>
                  {category.components.length > 1 && (
                    <nav aria-label={`Components in ${category.name}`} className="mt-4 flex flex-wrap gap-2">
                      {category.components.map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => handleSelectComponent(id)}
                          aria-current={id === selectedComponentId ? "true" : undefined}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                            id === selectedComponentId
                              ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
                              : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          {COMPONENTS[id].name}
                        </button>
                      ))}
                    </nav>
                  )}
                </div>
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
                  <div className="order-2 space-y-8 lg:order-1 lg:space-y-10">
                    {category.components.map((id) => (
                      <ShowcaseCard
                        key={id}
                        id={id}
                        item={COMPONENTS[id]}
                        customization={componentCustomizations[id] || DEFAULT_CUSTOMIZATION}
                        elementOverrides={elementOverrides[id] || NO_OVERRIDES}
                        selectedTarget={selectedTargets[id] || "component"}
                        isStudioSelected={id === selectedComponentId}
                        onTargetsDiscovered={handleTargetsDiscovered}
                      />
                    ))}
                  </div>
                  <aside
                    aria-label="Global studio controls"
                    className="sidebar-scroll order-1 lg:sticky lg:top-20 lg:order-2 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:overscroll-contain"
                  >
                    <button
                      type="button"
                      onClick={() => setStudioOpen((open) => !open)}
                      aria-expanded={studioOpen}
                      aria-controls="studio-panel"
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-white/20 lg:hidden"
                    >
                      <span>
                        Studio controls
                        <span className="block text-xs font-normal text-zinc-400">Customize {COMPONENTS[selectedComponentId]?.name || "components"}</span>
                      </span>
                      <span className={`text-zinc-400 transition-transform ${studioOpen ? "rotate-180" : ""}`} aria-hidden="true">▾</span>
                    </button>
                    <div id="studio-panel" data-open={studioOpen} className="studio-collapse" inert={!isDesktop && !studioOpen}>
                      <div className="pt-3 lg:pt-0">
                    <CustomizerPanel
                      settings={activeSettings}
                      onChange={handleCustomizerChange}
                      componentOptions={category.components.map((id) => ({ id, label: COMPONENTS[id].name }))}
                      selectedComponentId={selectedComponentId}
                      onSelectComponent={handleSelectComponent}
                      selectedTarget={selectedTarget}
                      onSelectTarget={handleSelectTarget}
                      availableTargets={availableTargets}
                      onReset={() => {
                        setComponentCustomizations((current) => {
                          const next = { ...current };
                          delete next[selectedComponentId];
                          return next;
                        });
                        setElementOverrides((current) => {
                          const next = { ...current };
                          delete next[selectedComponentId];
                          return next;
                        });
                        setSelectedTargets((current) => {
                          const next = { ...current };
                          delete next[selectedComponentId];
                          return next;
                        });
                      }}
                    />
                      </div>
                    </div>
                  </aside>
                </div>
                </>
              )}
            </main>
          )}
          </div>
        </div>

        {showTop && !isArcade && (
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            title="Back to top"
            className="ui-focus fixed bottom-6 right-4 z-30 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-zinc-900/90 text-zinc-200 shadow-xl shadow-black/40 backdrop-blur transition hover:border-cyan-400/40 hover:text-white sm:right-8"
          >
            <span className="rotate-180 text-lg leading-none" aria-hidden="true">▾</span>
          </button>
        )}
      </div>
    </ToastProvider>
  );
}
