import { useEffect, useRef, useState } from "react";

const CAMPUS_ALERTS_STORAGE_KEY = "blocksmith-campus-alert-dismissed";
const CAMPUS_ALERTS = [
  { id: "weather-safety", severity: "Red", level: "Emergency", text: "Severe weather notice · shelter in place until 2:30 PM", detail: "Move indoors, stay away from exterior windows, and follow instructions from campus safety staff. Updates will be posted here.", tone: "border-rose-300/30 bg-rose-950 text-rose-50", badge: "bg-rose-300 text-rose-950" },
  { id: "admissions-deadline", severity: "Yellow", level: "Admissions", text: "Fall application priority deadline · December 1", detail: "Submit your application and supporting documents by December 1 to be considered for priority review.", tone: "border-amber-300/30 bg-amber-950 text-amber-50", badge: "bg-amber-300 text-amber-950" },
  { id: "library-hours", severity: "Green", level: "Campus update", text: "North library extended hours begin this week", detail: "The North Library will remain open until midnight Sunday through Thursday during exam preparation.", tone: "border-emerald-300/30 bg-emerald-950 text-emerald-50", badge: "bg-emerald-300 text-emerald-950" },
];

export default function CampusAlertTicker() {
  const alertRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(null);

  useEffect(() => {
    const storage = alertRef.current?.ownerDocument.defaultView?.localStorage;
    const dismissed = CAMPUS_ALERTS
      .filter((alert) => storage?.getItem(`${CAMPUS_ALERTS_STORAGE_KEY}:${alert.id}`) === "true")
      .map((alert) => alert.id);
    setDismissedIds(dismissed);
  }, []);

  const visibleAlerts = dismissedIds === null ? [] : CAMPUS_ALERTS.filter((alert) => !dismissedIds.includes(alert.id));
  const activeIndex = visibleAlerts.length ? index % visibleAlerts.length : 0;
  const alert = visibleAlerts[activeIndex];

  const dismissAlert = () => {
    if (!alert) return;
    const storage = alertRef.current?.ownerDocument.defaultView?.localStorage;
    storage?.setItem(`${CAMPUS_ALERTS_STORAGE_KEY}:${alert.id}`, "true");
    setDismissedIds((current) => [...(current || []), alert.id]);
    setIndex((current) => Math.max(0, Math.min(current, visibleAlerts.length - 2)));
    setExpanded(false);
  };

  const restoreAlerts = () => {
    const storage = alertRef.current?.ownerDocument.defaultView?.localStorage;
    CAMPUS_ALERTS.forEach((item) => storage?.removeItem(`${CAMPUS_ALERTS_STORAGE_KEY}:${item.id}`));
    setDismissedIds([]);
    setIndex(0);
  };

  const moveAlert = (direction) => {
    if (visibleAlerts.length < 2) return;
    setIndex((current) => (current + direction + visibleAlerts.length) % visibleAlerts.length);
    setExpanded(false);
  };

  return (
    <section ref={alertRef} aria-live="polite" className="bg-indigo-950 text-white">
      {dismissedIds === null ? (
        <p className="mx-auto max-w-7xl px-5 py-4 text-sm text-indigo-200">Loading campus announcements…</p>
      ) : alert ? (
        <>
          <div className={`mx-auto flex max-w-7xl flex-wrap items-center gap-3 border-b px-5 py-3 ${alert.tone}`}>
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${alert.badge}`}>{alert.severity} · {alert.level}</span>
            <p className="min-w-0 flex-1 text-sm font-medium">{alert.text}</p>
            <button type="button" onClick={() => setExpanded((current) => !current)} aria-expanded={expanded} className="text-sm font-semibold underline underline-offset-4 hover:text-white">{expanded ? "Close details" : "Details"}</button>
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Previous announcement" onClick={() => moveAlert(-1)} disabled={visibleAlerts.length < 2} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10 disabled:opacity-40">‹</button>
              <button type="button" aria-label="Next announcement" onClick={() => moveAlert(1)} disabled={visibleAlerts.length < 2} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10 disabled:opacity-40">›</button>
            </div>
            <button type="button" aria-label={`Dismiss ${alert.level} announcement`} onClick={dismissAlert} className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/10">Dismiss</button>
          </div>
          {expanded && <div className="border-b border-white/10 bg-indigo-900/60"><p className="mx-auto max-w-7xl px-5 py-4 text-sm leading-relaxed text-indigo-100">{alert.detail}</p></div>}
        </>
      ) : (
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p className="text-sm text-indigo-200">No active campus announcements.</p>
          {dismissedIds.length > 0 && <button type="button" onClick={restoreAlerts} className="text-sm font-semibold underline underline-offset-4 hover:text-white">Restore dismissed alerts</button>}
        </div>
      )}
    </section>
  );
}
