import { useState } from "react";

const CAMPUS_EVENTS = [
  { id: "registration", date: "NOV 12", time: "10:00 AM", type: "Academic", title: "Spring registration opens", place: "Student Portal", color: "bg-indigo-500", attendees: 126 },
  { id: "climate-lecture", date: "NOV 14", time: "5:30 PM", type: "Lecture", title: "Designing a climate-resilient city", place: "Hollis Auditorium", color: "bg-emerald-500", attendees: 84 },
  { id: "falcons-game", date: "NOV 16", time: "1:00 PM", type: "Campus life", title: "Falcons vs. Westlake · Home game", place: "University Field", color: "bg-amber-500", attendees: 312 },
  { id: "scholarship-deadline", date: "NOV 19", time: "All day", type: "Deadline", title: "Scholarship application deadline", place: "Financial Aid Office", color: "bg-rose-500", attendees: 49 },
];

export default function CampusEventAgenda() {
  const [filter, setFilter] = useState("All");
  const [rsvps, setRsvps] = useState([]);
  const events = filter === "All" ? CAMPUS_EVENTS : CAMPUS_EVENTS.filter((e) => e.type === filter);
  const eventDates = (event) => {
    const day = Number(event.date.slice(4));
    if (event.time === "All day") {
      const start = new Date(Date.UTC(2026, 10, day));
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      return { allDay: true, start, end };
    }
    const [clock, period] = event.time.split(" ");
    const [rawHour, minute] = clock.split(":").map(Number);
    const hour = period === "PM" && rawHour < 12 ? rawHour + 12 : period === "AM" && rawHour === 12 ? 0 : rawHour;
    const start = new Date(Date.UTC(2026, 10, day, hour, minute));
    return { allDay: false, start, end: new Date(start.getTime() + 60 * 60 * 1000) };
  };
  const makeCalendarLink = (event) => {
    const dates = eventDates(event);
    const stamp = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const dateStamp = (date) => date.toISOString().slice(0, 10).replace(/-/g, "");
    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", event.title);
    url.searchParams.set("dates", dates.allDay ? `${dateStamp(dates.start)}/${dateStamp(dates.end)}` : `${stamp(dates.start)}/${stamp(dates.end)}`);
    url.searchParams.set("location", event.place);
    return url.toString();
  };
  const downloadCalendarFile = (event) => {
    const dates = eventDates(event);
    const stamp = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const dateStamp = (date) => date.toISOString().slice(0, 10).replace(/-/g, "");
    const escapeText = (value) => value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
    const dateLines = dates.allDay
      ? [`DTSTART;VALUE=DATE:${dateStamp(dates.start)}`, `DTEND;VALUE=DATE:${dateStamp(dates.end)}`]
      : [`DTSTART:${stamp(dates.start)}`, `DTEND:${stamp(dates.end)}`];
    const calendar = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Northstar University//Campus Events//EN",
      "BEGIN:VEVENT",
      `UID:${event.id}@northstar.edu`,
      `DTSTAMP:${stamp(new Date())}`,
      ...dateLines,
      `SUMMARY:${escapeText(event.title)}`,
      `LOCATION:${escapeText(event.place)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([calendar], { type: "text/calendar;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${event.id}.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const toggleRsvp = (eventId) => {
    setRsvps((current) => current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId]);
  };

  return (
    <section className="bg-indigo-50 px-5 py-20">
      <div className="mx-auto max-w-5xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[.2em] text-indigo-700">Campus calendar</p><h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Coming up at Northstar</h2></div><div className="flex flex-wrap gap-2" role="group" aria-label="Filter campus events">{["All", "Academic", "Lecture", "Campus life", "Deadline"].map((item) => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === item ? "bg-indigo-800 text-white" : "bg-white text-slate-600 hover:bg-indigo-100"}`}>{item}</button>)}</div></div>
        <div className="relative mt-9 space-y-4 before:absolute before:bottom-5 before:left-[2.4rem] before:top-5 before:w-px before:bg-indigo-200">{events.map((event) => { const attending = rsvps.includes(event.id); return <article key={event.id} className="relative flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-indigo-900/5 sm:flex-row sm:items-center"><div className="relative z-10 flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-950 text-white"><span className="text-[9px] font-bold">{event.date.split(" ")[0]}</span><span className="text-lg font-bold leading-none">{event.date.split(" ")[1]}</span></div><div className="min-w-0 flex-1"><span className={`inline-block h-2 w-2 rounded-full ${event.color}`} aria-hidden="true" /><span className="ml-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{event.type} · {event.time}</span><h3 className="mt-1 font-semibold text-slate-900">{event.title}</h3><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><span aria-hidden="true">⌖</span>{event.place}</p><p className="mt-1 text-xs text-slate-500" aria-live="polite">{event.attendees + (attending ? 1 : 0)} attending</p></div><div className="flex flex-wrap items-center gap-2 sm:justify-end"><button type="button" aria-pressed={attending} onClick={() => toggleRsvp(event.id)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 ${attending ? "bg-emerald-100 text-emerald-900" : "bg-indigo-800 text-white hover:bg-indigo-700"}`}>{attending ? "Going ✓" : "RSVP"}</button><details className="relative"><summary className="cursor-pointer list-none rounded-lg border border-indigo-200 px-4 py-2 text-center text-sm font-semibold text-indigo-800 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700">＋ Add to calendar</summary><div className="absolute right-0 z-20 mt-2 grid min-w-44 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">        <a href={makeCalendarLink(event)} target="_blank" rel="noopener noreferrer" className="rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50">Google Calendar</a><button type="button" onClick={() => downloadCalendarFile(event)} className="rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50">Download .ics</button></div></details></div></article>; })}</div>
      </div>
    </section>
  );
}
