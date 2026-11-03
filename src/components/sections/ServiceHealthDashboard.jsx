import { useEffect, useRef, useState } from "react";

const SERVICE_HEALTH_NODES = [
  { name: "API Gateway", region: "us-east-1", status: "Operational", ping: "42 ms", tone: "green" },
  { name: "Core Database", region: "us-east-1", status: "Operational", ping: "18 ms", tone: "green" },
  { name: "Job Queue", region: "eu-west-1", status: "Degraded", ping: "284 ms", tone: "yellow" },
  { name: "Webhooks", region: "Global", status: "Incident", ping: "Timeout", tone: "red" },
];

const SERVICE_INCIDENTS = [
  { time: "10:42 UTC", title: "Webhook delivery delays", detail: "Investigating elevated retry volume in the global delivery queue.", kind: "Investigating" },
  { time: "09:18 UTC", title: "Queue latency elevated", detail: "Workers are processing backlog; no data loss detected.", kind: "Monitoring" },
  { time: "Yesterday", title: "API response time returned to normal", detail: "A regional cache issue has been resolved.", kind: "Resolved" },
];

const SERVICE_HISTORY = {
  "24 hours": [42, 44, 40, 43, 45, 41, 48, 42, 39, 43, 46, 41, 44, 42, 40, 43, 41, 45, 42, 40, 44, 43, 41, 42],
  "7 days": [40, 42, 43, 41, 44, 46, 42, 39, 41, 43, 45, 42, 41, 44, 46, 43, 42, 40, 41, 43, 42, 45, 44, 42],
  "30 days": [39, 41, 42, 43, 44, 42, 41, 40, 45, 43, 42, 41, 44, 46, 43, 42, 40, 41, 43, 45, 42, 41, 44, 42],
};

const SERVICE_TONES = {
  green: { dot: "bg-emerald-400", text: "text-emerald-300", ring: "ring-emerald-400/20" },
  yellow: { dot: "bg-amber-400", text: "text-amber-300", ring: "ring-amber-400/20" },
  red: { dot: "bg-rose-400", text: "text-rose-300", ring: "ring-rose-400/20" },
};

export default function ServiceHealthDashboard() {
  const [range, setRange] = useState("24 hours");
  const [incidentFilter, setIncidentFilter] = useState("All");
  const [lastChecked, setLastChecked] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimerRef = useRef(null);
  const activeIncidents = SERVICE_INCIDENTS.filter((incident) => incident.kind !== "Resolved");
  const visibleIncidents = incidentFilter === "All" ? SERVICE_INCIDENTS : SERVICE_INCIDENTS.filter((incident) => incident.kind === incidentFilter);

  useEffect(() => {
    const timer = window.setInterval(() => setLastChecked(new Date()), 60000);
    return () => {
      window.clearInterval(timer);
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    };
  }, []);

  const refresh = () => {
    setRefreshing(true);
    refreshTimerRef.current = window.setTimeout(() => {
      setLastChecked(new Date());
      setRefreshing(false);
      refreshTimerRef.current = null;
    }, 500);
  };

  return (
    <section className="bg-[#080d18] px-5 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.2em] text-cyan-300">Platform status</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Systems at a glance</h2>
            <p className="mt-2 text-sm text-slate-400">Last checked {lastChecked.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          <button type="button" onClick={refresh} disabled={refreshing} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-300/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:opacity-60">
            {refreshing ? "Checking…" : "↻ Refresh"}
          </button>
        </div>

        <div role="status" className="mt-7 flex flex-wrap items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/[.07] p-4">
          <span className="relative grid h-3 w-3 place-items-center"><span className="absolute h-3 w-3 animate-ping rounded-full bg-rose-400/60" /><span className="relative h-2 w-2 rounded-full bg-rose-400" /></span>
          <p className="font-semibold text-rose-100">Some systems are experiencing issues</p>
          <span className="rounded-full bg-rose-300/10 px-2.5 py-1 text-xs text-rose-200">{activeIncidents.length} active incidents</span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_HEALTH_NODES.map((service) => {
            const tone = SERVICE_TONES[service.tone];
            return (
              <article key={service.name} className={`rounded-2xl border border-white/10 bg-white/[.04] p-4 ring-1 ${tone.ring}`}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{service.name}</h3>
                  <span className={`relative h-2.5 w-2.5 rounded-full ${tone.dot}`} aria-label={service.status} title={service.status}>
                    <span className={`absolute inset-0 animate-ping rounded-full ${tone.dot} opacity-40`} />
                  </span>
                </div>
                <p className={`mt-3 text-sm font-medium ${tone.text}`}>{service.status}</p>
                <div className="mt-3 flex justify-between text-xs text-slate-500"><span>{service.region}</span><span>{service.ping}</span></div>
              </article>
            );
          })}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <article className="rounded-2xl border border-white/10 bg-white/[.04] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-sm text-slate-400">Global uptime</p><p className="mt-1 text-4xl font-bold">99.98<span className="text-2xl text-cyan-300">%</span></p></div>
              <div role="group" aria-label="Uptime history range" className="flex rounded-lg bg-white/5 p-1">
                {Object.keys(SERVICE_HISTORY).map((item) => <button key={item} type="button" aria-pressed={range === item} onClick={() => setRange(item)} className={`rounded-md px-2.5 py-1.5 text-[11px] transition ${range === item ? "bg-cyan-300 text-slate-950" : "text-slate-400 hover:text-white"}`}>{item}</button>)}
              </div>
            </div>
            <div className="mt-6 flex h-24 items-end gap-1" role="img" aria-label={`Uptime history over ${range}`}>
              {SERVICE_HISTORY[range].map((value, index) => <span key={`${range}-${index}`} title={`${value} ms average latency`} className={`min-w-0 flex-1 rounded-t-sm ${index === 15 && range === "24 hours" ? "bg-amber-400" : "bg-emerald-400/80"}`} style={{ height: `${Math.min(100, value * 1.8)}%` }} />)}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-slate-500"><span>{range === "24 hours" ? "24h ago" : range === "7 days" ? "7d ago" : "30d ago"}</span><span>Now</span></div>
            <p className="mt-5 flex justify-between border-t border-white/10 pt-4 text-sm"><span className="text-slate-400">Average response</span><strong>42 ms</strong></p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[.04] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h3 className="font-semibold">Incident timeline</h3><p className="mt-1 text-xs text-slate-500">Updates from the operations team</p></div>
              <label className="sr-only" htmlFor="incident-filter">Filter incidents</label>
              <select id="incident-filter" value={incidentFilter} onChange={(event) => setIncidentFilter(event.target.value)} className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-300">
                <option>All</option><option>Investigating</option><option>Monitoring</option><option>Resolved</option>
              </select>
            </div>
            <ol className="mt-5 space-y-4">
              {visibleIncidents.map((incident) => (
                <li key={incident.title} className="relative border-l border-white/10 pl-5">
                  <span className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full ${incident.kind === "Investigating" ? "bg-rose-400" : incident.kind === "Monitoring" ? "bg-amber-400" : "bg-emerald-400"}`} />
                  <div className="flex flex-wrap items-center gap-2"><h4 className="text-sm font-semibold">{incident.title}</h4><span className="text-[10px] text-slate-500">{incident.time}</span></div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{incident.detail}</p>
                </li>
              ))}
              {!visibleIncidents.length && <li className="text-sm text-slate-500">No incidents in this category.</li>}
            </ol>
          </article>
        </div>
      </div>
    </section>
  );
}
