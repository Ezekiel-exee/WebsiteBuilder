import { useEffect, useRef, useState } from "react";

const AI_COMMAND_PROMPTS = [
  { category: "Write", prompt: "Draft a launch email for our new product" },
  { category: "Analyze", prompt: "Summarize the top trends in this report" },
  { category: "Build", prompt: "Create a responsive pricing page" },
  { category: "Research", prompt: "Compare the leading tools in this space" },
];

export default function AiCommandBar() {
  const sectionRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [answer, setAnswer] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const categories = ["All", ...new Set(AI_COMMAND_PROMPTS.map((item) => item.category))];
  const suggestions = AI_COMMAND_PROMPTS.filter(
    (item) => (filter === "All" || item.category === filter) && item.prompt.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const frameWindow = sectionRef.current?.ownerDocument.defaultView;
    if (!frameWindow) return undefined;
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === "Escape") setOpen(false);
    };
    frameWindow.addEventListener("keydown", handleShortcut);
    return () => {
      frameWindow.removeEventListener("keydown", handleShortcut);
      if (timerRef.current) frameWindow.clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const submitPrompt = (prompt = query) => {
    if (!prompt.trim()) return;
    setQuery(prompt);
    setAnswer("");
    setStreaming(true);
    const frameWindow = sectionRef.current?.ownerDocument.defaultView;
    if (!frameWindow) return;
    const response = `Here is a starting point for “${prompt.trim()}”. Refine the direction, audience, and constraints to make the result your own.`;
    let position = 0;
    if (timerRef.current) frameWindow.clearInterval(timerRef.current);
    timerRef.current = frameWindow.setInterval(() => {
      position += 4;
      setAnswer(response.slice(0, position));
      if (position >= response.length) {
        frameWindow.clearInterval(timerRef.current);
        timerRef.current = null;
        setStreaming(false);
      }
    }, 18);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "ArrowDown" && suggestions.length) {
      event.preventDefault();
      setActiveSuggestion((index) => (index + 1) % suggestions.length);
    }
    if (event.key === "ArrowUp" && suggestions.length) {
      event.preventDefault();
      setActiveSuggestion((index) => (index - 1 + suggestions.length) % suggestions.length);
    }
    if (event.key === "Enter") {
      event.preventDefault();
      submitPrompt(suggestions[activeSuggestion]?.prompt || query);
    }
  };

  return (
    <section ref={sectionRef} className="bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[.2em] text-violet-300 leading-relaxed">A better starting point</p>
        <h2 className="mt-4 text-3xl font-bold sm:text-5xl leading-tight tracking-tight">Make space for your next idea</h2>
        <p className="mt-4 text-slate-400 leading-relaxed">Open a focused workspace for prompts, research, and quick actions.</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mx-auto mt-8 flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-4 text-left shadow-2xl shadow-violet-950/30 transition hover:border-violet-300/50 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"
          aria-haspopup="dialog"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-400/15 text-violet-200" aria-hidden="true">✦</span>
          <span className="flex-1 text-sm text-slate-300">Ask, search, or create anything…</span>
          <kbd className="rounded-md border border-white/10 bg-slate-950 px-2 py-2 text-xs text-slate-400">⌘ K</kbd>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/75 px-4 pt-[12vh] backdrop-blur-md"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-command-title"
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-xl shadow-black/50"
          >
            <h3 id="ai-command-title" className="sr-only leading-tight tracking-tight">AI command palette</h3>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitPrompt(suggestions[activeSuggestion]?.prompt || query);
              }}
              className="flex items-center gap-3 border-b border-white/10 px-4"
            >
              <span className="text-violet-300" aria-hidden="true">✦</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveSuggestion(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Ask a question or describe a task…"
                aria-label="Prompt or search"
                className="min-w-0 flex-1 bg-transparent py-5 text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button type="submit" className="rounded-lg bg-violet-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-violet-300 transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
                Run
              </button>
            </form>

            <div className="flex gap-2 overflow-x-auto border-b border-white/5 px-4 py-4" aria-label="Prompt categories">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={filter === category}
                  onClick={() => {
                    setFilter(category);
                    setActiveSuggestion(0);
                  }}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition ${
                    filter === category ? "bg-violet-300/15 text-violet-200" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="max-h-64 overflow-y-auto p-2">
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-500 leading-relaxed">Suggested prompts</p>
              {suggestions.map((item, index) => (
                <button
                  key={item.prompt}
                  type="button"
                  onClick={() => submitPrompt(item.prompt)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition ${
                    index === activeSuggestion ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span>{item.prompt}</span>
                  <span className="ml-4 text-xs text-slate-500">{item.category}</span>
                </button>
              ))}
              {!suggestions.length && <p className="px-4 py-6 text-sm text-slate-500 leading-relaxed">No matching prompts. Press Enter to ask your own.</p>}
            </div>

            {(answer || streaming) && (
              <div className="border-t border-white/10 bg-violet-400/[.06] p-4" aria-live="polite">
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-200 leading-relaxed">Draft response</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{answer}{streaming && <span className="animate-pulse">▍</span>}</p>
              </div>
            )}
            <div className="flex justify-between border-t border-white/5 px-4 py-4 text-xs text-slate-500">
              <span>↑↓ navigate · Enter run · Esc close</span>
              <button type="button" onClick={() => setOpen(false)} className="hover:text-white">Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
