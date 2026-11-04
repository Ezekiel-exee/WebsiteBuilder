import { refineSource } from "./customizer";

const REACT_IMPORT = /^import\s*\{([^}]*)\}\s*from\s*["']react["'];?\s*$/m;
const ANY_IMPORT = /^import[\s\S]*?from\s*["'][^"']+["'];?[ \t]*\r?\n/gm;

/**
 * Merges a page template and all of its section components into ONE self-contained file.
 * Each section's `export default function X` becomes a local `function X`, React hook
 * imports are de-duplicated, and the page component remains the default export.
 */
export function bundleTemplate(template, components) {
  const hooks = new Set();
  const blocks = components.map((c) => {
    const refinedCode = refineSource(c.code);
    const match = refinedCode.match(REACT_IMPORT);
    if (match) match[1].split(",").map((s) => s.trim()).filter(Boolean).forEach((h) => hooks.add(h));
    const body = refinedCode
      .replace(ANY_IMPORT, "")
      .replace(/export default function/, "function")
      .trim();
    return `/* ───────────── ${c.name} ───────────── */\n\n${body}`;
  });

  const page = refineSource(template.source).replace(ANY_IMPORT, "").trim();
  const header = hooks.size ? `import { ${[...hooks].sort().join(", ")} } from "react";\n\n` : "";

  return `${header}${blocks.join("\n\n")}\n\n/* ───────────── Page: ${template.name} ───────────── */\n\n${page}\n`;
}
