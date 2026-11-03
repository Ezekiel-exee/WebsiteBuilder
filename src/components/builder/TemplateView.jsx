import { memo, Suspense, useCallback, useMemo, useRef, useState } from "react";
import CodeView from "./CodeView";
import CopyButton from "./CopyButton";
import LoadingSkeleton from "./LoadingSkeleton";
import PreviewFrame from "./PreviewFrame";
import { DEVICES, DeviceSwitcher, ViewSwitcher } from "./Controls";
import Icon from "./Icon";
import { COMPONENTS } from "../../data/registry";
import { bundleTemplate } from "../../utils/bundleCode";

function TemplateView({ template, onOpenSection }) {
  const [view, setView] = useState("preview");
  const [device, setDevice] = useState("desktop");
  const [bundle, setBundle] = useState(null);
  const [bundleLoading, setBundleLoading] = useState(false);
  const [bundleError, setBundleError] = useState("");
  const bundlePromise = useRef(null);
  const width = DEVICES.find((deviceOption) => deviceOption.id === device).width;
  const sections = useMemo(
    () => template.sections.map((id) => ({ id, ...COMPONENTS[id] })),
    [template],
  );
  const unique = useMemo(
    () => sections.filter((section, index) => sections.findIndex((item) => item.id === section.id) === index),
    [sections],
  );
  const Component = template.Component;

  const loadBundle = useCallback(async () => {
    if (bundle !== null) return bundle;
    if (!bundlePromise.current) {
      bundlePromise.current = (async () => {
        const [source, componentSources] = await Promise.all([
          template.loadSource(),
          Promise.all(
            unique.map(async (section) => ({
              ...section,
              code: await section.loadCode(),
            })),
          ),
        ]);
        return bundleTemplate({ ...template, source }, componentSources);
      })();
    }

    try {
      const source = await bundlePromise.current;
      setBundle(source);
      return source;
    } catch (error) {
      bundlePromise.current = null;
      throw error;
    }
  }, [bundle, template, unique]);

  const handleViewChange = useCallback(
    (nextView) => {
      setView(nextView);
      if (nextView !== "code" || bundle !== null) return;

      setBundleLoading(true);
      setBundleError("");
      loadBundle()
        .catch(() => setBundleError("Could not load this template's source. Try again."))
        .finally(() => setBundleLoading(false));
    },
    [bundle, loadBundle],
  );

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-2xl shadow-black/40">
        <header className="flex flex-col gap-4 border-b border-white/10 bg-zinc-900/80 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full bg-gradient-to-br ${template.accent}`} />
              <h2 className="text-lg font-semibold text-white">{template.name}</h2>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400">
                {sections.length} sections
              </span>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-zinc-400">{template.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ViewSwitcher value={view} onChange={handleViewChange} />
            {view === "preview" && <DeviceSwitcher value={device} onChange={setDevice} />}
            <CopyButton
              getCode={loadBundle}
              label="Copy Code"
              successMessage={`${template.name} standalone page code copied!`}
            />
          </div>
        </header>

        {view === "preview" ? (
          <div className="preview-canvas p-3 sm:p-5">
            <div className="mx-auto overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10 transition-[max-width] duration-500" style={{ maxWidth: width }}>
              <div className="flex items-center gap-3 border-b border-white/10 bg-zinc-800 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="flex-1 truncate rounded-md bg-zinc-900 px-3 py-1 text-center font-mono text-xs text-zinc-500">
                  https://{template.id}.example.com
                </div>
              </div>
              <PreviewFrame width="100%" autoHeight={false} height="min(78vh, 900px)" title={`${template.name} preview`}>
                <Suspense fallback={<LoadingSkeleton label={`Loading ${template.name} template`} className="min-h-[70vh]" />}>
                  <Component />
                </Suspense>
              </PreviewFrame>
            </div>
          </div>
        ) : bundleError ? (
          <div role="alert" className="flex items-center justify-between gap-4 p-6 text-sm text-rose-300">
            <span>{bundleError}</span>
            <button type="button" onClick={() => handleViewChange("code")} className="rounded-lg border border-rose-300/30 px-3 py-2 font-semibold hover:bg-rose-300/10">
              Retry
            </button>
          </div>
        ) : bundleLoading && bundle === null ? (
          <LoadingSkeleton label={`Loading ${template.name} source`} className="m-4" />
        ) : bundle !== null ? (
          <CodeView code={bundle} maxHeight="78vh" />
        ) : null}
      </div>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Sections in this template</h3>
        <p className="mt-1 text-sm text-zinc-500">Grab any individual section, or open it in the library for a closer look.</p>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((section, index) => (
            <li
              key={`${section.id}-${index}`}
              className="group flex items-center gap-3 rounded-xl border border-white/5 bg-zinc-950/60 p-3 transition hover:border-white/15"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 font-mono text-xs text-zinc-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => onOpenSection(section.id)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="flex items-center gap-1 truncate text-sm font-medium text-zinc-200 group-hover:text-white">
                  {section.name}
                  <Icon name="external" className="h-3 w-3 opacity-0 transition group-hover:opacity-60" />
                </span>
                <span className="block truncate font-mono text-[11px] text-zinc-500">{section.exportName}.jsx</span>
              </button>
              <CopyButton size="sm" label="Copy" getCode={section.loadCode} successMessage={`${section.name} copied!`} />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default memo(TemplateView);
