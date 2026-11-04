import { useState } from "react";

const HOME_ROOMS = ["Living room", "Kitchen", "Bedroom"];
const HOME_DEVICES = [
  { id: "lights", name: "Ambient lights", detail: "Color · Warm white", initial: true },
  { id: "climate", name: "Climate control", detail: "Target · 21°", initial: true },
  { id: "blinds", name: "Smart blinds", detail: "Position · 72%", initial: false },
  { id: "speaker", name: "Wireless speaker", detail: "Now playing · Soft jazz", initial: false },
];

export default function SmartHomeExperience() {
  const [room, setRoom] = useState(0);
  const [devices, setDevices] = useState(() => Object.fromEntries(HOME_DEVICES.map((device) => [device.id, device.initial])));
  const [usage, setUsage] = useState(38);

  const toggleDevice = (id) => setDevices((current) => ({ ...current, [id]: !current[id] }));

  return (
    <section className="bg-[#0d1218] px-6 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div><p className="text-xs font-bold uppercase tracking-[.24em] text-lime-300 leading-relaxed">Thoughtful home technology</p><h2 className="mt-4 text-3xl font-semibold sm:text-5xl leading-tight tracking-tight">Your home, in sync.</h2><p className="mt-4 max-w-lg text-sm text-slate-400 leading-relaxed">Room controls, comfortable routines, and energy insights in one calm dashboard.</p></div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs text-emerald-200"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" /> All systems online</div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[.03] p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500 leading-relaxed">Room controls</p><h3 className="mt-2 text-xl font-semibold leading-tight tracking-tight">{HOME_ROOMS[room]}</h3></div>
              <div role="tablist" aria-label="Choose a room" className="flex rounded-full border border-white/10 bg-black/20 p-2">
                {HOME_ROOMS.map((name, index) => <button key={name} type="button" role="tab" aria-selected={room === index} onClick={() => setRoom(index)} className={`rounded-full px-3 py-1.5 text-[10px] transition ${room === index ? "bg-lime-300 text-slate-950" : "text-slate-400 hover:text-white"}`}>{name}</button>)}
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {HOME_DEVICES.map((device) => (
                <article key={device.id} className={`rounded-2xl border p-4 transition ${devices[device.id] ? "border-lime-300/30 bg-lime-300/[.06]" : "border-white/10 bg-black/20"}`}>
                  <div className="flex items-center justify-between gap-4">
                    <span className={`grid h-10 w-10 place-items-center rounded-xl text-lg ${devices[device.id] ? "bg-lime-300/15 text-lime-200" : "bg-white/5 text-slate-500"}`} aria-hidden="true">{device.id === "lights" ? "☼" : device.id === "climate" ? "⌁" : device.id === "blinds" ? "▤" : "♫"}</span>
                    <button type="button" role="switch" aria-checked={devices[device.id]} aria-label={`${device.name} power`} onClick={() => toggleDevice(device.id)} className={`relative h-6 w-11 rounded-full transition ${devices[device.id] ? "bg-lime-300" : "bg-slate-700"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${devices[device.id] ? "left-6" : "left-1"}`} /></button>
                  </div>
                  <h4 className="mt-4 text-sm font-semibold leading-tight tracking-tight">{device.name}</h4>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">{devices[device.id] ? device.detail : "Device is off"}</p>
                </article>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-black/20 px-4 py-4">
              <div><span className="block text-xs font-medium">Evening wind-down</span><span className="mt-2 block text-xs text-slate-500">Dim lights · lower climate · close blinds</span></div>
              <button type="button" onClick={() => setDevices({ lights: true, climate: true, blinds: true, speaker: true })} className="rounded-full border border-lime-300/30 px-3 py-1.5 text-[10px] font-semibold text-lime-200 hover:bg-lime-300/10">Run routine</button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8">
              <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500 leading-relaxed">Energy today</p><h3 className="mt-2 text-xl font-semibold leading-tight tracking-tight">Usage dial</h3></div><span className="text-xs text-lime-300">-12% vs. last week</span></div>
              <div className="mx-auto mt-6 grid h-40 w-40 place-items-center rounded-full border-[10px] border-slate-800" style={{ background: `conic-gradient(#a3e635 ${usage * 3.6}deg, #1e293b ${usage * 3.6}deg)` }}>
                <div className="grid h-28 w-28 place-content-center rounded-full bg-slate-950 text-center"><strong className="font-mono text-3xl">{usage}<span className="text-sm">%</span></strong><span className="mt-2 text-xs uppercase tracking-widest text-slate-500">of daily goal</span></div>
              </div>
              <label className="mt-6 block text-xs text-slate-500">Adjust estimated energy use
                <input type="range" min="5" max="100" value={usage} onChange={(event) => setUsage(Number(event.target.value))} className="mt-2 h-1.5 w-full accent-lime-300" aria-label="Adjust home energy usage" />
              </label>
            </div>
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[.03]">
              <div className="px-6 pt-6"><p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500 leading-relaxed">Device guide</p><h3 className="mt-2 text-lg font-semibold leading-tight tracking-tight">Compare appliances</h3></div>
              <table className="mt-4 w-full text-left text-xs">
                <thead className="border-y border-white/10 text-slate-500"><tr><th className="px-6 py-2 font-medium">Device</th><th className="px-2 py-2 font-medium">Energy</th><th className="px-6 py-2 text-right font-medium">Standby</th></tr></thead>
                <tbody className="divide-y divide-white/5 text-slate-300"><tr><td className="px-6 py-4">Smart thermostat</td><td className="px-2 py-4">A+</td><td className="px-6 py-4 text-right">1.2 W</td></tr><tr><td className="px-6 py-4">LED lighting</td><td className="px-2 py-4">A++</td><td className="px-6 py-4 text-right">0.3 W</td></tr></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
