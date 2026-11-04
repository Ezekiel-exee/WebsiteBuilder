import { useState } from "react";

const API_SANDBOX_SNIPPETS = {
  cURL: [
    "curl https://api.acme.dev/v1/projects \\",
    '  -H "Authorization: YOUR_API_KEY" \\',
    '  -H "Content-Type: application/json" \\',
    `  -d '{"limit": 10}'`,
  ].join("\n"),
  "Node.js": [
    'const response = await fetch("https://api.acme.dev/v1/projects", {',
    '  headers: { Authorization: "YOUR_API_KEY" },',
    "});",
    "const projects = await response.json();",
    "console.log(projects.data);",
  ].join("\n"),
  Python: [
    "import requests",
    "",
    'response = requests.get("https://api.acme.dev/v1/projects",',
    '    headers={"Authorization": "YOUR_API_KEY"})',
    "projects = response.json()",
    'print(projects["data"])',
  ].join("\n"),
  Go: [
    'request, _ := http.NewRequest("GET",',
    '    "https://api.acme.dev/v1/projects", nil)',
    'request.Header.Set("Authorization", "YOUR_API_KEY")',
    "response, err := http.DefaultClient.Do(request)",
    "if err != nil { log.Fatal(err) }",
    "defer response.Body.Close()",
  ].join("\n"),
};

export default function ApiCodeSandbox() {
  const [language, setLanguage] = useState("Node.js");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const code = API_SANDBOX_SNIPPETS[language];
  const lines = code.split("\n");
  const highlightApiLine = (line) => {
    const tokens = line.split(/(https?:\/\/\S+|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:await|const|import|from|if|return|var|let|func|defer|nil|true|false)\b|\b\d+(?:\.\d+)?\b)/g);
    return tokens.map((token, index) => {
      if (!token) return null;
      const tone = /^https?:\/\//.test(token)
        ? "text-sky-300"
        : /^(["'])/.test(token)
          ? "text-amber-200"
          : /^\d/.test(token)
            ? "text-fuchsia-300"
            : /^(await|const|import|from|if|return|var|let|func|defer|nil|true|false)$/.test(token)
              ? "text-violet-300"
              : "text-slate-300";
      return <span key={index} className={tone}>{token}</span>;
    });
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopied(false);
      setCopyError("Clipboard access is unavailable in this browser.");
    }
  };

  return (
    <section className="bg-[#080b12] px-6 py-20 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.2em] text-cyan-300 leading-relaxed">Built for builders</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl leading-tight">One API. Your language.</h2>
            <p className="mt-4 leading-relaxed text-slate-400">Start with a working request, switch languages, and take the snippet with you.</p>
            <div className="mt-6 flex items-center gap-2 text-xs text-emerald-300"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> API operational · 42 ms</div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d111b] shadow-xl shadow-cyan-950/20">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-4 py-4">
              <div role="tablist" aria-label="Code language" className="flex flex-wrap gap-2">
                {Object.keys(API_SANDBOX_SNIPPETS).map((item) => (
                  <button key={item} type="button" role="tab" aria-selected={language === item} onClick={() => { setLanguage(item); setCopied(false); }} className={`rounded-lg px-3 py-2 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${language === item ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-200"}`}>
                    {item}
                  </button>
                ))}
              </div>
              <button type="button" onClick={copyCode} className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-300/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 transition-all duration-200 ease-out focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
                {copied ? "Copied!" : "Copy snippet"}
              </button>
            </div>
            <pre className="overflow-x-auto p-4 text-xs leading-6 sm:p-6 sm:text-sm" aria-label={`${language} API example`}>
              <code>
                {lines.map((line, index) => (
                  <span key={`${language}-${index}`} className={`block min-w-max rounded px-2 ${index === 1 ? "bg-cyan-300/[.08]" : ""}`}>
                    <span aria-hidden="true" className="mr-6 inline-block w-5 select-none text-right text-slate-600">{String(index + 1).padStart(2, "0")}</span>{line ? highlightApiLine(line) : " "}
                  </span>
                ))}
              </code>
            </pre>
            {copyError && <p role="status" className="border-t border-white/10 px-6 py-4 text-xs text-rose-300 leading-relaxed">{copyError}</p>}
            <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 text-xs text-slate-500"><span>GET /v1/projects</span><span>200 OK · 42 ms</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
