import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const FRAME_DOC = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#0c0c11"><div id="preview-root" style="display:flow-root"></div></body></html>`;

function syncFrameStyles(doc) {
  doc.head.querySelectorAll("[data-host-style]").forEach((node) => node.remove());
  document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    const clone = node.cloneNode(true);
    clone.setAttribute("data-host-style", "");
    doc.head.appendChild(clone);
  });
}

/**
 * Renders children inside an isolated iframe. Because the iframe has its own viewport,
 * Tailwind's responsive breakpoints (sm:, md:, lg:) react to the simulated device width
 * exactly as they would on a real phone or tablet.
 */
export default function PreviewFrame({ children, width = "100%", height, autoHeight = true, title = "Preview" }) {
  const iframeRef = useRef(null);
  const [mountNode, setMountNode] = useState(null);
  const [contentHeight, setContentHeight] = useState(320);

  const handleLoad = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    syncFrameStyles(doc);
    setMountNode(doc.getElementById("preview-root"));
  };

  // Keep the copied host styles in sync with HMR after the initial pre-mount copy.
  useEffect(() => {
    if (!mountNode) return;
    const doc = mountNode.ownerDocument;
    const observer = new MutationObserver(() => syncFrameStyles(doc));
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [mountNode]);

  useEffect(() => {
    if (!mountNode || !autoHeight) return;
    const FrameResizeObserver = mountNode.ownerDocument.defaultView.ResizeObserver;
    const observer = new FrameResizeObserver(() => setContentHeight(mountNode.scrollHeight));
    observer.observe(mountNode);
    return () => observer.disconnect();
  }, [mountNode, autoHeight]);

  return (
    <iframe
      ref={iframeRef}
      title={title}
      srcDoc={FRAME_DOC}
      onLoad={handleLoad}
      className="mx-auto block border-0 bg-zinc-950 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ width, maxWidth: "100%", height: autoHeight ? contentHeight : height }}
    >
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  );
}
