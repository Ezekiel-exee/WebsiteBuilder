import { useEffect, useRef, useState } from "react";

const TERMINAL_COMMANDS = {
  help: ["Available commands:", "  about     A little about me", "  skills    My toolbox", "  projects  Things I've built", "  contact   How to reach me", "  clear     Clear the terminal"],
  about: ["Hi, I'm Alex Morgan.", "Product-minded engineer crafting", "fast, accessible digital experiences."],
  skills: ["Frontend  React · TypeScript · CSS", "Backend   Node · Postgres · GraphQL", "Design    Figma · prototyping · systems"],
  projects: ["01  Orbit Commerce     orbit.example", "02  Fieldnotes         fieldnotes.example", "03  Tempo Dashboard   tempo.example"],
  contact: ["Email  hello@alexmorgan.dev", "GitHub github.com/alexmorgan", "Let's build something good."],
};

export default function TerminalHero() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([{ command: "whoami", output: ["alexmorgan — creative developer"] }]);
  const [typing, setTyping] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const text = "I build thoughtful digital products, one line at a time.";
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setTyping(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 38);
    return () => clearInterval(timer);
  }, []);

  const run = (event) => {
    event.preventDefault();
    const command = input.trim().toLowerCase();
    if (!command) return;
    const output = command in TERMINAL_COMMANDS ? TERMINAL_COMMANDS[command] : command === "clear" ? [] : [`Command not found: ${command}`, "Type 'help' to see available commands."];
    setHistory((items) => command === "clear" ? [] : [...items, { command, output }]);
    setInput("");
  };

  return (
    <section className="overflow-hidden bg-[#080b12] px-5 py-20 text-slate-100 sm:py-28"><div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[.9fr_1.1fr]"><div><p className="font-mono text-sm text-emerald-400">~/portfolio $ hello</p><h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">Building for the <span className="text-emerald-400">curious.</span></h1><p className="mt-5 min-h-14 max-w-lg text-lg text-slate-400">{typing}<span className="animate-pulse text-emerald-400">▍</span></p><div className="mt-7 flex flex-wrap gap-3"><a href="#projects" className="rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-300">Explore projects</a><a href="mailto:hello@alexmorgan.dev" className="rounded-xl border border-white/15 px-5 py-3 font-semibold hover:bg-white/5">Get in touch</a></div></div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d111b] shadow-2xl shadow-emerald-950/40" onClick={() => inputRef.current?.focus()}><div className="flex items-center gap-2 border-b border-white/10 bg-white/[.03] px-4 py-3"><div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div><span className="ml-2 font-mono text-xs text-slate-500">alex@portfolio: ~</span></div><div className="h-80 overflow-y-auto p-5 font-mono text-xs leading-6 sm:text-sm">{history.map((item, index) => <div key={`${item.command}-${index}`}><p><span className="text-emerald-400">alex@portfolio</span><span className="text-slate-500">:~$ </span><span>{item.command}</span></p>{item.output.map((line, i) => <p key={i} className={line.startsWith("Command not found") ? "text-rose-300" : "text-slate-300"}>{line || " "}</p>)}</div>)}<form onSubmit={run} className="mt-1 flex"><span className="shrink-0 text-emerald-400">alex@portfolio:~$&nbsp;</span><input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} aria-label="Terminal command" autoComplete="off" className="min-w-0 flex-1 bg-transparent text-white outline-none caret-emerald-400" /></form></div><div className="border-t border-white/10 px-5 py-3 text-[11px] text-slate-500">Try <button type="button" onClick={() => { setInput("help"); inputRef.current?.focus(); }} className="text-emerald-400 hover:underline">help</button>, <button type="button" onClick={() => { setInput("skills"); inputRef.current?.focus(); }} className="text-emerald-400 hover:underline">skills</button>, or <button type="button" onClick={() => { setInput("contact"); inputRef.current?.focus(); }} className="text-emerald-400 hover:underline">contact</button> · press Enter</div></div>
      </div></section>
  );
}
