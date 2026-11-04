import { useEffect, useRef, useState } from "react";

const CASE_STUDY_RESULTS = [
  { metric: "+42%", label: "Trial-to-paid conversion" },
  { metric: "−31%", label: "Support requests" },
  { metric: "2.4×", label: "Feature adoption" },
];
const CASE_STUDY_QUOTE = "The team didn't just redesign our product — they helped us understand what our customers needed next.";

export default function CaseStudyHighlight() {
  const [playing, setPlaying] = useState(false);
  const [audioMessage, setAudioMessage] = useState("");
  const speech = useRef(null);

  useEffect(() => () => {
    if (typeof window !== "undefined" && window.speechSynthesis && speech.current) window.speechSynthesis.cancel();
  }, []);

  const toggleAudio = () => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setAudioMessage("Audio playback is not supported in this browser.");
      return;
    }
    if (playing) {
      window.speechSynthesis.cancel();
      speech.current = null;
      setPlaying(false);
      setAudioMessage("Playback paused.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(CASE_STUDY_QUOTE);
    utterance.onend = () => {
      setPlaying(false);
      setAudioMessage("Testimonial finished.");
    };
    utterance.onerror = () => {
      setPlaying(false);
      setAudioMessage("Unable to play this testimonial.");
    };
    speech.current = utterance;
    setAudioMessage("Playing synthesized testimonial audio.");
    setPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="bg-white px-6 py-20"><div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center"><div><p className="text-sm font-semibold uppercase tracking-[.2em] text-violet-700 leading-relaxed">Client story · Orbit Commerce</p><h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl leading-tight">A smoother path from discovery to checkout</h2><p className="mt-6 leading-relaxed text-slate-600">We partnered with Orbit to simplify a fragmented shopping journey. Research, a refreshed design system, and a faster storefront turned friction into measurable growth.</p><div className="mt-8 grid grid-cols-3 gap-4">{CASE_STUDY_RESULTS.map((item) => <div key={item.label} className="rounded-xl bg-slate-50 p-4"><p className="text-2xl font-bold text-violet-800 leading-relaxed">{item.metric}</p><p className="mt-2 text-xs leading-snug text-slate-500">{item.label}</p></div>)}</div><blockquote className="mt-8 border-l-4 border-violet-400 pl-6 text-lg leading-relaxed text-slate-700">“{CASE_STUDY_QUOTE}”<footer className="mt-4 text-sm font-semibold text-slate-900">Jordan Lee <span className="font-normal text-slate-500">· VP of Product, Orbit</span></footer></blockquote></div>
      <div className="relative min-h-[420px] overflow-hidden rounded-3xl bg-slate-950"><img src="https://picsum.photos/seed/casestudy-orbit/1000/900" alt="Orbit Commerce product case study" className="absolute inset-0 h-full w-full object-cover opacity-70" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" /><button type="button" onClick={toggleAudio} aria-label={playing ? "Pause client testimonial" : "Play client testimonial"} className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-white/20 text-2xl text-white backdrop-blur hover:scale-[1.02] transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">{playing ? "Ⅱ" : "▶"}</button><div className="absolute inset-x-0 bottom-0 p-6 text-white"><p className="text-xs font-semibold uppercase tracking-widest text-white/70 leading-relaxed">Client testimonial · synthesized audio</p><p className="mt-2 text-xl font-semibold leading-relaxed">{playing ? "Playing Jordan's testimonial…" : "Hear the story from Jordan"}</p><div className="mt-4 flex h-5 items-center gap-2" aria-hidden="true">{[2, 4, 3, 5, 2, 4, 3, 5, 2, 4, 3, 5, 2, 4].map((height, index) => <span key={index} className={`w-1 rounded-full bg-violet-300 transition-all ${playing ? "animate-pulse" : ""}`} style={{ height: `${height * 4}px`, animationDelay: `${index * 70}ms` }} />)}</div><p role="status" className="mt-2 text-xs text-white/70 leading-relaxed">{audioMessage || "Press play to hear a synthesized voice preview."}</p></div></div>
      </div></section>
  );
}
