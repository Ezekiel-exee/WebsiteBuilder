import { useEffect, useRef } from "react";

export function GameFrame({ title, description, status, metrics, onBack, backLabel = "< games", onRestart, canRestart = true, onKeyDown, onKeyUp, controls, children }) {
  const frameRef = useRef(null);
  const restartRef = useRef(null);
  const statusLabel = { ready: "READY", running: "RUNNING", won: "COMPLETED", lost: "GAME OVER" }[status] || status.toUpperCase();
  const statusColor = status === "running" ? "text-emerald-300" : status === "won" ? "text-cyan-300" : status === "lost" ? "text-rose-300" : status === "paused" ? "text-amber-300" : "text-zinc-400";
  useEffect(() => frameRef.current?.focus(), [title]);
  useEffect(() => {
    if (status === "lost") restartRef.current?.focus();
  }, [status]);
  return (
    <div
      ref={frameRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      className="outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
      aria-label={`${title} game area`}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-xs text-zinc-500">
            <span className="text-emerald-400">~/arcade</span><span>/</span><span>{title.toLowerCase().replaceAll(" ", "-")}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
          <p className="mt-1 text-sm text-zinc-400">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} className="rounded-lg border border-white/10 px-3 py-2 font-mono text-xs text-zinc-300 transition hover:border-white/20 hover:bg-white/5">
            {backLabel}
          </button>
          {canRestart && (
            <button type="button" onClick={onRestart} className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 font-mono text-xs text-cyan-200 transition hover:bg-cyan-400/15">
              $ restart
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-3 font-mono text-xs">
        <span className="text-zinc-500">STATUS</span>
        <span className={`font-semibold ${statusColor}`}>{statusLabel}</span>
        <span className="hidden text-zinc-700 sm:inline">|</span>
        {metrics.map((metric) => (
          <span key={metric.label} className="text-zinc-400">
            <span className="text-zinc-600">{metric.label} </span><span className="text-white">{metric.value}</span>
          </span>
        ))}
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="relative min-w-0 overflow-x-auto rounded-xl border border-white/10 bg-[#080a0f] p-3 sm:p-5">
          {children}
          {status === "lost" && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-[#05070b]/75 p-4" role="alertdialog" aria-modal="true" aria-labelledby="arcade-game-over-title">
              <div className="w-full max-w-sm rounded-xl border border-rose-400/30 bg-[#0b0d12] p-6 text-center shadow-2xl shadow-rose-950/40">
                <p className="font-mono text-xs font-semibold tracking-[0.2em] text-rose-300">PROCESS TERMINATED</p>
                <h3 id="arcade-game-over-title" className="mt-2 text-3xl font-bold tracking-tight text-white">Game over</h3>
                {metrics.length > 0 && (
                  <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 text-left font-mono text-xs">
                    {metrics.slice(0, 6).map((metric) => (
                      <div key={metric.label} className="bg-[#0b0d12] px-3 py-2">
                        <dt className="text-[10px] uppercase tracking-wider text-zinc-500">{metric.label}</dt>
                        <dd className="mt-0.5 text-sm font-semibold text-white">{metric.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {canRestart ? (
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <button
                      ref={restartRef}
                      type="button"
                      onClick={onRestart}
                      className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-5 py-2.5 font-mono text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                    >
                      $ restart game
                    </button>
                    <button type="button" onClick={onBack} className="rounded-lg border border-white/10 px-5 py-2.5 font-mono text-sm text-zinc-300 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
                      {backLabel}
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="mt-4 font-mono text-xs text-zinc-400">The host can start a rematch.</p>
                    <button type="button" onClick={onBack} className="mt-4 rounded-lg border border-white/10 px-5 py-2.5 font-mono text-sm text-zinc-300 transition hover:bg-white/5">
                      {backLabel}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        <aside className="rounded-xl border border-white/10 bg-[#0b0d12] p-4">
          <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Controls</p>
          <p className="font-mono text-xs leading-6 text-zinc-400">{controls}</p>
          <div className="mt-4 border-t border-white/10 pt-3 font-mono text-[11px] leading-5 text-zinc-600">
            <p><span className="text-cyan-400">const</span> mode = "local";</p>
            <p><span className="text-cyan-400">const</span> fun = true;</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function useAutomaticLevelAdvance(status, onLevelAdvance) {
  useEffect(() => {
    if (status !== "won") return undefined;
    const timer = window.setTimeout(onLevelAdvance, 1400);
    return () => window.clearTimeout(timer);
  }, [status, onLevelAdvance]);
}

// Press-and-hold touch button (visible below the sm breakpoint only when the parent hides it above).
export function ByteControlButton({ label, onPress, onRelease }) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        onPress();
      }}
      onPointerUp={onRelease}
      onPointerCancel={onRelease}
      className="touch-none select-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-zinc-200 active:border-cyan-300/40 active:bg-cyan-300/10"
    >
      {label}
    </button>
  );
}

// D-pad for grid games. onMove(dx, dy) fires once per tap; onAction is optional.
export function GamePad({ onMove, onAction, actionLabel = "ACTION" }) {
  const base = "touch-manipulation select-none rounded border border-white/10 bg-white/5 py-2 font-mono text-sm text-zinc-200 transition duration-75 active:scale-95";
  return (
    <div className="mt-4 grid w-36 grid-cols-3 gap-1.5 sm:hidden" aria-label="Touch controls">
      <span />
      <button type="button" aria-label="Move up" onClick={() => onMove(0, -1)} className={base}>↑</button>
      <span />
      <button type="button" aria-label="Move left" onClick={() => onMove(-1, 0)} className={base}>←</button>
      {onAction ? (
        <button type="button" aria-label={actionLabel} onClick={onAction} className="rounded border border-cyan-400/20 bg-cyan-400/10 py-2 font-mono text-[9px] text-cyan-200">{actionLabel}</button>
      ) : (
        <span className="grid place-items-center font-mono text-[10px] text-zinc-700">+</span>
      )}
      <button type="button" aria-label="Move right" onClick={() => onMove(1, 0)} className={base}>→</button>
      <span />
      <button type="button" aria-label="Move down" onClick={() => onMove(0, 1)} className={base}>↓</button>
      <span />
    </div>
  );
}
