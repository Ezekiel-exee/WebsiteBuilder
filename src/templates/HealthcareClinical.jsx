import HealthcareExperience from "../components/sections/HealthcareExperience";

export default function HealthcareClinical() {
  return (
    <main className="bg-white">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <a href="#" className="font-semibold text-slate-900 transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">Northstar <span className="text-sky-700">Health</span></a>
        <nav className="hidden gap-6 text-xs text-slate-600 sm:flex"><a href="#care">Find care</a><a href="#services">Services</a><a href="#patient">For patients</a></nav>
        <a href="#care" className="rounded-full bg-sky-700 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">Book a visit</a>
      </header>
      <section id="services" className="bg-gradient-to-br from-sky-50 to-white px-6 py-14 text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-sky-700 leading-relaxed">Care for every chapter</p><h1 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold text-slate-900 sm:text-5xl leading-tight tracking-tight">Good health starts with a good conversation.</h1><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600">Connect with a care team that listens, supports, and helps you feel your best.</p></section>
      <div id="care"><HealthcareExperience /></div>
      <section id="patient" className="px-6 py-12 text-center"><p className="text-xs text-slate-500 leading-relaxed">Patient resources · Insurance support · Accessible care</p></section>
    </main>
  );
}
