import SmartHomeExperience from "../components/sections/SmartHomeExperience";

export default function SmartHomeAppliances() {
  return (
    <main className="min-h-screen bg-[#0d1218]">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 text-white">
        <a href="#" className="font-semibold transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">Hearth<span className="text-lime-300">OS</span></a>
        <nav className="hidden gap-6 text-xs text-slate-400 sm:flex"><a href="#controls">Home controls</a><a href="#devices">Devices</a><a href="#energy">Energy</a></nav>
        <a href="#devices" className="rounded-full bg-lime-300 px-4 py-2 text-xs font-semibold text-slate-950 transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">Explore devices</a>
      </header>
      <section className="px-6 py-14 text-center text-white"><p className="text-xs font-bold uppercase tracking-[.25em] text-lime-300 leading-relaxed">A little more in tune</p><h1 className="mt-4 text-4xl font-semibold sm:text-6xl leading-tight tracking-tight">Comfort that thinks ahead.</h1><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400">Simple smart-home controls, considered appliances, and everyday energy insights.</p></section>
      <div id="controls"><SmartHomeExperience /></div>
      <section id="devices" className="px-6 py-10 text-center text-xs text-slate-500">Thoughtful devices · Clear energy insights · One connected home</section>
    </main>
  );
}
