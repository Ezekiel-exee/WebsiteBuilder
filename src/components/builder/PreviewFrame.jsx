import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const FRAME_DOC = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#0c0c11"><div id="preview-root" style="display:flow-root"></div></body></html>`;

function syncFrameStyles(doc) {
  doc.head.querySelectorAll("[data-host-style]").forEach((node) => node.remove());
  let stylesReady = true;
  document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    let clone = node;
    if (node.tagName === "LINK") {
      if (!node.sheet) {
        stylesReady = false;
        return;
      }
      clone = doc.createElement("style");
      clone.media = node.media;
      clone.textContent = Array.from(node.sheet.cssRules, (rule) => rule.cssText).join("\n");
    } else {
      clone = node.cloneNode(true);
    }
    clone.setAttribute("data-host-style", "");
    doc.head.appendChild(clone);
  });
  return stylesReady;
}

function containsStylesheet(node) {
  if (node.nodeType !== 1) return false;
  return node.matches('style, link[rel="stylesheet"]') || Boolean(node.querySelector('style, link[rel="stylesheet"]'));
}

/**
 * Renders children inside an isolated iframe. Because the iframe has its own viewport,
 * Tailwind's responsive breakpoints (sm:, md:, lg:) react to the simulated device width
 * exactly as they would on a real phone or tablet.
 */
export default function PreviewFrame({ children, width = "100%", height, autoHeight = true, title = "Preview", backgroundColor = "#0c0c11", onContentNode }) {
  const iframeRef = useRef(null);
  const [mountNode, setMountNode] = useState(null);
  const [contentHeight, setContentHeight] = useState(320);
  const [styleError, setStyleError] = useState(false);
  const [frameVersion, setFrameVersion] = useState(0);

  const handleLoad = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.body.style.backgroundColor = backgroundColor;
    setMountNode(null);
    const stylesReady = syncFrameStyles(doc);
    setStyleError(!stylesReady);
    if (stylesReady) setMountNode(doc.getElementById("preview-root"));
  };

  // Keep the copied host styles in sync with HMR after the initial pre-mount copy.
  useEffect(() => {
    if (!mountNode) return;
    const doc = mountNode.ownerDocument;
    const observer = new MutationObserver((records) => {
      const styleChanged = records.some((record) => {
        if (record.type === "characterData") return record.target.parentElement?.matches("style");
        if (record.type === "attributes") {
          return (
            record.target.matches('style, link[rel="stylesheet"]') ||
            (record.target.tagName === "LINK" &&
              record.attributeName === "rel" &&
              (record.oldValue === "stylesheet" || record.target.rel === "stylesheet"))
          );
        }
        return (
          (record.target.nodeType === 1 && record.target.matches("style")) ||
          [...record.addedNodes, ...record.removedNodes].some(containsStylesheet)
        );
      });
      if (!styleChanged) return;
      setStyleError(!syncFrameStyles(doc));
    });
    observer.observe(document.head, {
      attributes: true,
      attributeFilter: ["disabled", "href", "media", "rel"],
      attributeOldValue: true,
      characterData: true,
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [mountNode]);

  useEffect(() => {
    if (!mountNode || !autoHeight) return;
    const FrameResizeObserver = mountNode.ownerDocument.defaultView.ResizeObserver;
    const observer = new FrameResizeObserver(() => setContentHeight(mountNode.scrollHeight));
    observer.observe(mountNode);
    return () => observer.disconnect();
  }, [mountNode, autoHeight]);

  useEffect(() => {
    if (!mountNode || !onContentNode) return undefined;
    return onContentNode(mountNode);
  }, [mountNode, onContentNode]);

  useEffect(() => {
    if (iframeRef.current?.contentDocument?.body) {
      iframeRef.current.contentDocument.body.style.backgroundColor = backgroundColor;
    }
  }, [backgroundColor, mountNode]);

  return (
    <div className="relative mx-auto" style={{ width, maxWidth: "100%" }}>
      <iframe
        key={frameVersion}
        ref={iframeRef}
        title={title}
        srcDoc={FRAME_DOC}
        onLoad={handleLoad}
        className="mx-auto block border-0 bg-zinc-950 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ width, maxWidth: "100%", height: autoHeight ? contentHeight : height, backgroundColor }}
      >
        {mountNode && createPortal(children, mountNode)}
      </iframe>
      {!mountNode && !styleError && (
        <div className="absolute inset-0 grid place-items-center bg-zinc-950 text-sm text-zinc-400" role="status" aria-live="polite">
          Loading styled preview…
        </div>
      )}
      {styleError && (
        <div className="absolute inset-0 grid place-items-center bg-zinc-950 px-6 text-center text-sm text-rose-300" role="alert">
          <div>
            <p>Preview styles could not be loaded.</p>
            <button
              type="button"
              onClick={() => {
                setMountNode(null);
                setStyleError(false);
                setFrameVersion((version) => version + 1);
              }}
              className="mt-3 rounded-lg border border-rose-300/30 px-3 py-2 font-semibold transition hover:bg-rose-300/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
            >
              Retry preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
