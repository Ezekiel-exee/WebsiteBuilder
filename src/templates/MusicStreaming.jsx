import MusicStreamingExperience from "../components/sections/MusicStreamingExperience";

export default function MusicStreaming() {
  return (
    <main className="min-h-screen bg-[#101014]">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 text-white">
        <a href="#" className="font-bold tracking-[.2em] transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">NOVA<span className="text-fuchsia-300">.FM</span></a>
        <nav className="hidden gap-6 text-xs text-slate-400 sm:flex"><a href="#listen">Listen</a><a href="#tour-dates">Tour</a><a href="#listen">About</a></nav>
        <a href="#tour-dates" className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white hover:border-fuchsia-200 transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">Get tickets</a>
      </header>
      <section className="px-6 py-14 text-center text-white"><p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-200 leading-relaxed">Independent sound · 2026</p><h1 className="mt-4 text-5xl font-semibold sm:text-7xl leading-tight tracking-tight">Stay in the feeling.</h1><p className="mt-4 text-sm text-slate-400 leading-relaxed">New music from Nova June. Take the long way home.</p></section>
      <div id="listen"><MusicStreamingExperience /></div>
      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-slate-500">NOVA.FM · Music for wherever you are</footer>
    </main>
  );
}
