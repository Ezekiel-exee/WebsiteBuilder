import { memo, useEffect, useRef, useState } from "react";
import { copyToClipboard } from "../../utils/clipboard";
import { useToast } from "./Toast";
import Icon from "./Icon";

function CopyButton({ getCode, label = "Copy Code", successMessage = "Code copied to clipboard!", size = "md" }) {
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const timer = useRef(null);
  const toast = useToast();

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = async () => {
    setCopying(true);
    setCopied(false);
    try {
      const code = await getCode();
      const ok = await copyToClipboard(code);
      if (!ok) {
        toast("Copy failed — your browser blocked clipboard access.", "error");
        return;
      }
      setCopied(true);
      toast(successMessage);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Copy failed — the component source could not be loaded.", "error");
    } finally {
      setCopying(false);
    }
  };

  const sizes = size === "sm" ? "h-8 px-3 text-xs gap-1.5" : "h-9 px-4 text-sm gap-2";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={copying}
      aria-busy={copying}
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg font-semibold transition-all duration-300 ${sizes} ${
        copied
          ? "bg-emerald-500 text-emerald-950 shadow-[0_0_24px_-4px_rgba(16,185,129,0.8)]"
          : "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-[0_0_24px_-8px_rgba(139,92,246,0.9)] hover:brightness-110 active:scale-95 disabled:cursor-wait disabled:opacity-70"
      }`}
    >
      <Icon name={copied ? "check" : "copy"} className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {copied ? "Copied!" : copying ? "Preparing…" : label}
    </button>
  );
}

export default memo(CopyButton);
