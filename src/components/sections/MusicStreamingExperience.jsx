import { useEffect, useState } from "react";

const MUSIC_TRACKS = [
  { title: "Glasshouse", length: "3:42" },
  { title: "After the Rain", length: "4:08" },
  { title: "Blue Static", length: "2:56" },
  { title: "Slow Motion", length: "3:31" },
];
const MUSIC_TOUR = [
  { date: "NOV 18", city: "Portland, OR", venue: "Roseland Theater" },
  { date: "NOV 21", city: "San Francisco, CA", venue: "The Fillmore" },
  { date: "NOV 26", city: "Los Angeles, CA", venue: "The Wiltern" },
];

export default function MusicStreamingExperience() {
  const [activeTrack, setActiveTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(31);
  const [queued, setQueued] = useState([]);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setInterval(() => setProgress((value) => value >= 100 ? 0 : value + 1), 650);
    return () => clearInterval(timer);
  }, [playing, activeTrack]);

  const selectTrack = (index) => {
    setActiveTrack(index);
    setProgress(0);
    setPlaying(true);
  };

  return (
    <section className="overflow-hidden bg-[#101014] px-6 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-950 via-slate-900 to-indigo-950 p-6 sm:p-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
            <div className="relative flex items-center gap-6">
              <div className={`grid h-36 w-36 shrink-0 place-items-center rounded-full border-[10px] border-slate-950 bg-[conic-gradient(from_30deg,#e879f9,#312e81,#0f172a,#e879f9)] shadow-xl sm:h-48 sm:w-48 ${playing ? "animate-spin [animation-duration:12s]" : ""}`} aria-label={playing ? "Album disc rotating" : "Album disc stopped"}>
                <div className="grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-slate-950 text-xs uppercase tracking-widest text-fuchsia-100">NOVA</div>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[.25em] text-fuchsia-200 leading-relaxed">New album · 2026</p>
                <h2 className="mt-2 text-3xl font-semibold sm:text-4xl leading-tight tracking-tight">Soft<br />Signals</h2>
                <p className="mt-4 text-xs text-slate-300 leading-relaxed">Nova June · 12 tracks</p>
              </div>
            </div>
            <div className="relative mt-8 rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0"><span className="block truncate text-xs font-semibold">{MUSIC_TRACKS[activeTrack].title}</span><span className="mt-2 block text-xs text-slate-400">{playing ? "Now playing" : "Ready to play"}</span></div>
                <button type="button" onClick={() => setPlaying((current) => !current)} aria-label={playing ? "Pause playback" : "Start playback"} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-fuchsia-300 text-slate-950 transition hover:scale-105">{playing ? "Ⅱ" : "▶"}</button>
              </div>
              <button type="button" onClick={() => setProgress((value) => Math.min(value + 10, 100))} aria-label="Seek forward on audio waveform" className="mt-4 flex h-12 w-full items-center gap-[3px] overflow-hidden">
                {Array.from({ length: 42 }, (_, index) => {
                  const height = 18 + ((index * 17 + 11) % 70);
                  return <span key={index} className={`flex-1 rounded-full transition-colors ${index < progress * 0.42 ? "bg-fuchsia-300" : "bg-white/20"}`} style={{ height: `${height}%` }} />;
                })}
              </button>
              <div className="mt-2 flex justify-between font-mono text-xs text-slate-500"><span>{Math.floor(progress * 2.22 / 60)}:{String(Math.floor(progress * 2.22 % 60)).padStart(2, "0")}</span><span>{MUSIC_TRACKS[activeTrack].length}</span></div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.24em] text-slate-500 leading-relaxed">The tracklist</p><h3 className="mt-2 text-2xl font-semibold leading-tight tracking-tight">Soft Signals</h3></div><span className="text-xs text-slate-500">2026 · Alt pop</span></div>
            <ol className="mt-6 divide-y divide-white/10">
              {MUSIC_TRACKS.map((track, index) => (
                <li key={track.title} className="flex items-center gap-4 py-4 leading-relaxed">
                  <span className="w-5 font-mono text-xs text-slate-500">{String(index + 1).padStart(2, "0")}</span>
                  <button type="button" onClick={() => selectTrack(index)} aria-current={activeTrack === index ? "true" : undefined} className={`min-w-0 flex-1 truncate text-left text-xs font-medium ${activeTrack === index ? "text-fuchsia-200" : "text-slate-300 hover:text-white"}`}>{track.title}</button>
                  <span className="font-mono text-xs text-slate-500">{track.length}</span>
                  <button type="button" onClick={() => setQueued((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])} aria-label={queued.includes(index) ? `Remove ${track.title} from queue` : `Add ${track.title} to queue`} className="grid h-7 w-7 place-items-center rounded-full border border-white/10 text-xs text-slate-400 hover:border-fuchsia-300/50 hover:text-fuchsia-200">{queued.includes(index) ? "✓" : "+"}</button>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-slate-500 leading-relaxed">Queue · {queued.length} {queued.length === 1 ? "track" : "tracks"}</p>
            <div className="mt-6 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500 leading-relaxed">On the road</p><h3 className="mt-2 text-lg font-semibold leading-tight tracking-tight">Live dates</h3></div><a href="#tour-dates" className="text-xs font-semibold text-fuchsia-200 hover:text-white transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">All dates →</a></div>
              <ul id="tour-dates" className="mt-4 space-y-2">
                {MUSIC_TOUR.map((event) => <li key={event.city} className="flex items-center gap-4 rounded-xl bg-white/[0.04] p-4 leading-relaxed"><span className="w-12 text-xs font-bold text-fuchsia-200">{event.date}</span><span className="min-w-0 flex-1"><span className="block text-xs font-medium">{event.city}</span><span className="block text-xs text-slate-500">{event.venue}</span></span><a href={`mailto:tickets@example.com?subject=${encodeURIComponent(`Tickets ${event.city}`)}`} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold hover:border-fuchsia-200 hover:text-fuchsia-100 transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">Tickets</a></li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
