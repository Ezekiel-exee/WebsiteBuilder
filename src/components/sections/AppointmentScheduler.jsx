import { useMemo, useState } from "react";

const APPOINTMENT_TIME_SLOTS = ["9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", "3:00 PM", "4:30 PM"];

export default function AppointmentScheduler() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const dates = useMemo(() => Array.from({ length: 10 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    return date;
  }), []);
  const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const submit = (event) => {
    event.preventDefault();
    if (selectedDate && selectedTime && name.trim() && email.includes("@")) setConfirmed(true);
  };

  return (
    <section className="bg-slate-50 px-5 py-20"><div className="mx-auto max-w-5xl"><div className="text-center"><p className="text-sm font-semibold uppercase tracking-[.2em] text-cyan-800">Let&apos;s find a time</p><h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Book a conversation</h2><p className="mt-3 text-slate-500">Choose a time for a 30-minute consultation.</p></div>
      {confirmed ? <div role="status" className="mx-auto mt-10 max-w-xl rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-200"><span className="text-4xl text-emerald-600">✓</span><h3 className="mt-3 text-2xl font-bold text-slate-900">You&apos;re on the calendar</h3><p className="mt-2 text-slate-600">{name}, your appointment is requested for {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} at {selectedTime}. A confirmation will be sent to {email}.</p><button type="button" onClick={() => setConfirmed(false)} className="mt-5 text-sm font-semibold text-cyan-800 underline">Book another time</button></div> : <form onSubmit={submit} className="mt-10 grid gap-8 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8 lg:grid-cols-[1.2fr_.8fr]"><div><h3 className="font-semibold text-slate-900">Select a date</h3><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">{dates.map((date) => { const key = dateKey(date); const active = selectedDate === key; return <button key={key} type="button" onClick={() => { setSelectedDate(key); setSelectedTime(""); }} className={`rounded-xl border p-3 text-left transition ${active ? "border-cyan-700 bg-cyan-50 ring-2 ring-cyan-700/15" : "border-slate-200 hover:border-cyan-400"}`}><span className="block text-xs text-slate-500">{date.toLocaleDateString(undefined, { weekday: "short" })}</span><span className="mt-1 block text-xl font-bold text-slate-900">{date.getDate()}</span><span className="block text-xs text-slate-500">{date.toLocaleDateString(undefined, { month: "short" })}</span></button>; })}</div><h3 className="mt-7 font-semibold text-slate-900">Available times <span className="text-xs font-normal text-slate-500">· your local time</span></h3><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{APPOINTMENT_TIME_SLOTS.map((time) => <button key={time} type="button" disabled={!selectedDate} onClick={() => setSelectedTime(time)} className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${selectedTime === time ? "border-cyan-800 bg-cyan-800 text-white" : "border-slate-200 text-slate-700 hover:border-cyan-500"}`}>{time}</button>)}</div></div>
        <div className="flex flex-col"><h3 className="font-semibold text-slate-900">Your details</h3><label className="mt-4 text-sm text-slate-600">Name<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 block w-full rounded-lg border border-slate-200 p-3 outline-none focus:border-cyan-600" /></label><label className="mt-4 text-sm text-slate-600">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 block w-full rounded-lg border border-slate-200 p-3 outline-none focus:border-cyan-600" /></label><p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{selectedDate && selectedTime ? `${new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric" })} · ${selectedTime}` : "Choose a date and time to continue."}</p><button type="submit" disabled={!selectedDate || !selectedTime} className="mt-auto rounded-xl bg-cyan-800 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40">Confirm appointment</button><p className="mt-3 text-center text-xs text-slate-400">This demo stores no booking data.</p></div></form>}
      </div></section>
  );
}
