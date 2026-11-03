import { useEffect, useRef, useState } from "react";

const VIRTUAL_TOUR_ROOMS = [
  { id: "living", name: "Living room", image: "https://picsum.photos/seed/tour-living/1600/900", hotspots: [{ x: 27, y: 58, title: "Conversation area", detail: "Open-plan seating · garden views" }, { x: 72, y: 36, title: "Window wall", detail: "Full-height natural light" }] },
  { id: "kitchen", name: "Kitchen", image: "https://picsum.photos/seed/tour-kitchen/1600/900", hotspots: [{ x: 34, y: 54, title: "Chef's island", detail: "Quartz countertop · seating for four" }, { x: 72, y: 40, title: "Appliance suite", detail: "Integrated induction range" }] },
  { id: "bedroom", name: "Primary suite", image: "https://picsum.photos/seed/tour-bedroom/1600/900", hotspots: [{ x: 30, y: 50, title: "Sleeping area", detail: "Quiet garden-facing orientation" }, { x: 76, y: 65, title: "Walk-in closet", detail: "Built-in storage and dressing space" }] },
  { id: "patio", name: "Garden patio", image: "https://picsum.photos/seed/tour-patio/1600/900", hotspots: [{ x: 28, y: 58, title: "Outdoor dining", detail: "Covered patio with room to gather" }, { x: 75, y: 42, title: "Garden access", detail: "Private landscaped outdoor space" }] },
];

export default function VirtualTourShowcase({ embedUrl = "", roomUrls = {} }) {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(null);
  const [roomIndex, setRoomIndex] = useState(0);
  const [showLead, setShowLead] = useState(false);
  const [sent, setSent] = useState(false);
  const frame = useRef(null);
  const room = VIRTUAL_TOUR_ROOMS[roomIndex];
  const activeEmbedUrl = roomUrls[room.id] || embedUrl;

  useEffect(() => {
    const frameWindow = sectionRef.current?.ownerDocument.defaultView;
    if (!frameWindow) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowLead(false);
        setActive(null);
      }
    };
    frameWindow.addEventListener("keydown", handleKeyDown);
    return () => frameWindow.removeEventListener("keydown", handleKeyDown);
  }, []);

  const goFullscreen = async () => {
    if (!frame.current) return;
    const ownerDocument = frame.current.ownerDocument;
    if (ownerDocument.fullscreenElement) await ownerDocument.exitFullscreen();
    else await frame.current.requestFullscreen?.();
  };

  return (
    <section ref={sectionRef} className="bg-slate-950 px-5 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-sm font-semibold uppercase tracking-[.2em] text-cyan-300">Take a closer look</p><h2 className="mt-2 text-3xl font-bold sm:text-4xl">Walk through before you walk in</h2></div><button type="button" onClick={() => setShowLead(true)} className="rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200">Book a private tour</button></div>
        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Tour rooms">
          {VIRTUAL_TOUR_ROOMS.map((item, index) => <button key={item.id} type="button" role="tab" aria-selected={roomIndex === index} onClick={() => { setRoomIndex(index); setActive(null); }} className={`rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${roomIndex === index ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-white/15 text-slate-300 hover:bg-white/10"}`}>{item.name}</button>)}
        </div>
        <div ref={frame} className="relative mt-8 aspect-[16/8] min-h-72 overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
          {activeEmbedUrl ? (
            <iframe
              title="360-degree home tour"
              src={activeEmbedUrl}
              allow="fullscreen; gyroscope; accelerometer"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <img src={room.image} alt={`${room.name} virtual tour preview`} className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1.5 text-xs backdrop-blur">360° TOUR PREVIEW · {String(roomIndex + 1).padStart(2, "0")} / {VIRTUAL_TOUR_ROOMS.length} · {room.name}</div>
          <button type="button" onClick={goFullscreen} aria-label="Toggle full screen" className="absolute right-4 top-4 rounded-lg bg-black/55 p-3 backdrop-blur hover:bg-black/75">⛶</button>
          {room.hotspots.map((spot, i) => <div key={spot.title} className="absolute" style={{ left: `${spot.x}%`, top: `${spot.y}%` }}><button type="button" aria-label={`Tour detail: ${spot.title}`} aria-expanded={active === i} onClick={() => setActive(active === i ? null : i)} className="grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-cyan-400 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,.8)] transition hover:scale-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">+</button>{active === i && <div role="status" className="absolute left-5 top-0 z-10 w-52 rounded-xl bg-slate-950/90 p-3 text-left shadow-xl backdrop-blur"><p className="text-sm font-semibold">{spot.title}</p><p className="mt-1 text-xs text-slate-300">{spot.detail}</p></div>}</div>)}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5"><p className="text-sm text-white/80">2417 Oak Knoll Dr · Austin, TX</p><button type="button" onClick={() => setShowLead(true)} className="rounded-lg bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/25">Ask about this home</button></div>
        </div>
      </div>
      {showLead && <div role="presentation" className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowLead(false); }}><form role="dialog" aria-modal="true" aria-labelledby="tour-lead-title" className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-2xl" onSubmit={(event) => { event.preventDefault(); setSent(true); }}><div className="flex justify-between"><h3 id="tour-lead-title" className="text-xl font-bold">Talk to a local agent</h3><button type="button" aria-label="Close" onClick={() => setShowLead(false)}>✕</button></div>{sent ? <p role="status" className="mt-6 rounded-xl bg-emerald-50 p-4 text-emerald-800">Thanks — your request is ready for an agent to follow up.</p> : <><p className="mt-2 text-sm text-slate-500">Request details about this property or arrange a viewing.</p><label className="sr-only" htmlFor="tour-lead-name">Your name</label><input id="tour-lead-name" required placeholder="Your name" className="mt-5 w-full rounded-lg border p-3" /><label className="sr-only" htmlFor="tour-lead-email">Email address</label><input id="tour-lead-email" required type="email" placeholder="Email address" className="mt-3 w-full rounded-lg border p-3" /><button type="submit" className="mt-4 w-full rounded-lg bg-emerald-700 py-3 font-semibold text-white">Send request</button></>}</form></div>}
    </section>
  );
}
