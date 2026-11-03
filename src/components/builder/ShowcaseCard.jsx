import { memo, Suspense, useCallback, useEffect, useRef, useState } from "react";
import CodeView from "./CodeView";
import CopyButton from "./CopyButton";
import LoadingSkeleton from "./LoadingSkeleton";
import PreviewFrame from "./PreviewFrame";
import { DEVICES, DeviceSwitcher, ViewSwitcher } from "./Controls";
import Icon from "./Icon";

function ShowcaseCard({ id, item }) {
  const [view, setView] = useState("preview");
  const [device, setDevice] = useState("desktop");
  const [reloadKey, setReloadKey] = useState(0);
  const [previewReady, setPreviewReady] = useState(false);
  const [code, setCode] = useState(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState("");
  const cardRef = useRef(null);
  const codePromise = useRef(null);
  const Component = item.Component;
  const width = DEVICES.find((d) => d.id === device).width;
  const scrollDriven = id === "experience-timeline" || id === "glass-dock";

  useEffect(() => {
    if (view !== "preview" || previewReady) return undefined;
    const card = cardRef.current;
    if (!card || typeof IntersectionObserver === "undefined") {
      setPreviewReady(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPreviewReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "500px 0px" },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, [previewReady, view]);

  const loadCode = useCallback(async () => {
    if (code !== null) return code;
    if (!codePromise.current) codePromise.current = item.loadCode();

    try {
      const source = await codePromise.current;
      setCode(source);
      return source;
    } catch (error) {
      codePromise.current = null;
      throw error;
    }
  }, [code, item.loadCode]);

  const handleViewChange = useCallback(
    (nextView) => {
      setView(nextView);
      if (nextView !== "code" || code !== null) return;

      setCodeLoading(true);
      setCodeError("");
      loadCode()
        .catch(() => setCodeError("Could not load this component's source. Try again."))
        .finally(() => setCodeLoading(false));
    },
    [code, loadCode],
  );

  const lines = code === null ? null : code.split("\n").length;

  return (
    <article
      ref={cardRef}
      id={id}
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-2xl shadow-black/40"
    >
      <header className="flex flex-col gap-4 border-b border-white/10 bg-zinc-900/80 px-5 py-4 backdrop-blur xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-white">{item.name}</h3>
            {item.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-950">
                <Icon name="sparkles" className="h-3 w-3" /> Featured
              </span>
            )}
            {item.tags
              .filter((tag) => tag !== "Featured")
              .map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400">
                  {tag}
                </span>
              ))}
          </div>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">{item.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ViewSwitcher value={view} onChange={handleViewChange} />
          {view === "preview" && (
            <>
              <DeviceSwitcher value={device} onChange={setDevice} />
              <button
                type="button"
                title="Replay animations"
                aria-label="Replay animations"
                onClick={() => setReloadKey((key) => key + 1)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-zinc-900 text-zinc-400 transition hover:text-white"
              >
                <Icon name="rotate" />
              </button>
            </>
          )}
          <CopyButton getCode={loadCode} successMessage={`${item.name} copied to clipboard!`} />
        </div>
      </header>

      {view === "preview" ? (
        <div className="preview-canvas p-3 sm:p-5">
          <div className="overflow-hidden rounded-xl ring-1 ring-white/10">
            <PreviewFrame
              key={reloadKey}
              width={width}
              autoHeight={!scrollDriven}
              height={scrollDriven ? "min(78vh, 900px)" : undefined}
              title={`${item.name} preview`}
            >
              {previewReady ? (
                <Suspense fallback={<LoadingSkeleton label={`Loading ${item.name} preview`} />}>
                  <Component />
                </Suspense>
              ) : (
                <LoadingSkeleton label={`Waiting to load ${item.name} preview`} />
              )}
            </PreviewFrame>
          </div>
        </div>
      ) : codeError ? (
        <div role="alert" className="flex items-center justify-between gap-4 p-6 text-sm text-rose-300">
          <span>{codeError}</span>
          <button type="button" onClick={() => handleViewChange("code")} className="rounded-lg border border-rose-300/30 px-3 py-2 font-semibold hover:bg-rose-300/10">
            Retry
          </button>
        </div>
      ) : codeLoading && code === null ? (
        <LoadingSkeleton label={`Loading ${item.name} source`} className="m-4" />
      ) : code !== null ? (
        <CodeView code={code} />
      ) : null}

      <footer className="flex items-center justify-between border-t border-white/5 px-5 py-2.5 text-xs text-zinc-500">
        <span className="font-mono">{item.exportName}.jsx</span>
        <span>
          {scrollDriven ? "Scroll inside preview · " : ""}
          {lines === null ? "Source loads on demand · " : `${lines} lines · `}
          React + Tailwind · zero dependencies
        </span>
      </footer>
    </article>
  );
}

export default memo(ShowcaseCard);
