export default function LoadingSkeleton({ label = "Loading preview", className = "" }) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`min-h-72 animate-pulse space-y-5 rounded-xl bg-zinc-900/80 p-6 ${className}`}
    >
      <span className="sr-only">{label}</span>
      <div className="h-4 w-28 rounded bg-white/10" />
      <div className="h-8 w-2/3 rounded bg-white/10" />
      <div className="h-4 w-5/6 rounded bg-white/10" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="h-28 rounded-xl bg-white/10" />
        <div className="h-28 rounded-xl bg-white/10" />
      </div>
    </div>
  );
}
