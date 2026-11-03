import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const show = useCallback((message, tone = "success") => {
    clearTimeout(timer.current);
    setToast({ message, tone, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4" aria-live="polite">
        {toast && (
          <div
            key={toast.id}
            className={`toast-in flex items-center gap-3 rounded-full border px-5 py-3 text-sm font-medium shadow-2xl backdrop-blur-xl ${
              toast.tone === "error"
                ? "border-rose-500/30 bg-rose-950/90 text-rose-100"
                : "border-emerald-400/30 bg-zinc-900/90 text-white"
            }`}
          >
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                toast.tone === "error" ? "bg-rose-500 text-white" : "bg-emerald-400 text-emerald-950"
              }`}
            >
              {toast.tone === "error" ? "!" : "✓"}
            </span>
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
