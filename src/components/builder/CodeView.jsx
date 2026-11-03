import { useMemo } from "react";

const TOKEN =
  /(\/\*[\s\S]*?\*\/|\{\/\*[\s\S]*?\*\/\}|\/\/[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(<\/?[A-Za-z][\w.]*|\/?>)|\b(import|from|export|default|function|return|const|let|var|if|else|for|while|new|typeof|async|await|of|in)\b|\b(true|false|null|undefined)\b|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_$][\w$]*)(?=\s*\()|\b([a-zA-Z-]+)(?==)/g;

const CLASSES = ["text-zinc-500 italic", "text-emerald-300", "text-sky-400", "text-fuchsia-400", "text-orange-300", "text-amber-300", "text-cyan-300", "text-violet-300"];

function highlight(code) {
  const parts = [];
  let last = 0;
  for (const match of code.matchAll(TOKEN)) {
    if (match.index > last) parts.push(code.slice(last, match.index));
    const group = match.slice(1).findIndex((g) => g !== undefined);
    parts.push(
      <span key={match.index} className={CLASSES[group]}>
        {match[0]}
      </span>
    );
    last = match.index + match[0].length;
  }
  parts.push(code.slice(last));
  return parts;
}

export default function CodeView({ code, maxHeight = "38rem" }) {
  const highlighted = useMemo(() => highlight(code), [code]);
  const lineCount = useMemo(() => code.split("\n").length, [code]);

  return (
    <div className="code-scroll overflow-auto bg-[#0b0b10]" style={{ maxHeight }}>
      <div className="flex min-w-max font-mono text-[13px] leading-6">
        <div aria-hidden="true" className="sticky left-0 select-none border-r border-white/5 bg-[#0b0b10] px-4 py-5 text-right text-zinc-600">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="px-5 py-5 text-zinc-200">
          <code>{highlighted}</code>
        </pre>
      </div>
    </div>
  );
}
