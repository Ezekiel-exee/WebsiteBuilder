import { useEffect, useMemo, useRef, useState } from "react";

const TOKEN =
  /(\/\*[\s\S]*?\*\/|\{\/\*[\s\S]*?\*\/\}|\/\/[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(<\/?[A-Za-z][\w.]*|\/?>)|\b(import|from|export|default|function|return|const|let|var|if|else|for|while|new|typeof|async|await|of|in)\b|\b(true|false|null|undefined)\b|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_$][\w$]*)(?=\s*\()|\b([a-zA-Z-]+)(?==)/g;

const CLASSES = ["text-zinc-500 italic", "text-emerald-300", "text-sky-400", "text-fuchsia-400", "text-orange-300", "text-amber-300", "text-cyan-300", "text-violet-300"];
const GENERAL_SUGGESTIONS = [
  ["useState", "React state hook"],
  ["useEffect", "React effect hook"],
  ["useRef", "Persistent mutable reference"],
  ["useMemo", "Memoized value"],
  ["useCallback", "Memoized callback"],
  ["div", "Generic container element"],
  ["section", "Section element"],
  ["article", "Content element"],
  ["button", "Interactive button"],
  ["className", "Tailwind CSS classes"],
  ["onClick", "Click event handler"],
  ["onChange", "Change event handler"],
  ["aria-label", "Accessible name"],
  ["export default function", "Default React component"],
];
const CLASS_SUGGESTIONS = [
  ["bg-slate-950", "Dark surface"],
  ["bg-white", "Light surface"],
  ["text-white", "High-contrast text"],
  ["text-slate-900", "Primary text"],
  ["text-slate-600", "Supporting text"],
  ["p-4", "16px padding"],
  ["p-6", "24px padding"],
  ["px-4", "Horizontal padding"],
  ["py-2", "Vertical padding"],
  ["gap-4", "16px grid or flex gap"],
  ["rounded-xl", "Large corner radius"],
  ["flex", "Flex layout"],
  ["grid", "Grid layout"],
  ["shadow-xl", "Soft elevation"],
  ["transition-all", "Animated state changes"],
  ["focus-visible:ring-2", "Visible keyboard focus"],
];
const TAILWIND_COLORS = [
  "slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber", "yellow",
  "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet",
  "purple", "fuchsia", "pink", "rose",
];
const TAILWIND_SHADES = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
const SPACING_VALUES = [
  "0", "px", "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "5", "6", "7", "8",
  "9", "10", "11", "12", "14", "16", "20", "24", "28", "32", "36", "40", "44",
  "48", "52", "56", "60", "64", "72", "80", "96",
];
const JSX_ATTRIBUTE_SUGGESTIONS = [
  ["className", "Tailwind utility classes"],
  ["id", "Unique element identifier"],
  ["style", "Inline style object"],
  ["title", "Tooltip text"],
  ["role", "Accessible semantic role"],
  ["type", "Control type"],
  ["href", "Link destination"],
  ["target", "Link target window"],
  ["rel", "Link relationship"],
  ["name", "Form field name"],
  ["value", "Controlled value"],
  ["defaultValue", "Initial value"],
  ["placeholder", "Input hint"],
  ["disabled", "Disable an interactive control"],
  ["autoComplete", "Browser autofill behavior"],
  ["aria-label", "Accessible name"],
  ["aria-live", "Announce dynamic updates"],
  ["aria-pressed", "Toggle button state"],
  ["aria-expanded", "Disclosure state"],
  ["onClick", "Click event handler"],
  ["onChange", "Change event handler"],
].map(([label, detail]) => ({ label, detail }));
const JSX_ATTRIBUTE_VALUES = {
  role: [
    "alert", "alertdialog", "application", "article", "banner", "blockquote", "button", "caption",
    "cell", "checkbox", "code", "columnheader", "combobox", "complementary", "contentinfo",
    "definition", "dialog", "document", "feed", "figure", "form", "grid", "gridcell", "group",
    "heading", "img", "link", "list", "listbox", "listitem", "log", "main", "marquee", "math",
    "menu", "menubar", "menuitem", "menuitemcheckbox", "menuitemradio", "meter", "navigation",
    "none", "note", "option", "presentation", "progressbar", "radio", "radiogroup", "region",
    "row", "rowgroup", "rowheader", "scrollbar", "search", "searchbox", "separator", "slider",
    "spinbutton", "status", "switch", "tab", "table", "tablist", "tabpanel", "term", "textbox",
    "timer", "toolbar", "tooltip", "tree", "treegrid", "treeitem",
  ],
  target: ["_self", "_blank", "_parent", "_top"],
  rel: ["noopener noreferrer", "noreferrer", "nofollow", "author", "external", "help", "license"],
  method: ["get", "post", "dialog"],
  autoComplete: [
    "on", "off", "name", "given-name", "family-name", "email", "username", "current-password",
    "new-password", "organization", "street-address", "postal-code", "tel", "url", "cc-number",
  ],
  "aria-live": ["off", "polite", "assertive"],
  "aria-pressed": ["true", "false", "mixed"],
  "aria-expanded": ["true", "false"],
  "aria-hidden": ["true", "false"],
  "aria-disabled": ["true", "false"],
  "aria-selected": ["true", "false"],
  "aria-checked": ["true", "false", "mixed"],
  "aria-invalid": ["false", "true", "grammar", "spelling"],
  "aria-current": ["false", "true", "page", "step", "location", "date", "time"],
  "aria-haspopup": ["false", "true", "menu", "listbox", "tree", "grid", "dialog"],
  "contentEditable": ["true", "false", "inherit"],
  draggable: ["true", "false"],
  spellCheck: ["true", "false"],
  wrap: ["soft", "hard", "off"],
  loading: ["lazy", "eager"],
  decoding: ["async", "sync", "auto"],
  fetchPriority: ["high", "low", "auto"],
  crossOrigin: ["anonymous", "use-credentials"],
  inputMode: ["none", "text", "decimal", "numeric", "tel", "search", "email", "url"],
};

const LINE_HEIGHT = 24;
const GUTTER_WIDTH = 56;
const CHARACTER_WIDTH = 7.83;
const HISTORY_LIMIT = 100;
let parserPromise;
let formatterPromise;

function loadParser() {
  if (!parserPromise) parserPromise = import("@babel/parser").then((module) => module.parse);
  return parserPromise;
}

function loadFormatter() {
  if (!formatterPromise) {
    formatterPromise = Promise.all([
      import("prettier/standalone"),
      import("prettier/plugins/typescript"),
      import("prettier/plugins/estree"),
    ])
      .then(([prettier, typescript, estree]) => ({
        formatWithCursor: prettier.formatWithCursor,
        plugins: [typescript.default, estree.default],
      }))
      .catch((error) => {
        formatterPromise = null;
        throw error;
      });
  }
  return formatterPromise;
}

function highlight(code) {
  const parts = [];
  let last = 0;
  for (const match of code.matchAll(TOKEN)) {
    if (match.index > last) parts.push(code.slice(last, match.index));
    const group = match.slice(1).findIndex((value) => value !== undefined);
    parts.push(
      <span key={match.index} className={CLASSES[group]}>
        {match[0]}
      </span>,
    );
    last = match.index + match[0].length;
  }
  parts.push(code.slice(last));
  return parts;
}

function diagnosticFromError(error) {
  return {
    line: error.loc?.line || 1,
    column: (error.loc?.column || 0) + 1,
    message: error.message.replace(/\s*\(\d+:\d+\)$/, ""),
  };
}

function getCompletion(code, cursor, force = false) {
  const before = code.slice(0, cursor);
  const classContext = /className\s*=\s*(?:\{\s*)?[`'"][^`'"]*$/.test(before);
  const word = before.match(/[A-Za-z0-9_:-]+$/)?.[0] || "";
  if (!force && word.length < 2) return null;

  const source = classContext ? CLASS_SUGGESTIONS : GENERAL_SUGGESTIONS;
  const items = source
    .filter(([label]) => label.toLowerCase().startsWith(word.toLowerCase()))
    .slice(0, 8)
    .map(([label, detail]) => ({ label, detail }));
  if (!items.length) return null;

  const lineStart = before.lastIndexOf("\n") + 1;
  return {
    items,
    activeIndex: 0,
    start: cursor - word.length,
    end: cursor,
    line: before.split("\n").length - 1,
    column: cursor - lineStart,
  };
}

function getWordRange(code, start, end) {
  if (start === end) {
    const isValueCharacter = (character) => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_:/[].%!-".includes(character);
    while (start > 0 && isValueCharacter(code[start - 1])) start -= 1;
    while (end < code.length && isValueCharacter(code[end])) end += 1;
  } else {
    while (start < end && /\s/.test(code[start])) start += 1;
    while (end > start && /\s/.test(code[end - 1])) end -= 1;
  }
  const value = code.slice(start, end);
  return value && !/\s/.test(value) ? { start, end, value } : null;
}

function getTailwindReplacements(token) {
  const variants = token.match(/^(?:(?:[a-z][\w-]*):)*/)?.[0] || "";
  const utility = token.slice(variants.length);
  const colorMatch = utility.match(/^(bg|text|border|ring|from|via|to)-([a-z]+)-(\d{2,3})(\/\d+)?$/);
  if (colorMatch) {
    const [, family, , , opacity = ""] = colorMatch;
    return {
      property: `${family} color`,
      items: TAILWIND_COLORS.flatMap((color) =>
        TAILWIND_SHADES.map((shade) => ({
          label: `${variants}${family}-${color}-${shade}${opacity}`,
          detail: `${color} · ${shade}${opacity}`,
        })),
      ),
    };
  }

  const simpleColorMatch = utility.match(/^(bg|text|border|ring)-(white|black|transparent|current|inherit)(\/\d+)?$/);
  if (simpleColorMatch) {
    const [, family, , opacity = ""] = simpleColorMatch;
    const options = [
      ...TAILWIND_COLORS.flatMap((color) =>
        TAILWIND_SHADES.map((shade) => ({
          label: `${variants}${family}-${color}-${shade}${opacity}`,
          detail: `${color} · ${shade}${opacity}`,
        })),
      ),
      ...["white", "black", "transparent", "current", "inherit"].map((color) => ({
        label: `${variants}${family}-${color}${opacity}`,
        detail: color,
      })),
    ];
    return { property: `${family} color`, items: options };
  }

  if (utility === "rounded" || utility.startsWith("rounded-")) {
    const directionalCorner = utility.match(/^rounded-(tl|tr|bl|br|t|r|b|l|s|e)-/)?.[1];
    const corner = directionalCorner ? `rounded-${directionalCorner}` : "rounded";
    return {
      property: "corner radius",
      items: ["none", "sm", "md", "lg", "xl", "2xl", "3xl", "full"].map((radius) => ({
        label: `${variants}${corner}-${radius}`,
        detail: `${radius} radius`,
      })),
    };
  }

  const spacingMatch = utility.match(/^(-?)(p(?:[xytblrse])?|m(?:[xytblrse])?|gap(?:-[xy])?)-(.+)$/);
  if (spacingMatch) {
    const [, currentSign, property] = spacingMatch;
    const signs = property.startsWith("m") ? ["", "-"] : [currentSign];
    return {
      property: property.startsWith("p") ? "padding" : property.startsWith("m") ? "margin" : "gap",
      items: signs.flatMap((sign) => SPACING_VALUES.map((value) => ({
        label: `${variants}${sign}${property}-${value}`,
        detail: `${value} spacing units`,
      }))),
    };
  }

  if (/^text-(?:xs|sm|base|lg|xl|[2-9]xl)$/.test(utility)) {
    return {
      property: "font size",
      items: ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl"]
        .map((size) => ({ label: `${variants}text-${size}`, detail: `${size} text` })),
    };
  }

  if (/^text-(?:left|center|right|justify|start|end)$/.test(utility)) {
    return {
      property: "text alignment",
      items: ["left", "center", "right", "justify", "start", "end"]
        .map((alignment) => ({ label: `${variants}text-${alignment}`, detail: `${alignment} aligned` })),
    };
  }

  if (/^font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/.test(utility)) {
    return {
      property: "font weight",
      items: ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"]
        .map((weight) => ({ label: `${variants}font-${weight}`, detail: `${weight} weight` })),
    };
  }

  if (/^border(?:-(?:0|2|4|8))?$/.test(utility)) {
    return {
      property: "border thickness",
      items: ["", "-0", "-1", "-2", "-4", "-8"]
        .map((width, index) => ({ label: `${variants}border${width}`, detail: ["default", "0px", "1px", "2px", "4px", "8px"][index] })),
    };
  }

  if (/^shadow(?:-(?:sm|md|lg|xl|2xl|inner|none))?$/.test(utility)) {
    return {
      property: "shadow",
      items: ["", "-sm", "-md", "-lg", "-xl", "-2xl", "-inner", "-none"]
        .map((size) => ({ label: `${variants}shadow${size}`, detail: size ? size.slice(1) : "default" })),
    };
  }

  if (/^opacity-\d+$/.test(utility)) {
    return {
      property: "opacity",
      items: ["0", "5", "10", "15", "20", "25", "30", "40", "50", "60", "70", "75", "80", "90", "95", "100"]
        .map((value) => ({ label: `${variants}opacity-${value}`, detail: `${value}% opacity` })),
    };
  }

  if (/^animate-(?:none|spin|ping|pulse|bounce)$/.test(utility)) {
    return {
      property: "animation",
      items: ["none", "spin", "ping", "pulse", "bounce"]
        .map((animation) => ({ label: `${variants}animate-${animation}`, detail: animation })),
    };
  }

  if (/^(?:block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/.test(utility)) {
    return {
      property: "display",
      items: ["block", "inline-block", "inline", "flex", "inline-flex", "grid", "inline-grid", "hidden"]
        .map((display) => ({ label: `${variants}${display}`, detail: display })),
    };
  }

  const gridColumns = utility.match(/^grid-cols-(\d+|none|subgrid)$/);
  if (gridColumns) {
    return {
      property: "grid columns",
      items: [...Array.from({ length: 12 }, (_, index) => String(index + 1)), "none", "subgrid"]
        .map((columns) => ({ label: `${variants}grid-cols-${columns}`, detail: columns === "none" || columns === "subgrid" ? columns : `${columns} columns` })),
    };
  }

  const simpleClassOptions = [
    {
      pattern: /^leading-/,
      property: "line height",
      values: ["none", "tight", "snug", "normal", "relaxed", "loose", "3", "4", "5", "6", "7", "8", "9", "10"],
    },
    {
      pattern: /^tracking-/,
      property: "letter spacing",
      values: ["tighter", "tight", "normal", "wide", "wider", "widest"],
    },
    {
      pattern: /^items-/,
      property: "cross-axis alignment",
      values: ["start", "end", "center", "baseline", "stretch"],
    },
    {
      pattern: /^justify-/,
      property: "main-axis alignment",
      values: ["normal", "start", "end", "center", "between", "around", "evenly", "stretch"],
    },
    {
      pattern: /^flex-(?:row|row-reverse|col|col-reverse)$/,
      property: "flex direction",
      values: ["row", "row-reverse", "col", "col-reverse"],
      prefix: "flex-",
    },
    {
      pattern: /^flex-(?:wrap|wrap-reverse|nowrap)$/,
      property: "flex wrapping",
      values: ["wrap", "wrap-reverse", "nowrap"],
      prefix: "flex-",
    },
    {
      pattern: /^transition(?:-(?:all|colors|opacity|shadow|transform|none))?$/,
      property: "transition",
      values: ["", "-all", "-colors", "-opacity", "-shadow", "-transform", "-none"],
      prefix: "transition",
    },
    {
      pattern: /^duration-\d+$/,
      property: "transition duration",
      values: ["75", "100", "150", "200", "300", "500", "700", "1000"],
      prefix: "duration-",
      detail: (value) => `${value} ms`,
    },
    {
      pattern: /^cursor-/,
      property: "cursor style",
      values: ["auto", "default", "pointer", "wait", "text", "move", "not-allowed", "grab", "grabbing"],
    },
    {
      pattern: /^overflow(?:-[xy])?-/,
      property: "overflow behavior",
      values: ["auto", "hidden", "clip", "visible", "scroll"],
      prefix: utility.match(/^overflow(?:-[xy])?-/)?.[0],
    },
    {
      pattern: /^object-(?:contain|cover|fill|none|scale-down)$/,
      property: "image fitting",
      values: ["contain", "cover", "fill", "none", "scale-down"],
      prefix: "object-",
    },
    {
      pattern: /^(?:static|fixed|absolute|relative|sticky)$/,
      property: "position",
      values: ["static", "fixed", "absolute", "relative", "sticky"],
      prefix: "",
    },
    {
      pattern: /^z-(?:\d+|auto)$/,
      property: "stacking order",
      values: ["0", "10", "20", "30", "40", "50", "auto"],
      prefix: "z-",
    },
  ].find((option) => option.pattern.test(utility));

  if (simpleClassOptions) {
    const classPrefix = simpleClassOptions.prefix ?? utility.slice(0, utility.lastIndexOf("-") + 1);
    return {
      property: simpleClassOptions.property,
      items: simpleClassOptions.values.map((value) => ({
        label: `${variants}${classPrefix}${value}`,
        detail: simpleClassOptions.detail ? simpleClassOptions.detail(value) : simpleClassOptions.property,
      })),
    };
  }

  const dimension = utility.match(/^(w|h|min-w|min-h|max-w|max-h)-(.+)$/);
  if (dimension) {
    const [, property] = dimension;
    const values = property.startsWith("max-")
      ? ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "full", "min", "max", "fit", "screen", "prose"]
      : ["auto", "full", "screen", "svh", "lvh", "dvh", "min", "max", "fit", ...SPACING_VALUES, "1/2", "1/3", "2/3", "1/4", "3/4"];
    return {
      property: property.includes("w") ? (property.startsWith("max-") ? "maximum width" : property.startsWith("min-") ? "minimum width" : "width") : (property.startsWith("max-") ? "maximum height" : property.startsWith("min-") ? "minimum height" : "height"),
      items: values.map((value) => ({
        label: `${variants}${property}-${value}`,
        detail: value,
      })),
    };
  }

  return null;
}

function getReplacementCompletion(code, selectionStart, selectionEnd, includeWordAtCursor = false) {
  if (selectionStart === selectionEnd && !includeWordAtCursor) return null;
  const range = getWordRange(code, selectionStart, selectionEnd);
  if (!range) return null;
  const { start, end, value } = range;
  let items;
  let property;

  if (/\bclassName\s*=\s*(?:\{\s*)?[`'"][^`'"]*$/s.test(code.slice(0, start))) {
    const replacements = getTailwindReplacements(value);
    if (replacements) ({ items, property } = replacements);
  } else {
    const attribute = code.slice(0, start).match(/([A-Za-z_:][\w:.-]*)\s*=\s*(?:["'])[^"'<>]*$/)?.[1];
    if (attribute && JSX_ATTRIBUTE_VALUES[attribute]) {
      property = attribute;
      items = JSX_ATTRIBUTE_VALUES[attribute].map((option) => ({ label: option, detail: `${attribute} value` }));
    } else if (attribute === "type") {
      const tag = code.slice(0, start).match(/<([A-Za-z][\w.-]*)\b[^<>]*$/)?.[1]?.toLowerCase();
      const values = tag === "button"
        ? ["button", "submit", "reset"]
        : ["text", "email", "password", "number", "tel", "url", "search", "date", "time", "datetime-local", "month", "week", "color", "checkbox", "radio", "file", "hidden", "range", "submit", "reset", "button"];
      property = tag === "button" ? "button type" : "input type";
      items = values.map((option) => ({ label: option, detail: property }));
    }
  }

  if (!items && /^[A-Za-z_:][\w:.-]*$/.test(value) && /^\s*=/.test(code.slice(end))) {
    items = JSX_ATTRIBUTE_SUGGESTIONS;
    property = "JSX property";
  }
  if (!items?.length) return null;

  return {
    items,
    activeIndex: 0,
    start,
    end,
    line: code.slice(0, start).split("\n").length - 1,
    column: start - code.lastIndexOf("\n", start - 1) - 1,
    replacement: true,
    property,
  };
}

function getVisualLineLayout(code, contentWidth) {
  const columns = Math.max(1, Math.floor(contentWidth / CHARACTER_WIDTH));
  const visualLines = [];
  const ranges = [];

  code.split("\n").forEach((line, index) => {
    const visualLength = line.replace(/\t/g, "  ").length;
    const count = Math.max(1, Math.ceil(visualLength / columns));
    ranges.push({ line: index + 1, start: visualLines.length, count });
    for (let row = 0; row < count; row += 1) {
      visualLines.push({ line: row === 0 ? index + 1 : null });
    }
  });

  return {
    visualLines,
    ranges,
    height: Math.max(320, visualLines.length * LINE_HEIGHT + 40),
  };
}

function errorLines(diagnostics) {
  return new Map(diagnostics.map((diagnostic) => [diagnostic.line, diagnostic]));
}

function wrapClassNameValues(source, cursorOffset, parse) {
  const ast = parse(source, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
  const edits = [];

  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    if (
      node.type === "JSXAttribute" &&
      node.name?.type === "JSXIdentifier" &&
      node.name.name === "className" &&
      node.value?.type === "StringLiteral"
    ) {
      const start = node.value.start + 1;
      const end = node.value.end - 1;
      const value = source.slice(start, end);
      const classes = value.trim().split(/\s+/);
      if (classes.length > 1 && value.length > 80) {
        const lineStart = source.lastIndexOf("\n", start) + 1;
        const prefix = source.slice(lineStart, start);
        const indent = prefix.match(/^\s*/)?.[0].length || 0;
        const continuationIndent = " ".repeat(indent + 2);
        const lines = [];
        let line = "";

        classes.forEach((className) => {
          const limit = lines.length === 0
            ? 100 - prefix.length
            : 100 - continuationIndent.length;
          if (line && line.length + className.length + 1 > limit) {
            lines.push(line);
            line = className;
          } else {
            line = line ? `${line} ${className}` : className;
          }
        });
        if (line) lines.push(line);
        edits.push({
          start,
          end,
          value: lines.join(`\n${continuationIndent}`),
        });
      }
    }

    Object.entries(node).forEach(([key, value]) => {
      if (key !== "loc" && key !== "start" && key !== "end") visit(value);
    });
  };
  visit(ast);

  if (!edits.length) return { code: source, cursorOffset };
  const orderedEdits = edits.sort((a, b) => a.start - b.start);
  let cursorDelta = 0;
  for (const edit of orderedEdits) {
    if (cursorOffset >= edit.end) {
      cursorDelta += edit.value.length - (edit.end - edit.start);
    } else if (cursorOffset > edit.start) {
      cursorDelta = edit.start + cursorDelta + edit.value.length - cursorOffset;
      break;
    } else {
      break;
    }
  }
  const adjustedCursor = cursorOffset + cursorDelta;
  const wrapped = [...orderedEdits]
    .reverse()
    .reduce(
      (result, edit) => `${result.slice(0, edit.start)}${edit.value}${result.slice(edit.end)}`,
      source,
    );
  return { code: wrapped, cursorOffset: adjustedCursor };
}

export default function CodeView({ code, onChange, maxHeight = "38rem" }) {
  const textareaRef = useRef(null);
  const editorRef = useRef(null);
  const historyRef = useRef(null);
  const pendingEditorValueRef = useRef(null);
  const currentCodeRef = useRef(code);
  const formatRequestRef = useRef(0);
  const formatCodeRef = useRef(null);
  currentCodeRef.current = code;
  if (!historyRef.current) {
    historyRef.current = {
      entries: [{ value: code, selectionStart: code.length, selectionEnd: code.length }],
      index: 0,
      lastEditAt: 0,
      lastEditType: "",
      lastEditLine: 0,
    };
  }
  const [diagnostics, setDiagnostics] = useState([]);
  const [analysisReady, setAnalysisReady] = useState(false);
  const [completion, setCompletion] = useState(null);
  const [activeLine, setActiveLine] = useState(0);
  const [editorWidth, setEditorWidth] = useState(0);
  const [formatting, setFormatting] = useState(false);
  const [formatError, setFormatError] = useState("");
  const [, setHistoryVersion] = useState(0);
  const highlighted = useMemo(() => highlight(code), [code]);
  const { visualLines, ranges: lineRanges, height } = useMemo(
    () => getVisualLineLayout(code, Math.max(1, editorWidth - GUTTER_WIDTH - 40)),
    [code, editorWidth],
  );
  const diagnosticsByLine = useMemo(() => errorLines(diagnostics), [diagnostics]);
  const canUndo = historyRef.current.index > 0;
  const canRedo = historyRef.current.index < historyRef.current.entries.length - 1;

  useEffect(() => {
    const container = editorRef.current;
    if (!container) return undefined;
    const updateWidth = () => setEditorWidth(container.clientWidth);
    updateWidth();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const history = historyRef.current;
    if (history.entries[history.index].value === code) return;
    historyRef.current = {
      entries: [{ value: code, selectionStart: code.length, selectionEnd: code.length }],
      index: 0,
      lastEditAt: 0,
      lastEditType: "",
      lastEditLine: 0,
    };
    setHistoryVersion((version) => version + 1);
  }, [code]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setAnalysisReady(false);
      loadParser()
        .then((parse) => {
          if (cancelled) return;
          try {
            const ast = parse(code, {
              sourceType: "module",
              plugins: ["jsx", "typescript"],
              errorRecovery: true,
            });
            setDiagnostics((ast.errors || []).map(diagnosticFromError));
          } catch (error) {
            setDiagnostics([diagnosticFromError(error)]);
          }
          setAnalysisReady(true);
        })
        .catch((error) => {
          if (cancelled) return;
          setDiagnostics([{
            line: 1,
            column: 1,
            message: `Syntax analysis unavailable: ${error.message}`,
          }]);
          setAnalysisReady(true);
        });
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code]);

  const updateCompletion = (value, cursor, force = false) => {
    setActiveLine(value.slice(0, cursor).split("\n").length - 1);
    setCompletion(getCompletion(value, cursor, force));
  };

  const updateSelection = (value, selectionStart, selectionEnd) => {
    setActiveLine(value.slice(0, selectionStart).split("\n").length - 1);
    const replacement = getReplacementCompletion(
      value,
      selectionStart,
      selectionEnd,
      selectionStart === selectionEnd,
    );
    if (replacement) {
      setCompletion(replacement);
      return;
    }
    if (selectionStart === selectionEnd) updateCompletion(value, selectionStart);
    else setCompletion(null);
  };

  const recordEdit = (value, selectionStart, selectionEnd, inputType = "") => {
    const history = historyRef.current;
    const currentEntry = history.entries[history.index];
    if (currentEntry.value === value) return;

    const now = Date.now();
    const line = value.slice(0, selectionStart).split("\n").length - 1;
    const isTyping = ["insertText", "deleteContentBackward", "deleteContentForward"].includes(inputType);
    const groupEdit =
      isTyping &&
      inputType === history.lastEditType &&
      line === history.lastEditLine &&
      now - history.lastEditAt < 600;
    const entry = { value, selectionStart, selectionEnd };

    if (groupEdit) {
      history.entries[history.index] = entry;
    } else {
      history.entries = history.entries.slice(0, history.index + 1);
      history.entries.push(entry);
      if (history.entries.length > HISTORY_LIMIT) history.entries.shift();
      history.index = history.entries.length - 1;
    }
    history.lastEditAt = isTyping ? now : 0;
    history.lastEditType = isTyping ? inputType : "";
    history.lastEditLine = line;
    pendingEditorValueRef.current = value;
    setFormatError("");
    setHistoryVersion((version) => version + 1);
    onChange(value);
  };

  const moveHistory = (direction) => {
    const history = historyRef.current;
    const nextIndex = history.index + direction;
    if (nextIndex < 0 || nextIndex >= history.entries.length) return;
    history.index = nextIndex;
    history.lastEditAt = 0;
    history.lastEditType = "";
    const entry = history.entries[nextIndex];
    pendingEditorValueRef.current = entry.value;
    onChange(entry.value);
    setCompletion(null);
    updateCompletion(entry.value, entry.selectionStart);
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(entry.selectionStart, entry.selectionEnd);
    });
    setHistoryVersion((version) => version + 1);
  };

  const insertText = (text, start, end) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const nextCode = `${textarea.value.slice(0, start)}${text}${textarea.value.slice(end)}`;
    recordEdit(nextCode, start + text.length, start + text.length);
    setCompletion(null);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + text.length, start + text.length);
      setActiveLine(nextCode.slice(0, start + text.length).split("\n").length - 1);
    });
  };

  const formatCode = async (source = code) => {
    const requestId = formatRequestRef.current + 1;
    formatRequestRef.current = requestId;
    setFormatting(true);
    setFormatError("");
    try {
      const { formatWithCursor, plugins } = await loadFormatter();
      const cursorOffset = source === currentCodeRef.current
        ? textareaRef.current?.selectionStart ?? source.length
        : source.length;
      const result = await formatWithCursor(source, {
        parser: "typescript",
        plugins,
        tabWidth: 2,
        useTabs: false,
        printWidth: 100,
        semi: true,
        singleQuote: false,
        trailingComma: "all",
        endOfLine: "lf",
        cursorOffset,
      });
      if (requestId !== formatRequestRef.current || currentCodeRef.current !== source) return;
      const cursor = result.cursorOffset < 0 ? result.formatted.length : result.cursorOffset;
      const parse = await loadParser();
      const wrapped = wrapClassNameValues(result.formatted, cursor, parse);
      if (requestId !== formatRequestRef.current || currentCodeRef.current !== source) return;
      const nextCursor = wrapped.cursorOffset;
      recordEdit(wrapped.code, nextCursor, nextCursor);
      setCompletion(null);
      requestAnimationFrame(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.focus();
        textarea.setSelectionRange(nextCursor, nextCursor);
      });
    } catch (error) {
      if (requestId === formatRequestRef.current && currentCodeRef.current === source) {
        setFormatError(`Formatting failed: ${error.message}`);
      }
    } finally {
      if (requestId === formatRequestRef.current) setFormatting(false);
    }
  };
  formatCodeRef.current = formatCode;

  useEffect(() => {
    if (!code.trim()) return;
    if (pendingEditorValueRef.current === code) {
      pendingEditorValueRef.current = null;
      return;
    }
    void formatCodeRef.current(code);
  }, [code]);

  const acceptCompletion = (item) => {
    if (!completion) return;
    insertText(item.label, completion.start, completion.end);
  };

  const handleKeyDown = (event) => {
    if (event.shiftKey && event.altKey && event.key.toLowerCase() === "f") {
      event.preventDefault();
      void formatCode();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && !event.altKey) {
      const key = event.key.toLowerCase();
      if (key === "z" || key === "y") {
        event.preventDefault();
        moveHistory(key === "y" || (key === "z" && event.shiftKey) ? 1 : -1);
        return;
      }
    }
    if ((event.ctrlKey || event.metaKey) && event.code === "Space") {
      event.preventDefault();
      const { value, selectionStart, selectionEnd } = event.currentTarget;
      const replacement = getReplacementCompletion(value, selectionStart, selectionEnd, true);
      if (replacement) setCompletion(replacement);
      else updateCompletion(value, selectionStart, true);
      return;
    }
    if (completion && event.key === "ArrowDown") {
      event.preventDefault();
      setCompletion((current) => ({ ...current, activeIndex: (current.activeIndex + 1) % current.items.length }));
      return;
    }
    if (completion && event.key === "ArrowUp") {
      event.preventDefault();
      setCompletion((current) => ({ ...current, activeIndex: (current.activeIndex + current.items.length - 1) % current.items.length }));
      return;
    }
    if (completion && (event.key === "Enter" || event.key === "Tab")) {
      event.preventDefault();
      acceptCompletion(completion.items[completion.activeIndex]);
      return;
    }
    if (event.key === "Escape" && completion) {
      event.preventDefault();
      setCompletion(null);
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      insertText("  ", event.currentTarget.selectionStart, event.currentTarget.selectionEnd);
    }
  };

  const handleKeyUp = (event) => {
    if (["ArrowDown", "ArrowUp", "Enter", "Tab", "Escape", "Control", "Meta"].includes(event.key)) return;
    if ((event.ctrlKey || event.metaKey) && event.code === "Space") return;
    if (event.currentTarget.selectionStart !== event.currentTarget.selectionEnd) {
      updateSelection(event.currentTarget.value, event.currentTarget.selectionStart, event.currentTarget.selectionEnd);
      return;
    }
    updateCompletion(event.currentTarget.value, event.currentTarget.selectionStart);
  };

  const popupStyle = completion
    ? {
      left: Math.max(0, Math.min(editorWidth - GUTTER_WIDTH - 320, 20 + completion.column * CHARACTER_WIDTH)),
      top: 20 + completion.line * LINE_HEIGHT + LINE_HEIGHT,
    }
    : undefined;

  return (
    <div ref={editorRef} className="code-scroll w-full overflow-x-hidden overflow-y-auto bg-[#0b0b10]" style={{ maxHeight }}>
      <div className="sticky top-0 z-40 flex w-full flex-wrap items-center gap-2 border-b border-white/5 bg-[#0b0b10] px-3 py-2 font-mono text-[13px] leading-6 shadow-lg shadow-black/20">
          <button
            type="button"
            aria-label="Undo"
            title="Undo (Ctrl/Command+Z)"
            disabled={!canUndo}
            onClick={() => moveHistory(-1)}
            className="rounded-md border border-white/10 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            Undo
          </button>
          <button
            type="button"
            aria-label="Redo"
            title="Redo (Ctrl/Command+Shift+Z)"
            disabled={!canRedo}
            onClick={() => moveHistory(1)}
            className="rounded-md border border-white/10 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            Redo
          </button>
          <button
            type="button"
            aria-label="Format code"
            title="Format document (Shift+Alt+F)"
            disabled={formatting}
            onClick={() => void formatCode()}
            className="rounded-md border border-white/10 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-50"
          >
            {formatting ? "Formatting…" : "Format"}
          </button>
          <span className="ml-auto text-[10px] text-zinc-600">Select a value for replacements · Ctrl/⌘+Space for suggestions</span>
          {formatError && (
            <p role="alert" className="w-full text-xs text-rose-300">
              {formatError}
            </p>
          )}
      </div>
      <div className="flex w-full min-w-0 font-mono text-[13px] leading-6">
        <div
          aria-hidden="true"
          className="sticky left-0 z-30 w-14 shrink-0 select-none border-r border-white/5 bg-[#0b0b10] px-3 py-5 text-right text-zinc-600"
          style={{ height }}
        >
          {visualLines.map((visualLine, index) => {
            const line = visualLine.line;
            const diagnostic = diagnosticsByLine.get(line);
            return (
              <div key={index} title={diagnostic?.message} className={`h-6 ${diagnostic ? "font-bold text-rose-400" : line && line - 1 === activeLine ? "text-zinc-300" : ""}`}>
                {line ? (diagnostic ? "!" : line) : ""}
              </div>
            );
          })}
        </div>

        <div className="relative min-w-0 flex-1 rounded-sm focus-within:ring-2 focus-within:ring-sky-500/60" style={{ height }}>
          {lineRanges.filter(({ line }) => diagnosticsByLine.has(line)).flatMap(({ line, start, count }) =>
            Array.from({ length: count }, (_, row) => (
              <div
                key={`error-${line}-${row}`}
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 h-6 bg-rose-500/10"
                style={{ top: 20 + (start + row) * LINE_HEIGHT }}
              />
            )),
          )}
          {lineRanges.filter(({ line }) => line === activeLine + 1).flatMap(({ start, count }) =>
            Array.from({ length: count }, (_, row) => (
              <div
                key={`active-${activeLine}-${row}`}
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 h-6 bg-white/[0.025]"
                style={{ top: 20 + (start + row) * LINE_HEIGHT }}
              />
            )),
          )}
          <pre
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre-wrap break-all px-5 py-5 text-zinc-200"
            style={{ height, tabSize: 2 }}
          >
            <code>{highlighted}</code>
          </pre>
          <textarea
            ref={textareaRef}
            aria-label="Editable component source code"
            aria-invalid={diagnostics.length > 0}
            aria-autocomplete="list"
            aria-expanded={Boolean(completion)}
            aria-controls="code-completion-list"
            aria-describedby="code-editor-diagnostics"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            wrap="soft"
            readOnly={formatting}
            className="absolute inset-0 z-10 m-0 resize-none overflow-hidden whitespace-pre-wrap break-all bg-transparent px-5 py-5 font-mono text-[13px] leading-6 text-transparent caret-white selection:bg-sky-400/40 focus:outline-none"
            style={{ height, tabSize: 2 }}
            value={code}
            onChange={(event) => {
              recordEdit(
                event.currentTarget.value,
                event.currentTarget.selectionStart,
                event.currentTarget.selectionEnd,
                event.nativeEvent.inputType,
              );
              updateCompletion(event.currentTarget.value, event.currentTarget.selectionStart);
            }}
            onClick={(event) => {
              const { value, selectionStart, selectionEnd } = event.currentTarget;
              updateSelection(value, selectionStart, selectionEnd);
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onSelect={(event) => updateSelection(event.currentTarget.value, event.currentTarget.selectionStart, event.currentTarget.selectionEnd)}
            onBlur={() => setCompletion(null)}
          />
          {completion && (
            <div
              className="absolute z-40 w-80 max-w-[calc(100%-1rem)] overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-2xl shadow-black/50"
              style={popupStyle}
            >
              {completion.replacement && (
                <div className="border-b border-white/10 px-3 py-2">
                  <p className="text-xs font-semibold text-white">Replace {completion.property}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-500">{completion.items.length} available options</p>
                </div>
              )}
              <div
                id="code-completion-list"
                role="listbox"
                aria-label={completion.replacement ? `${completion.property} replacement suggestions` : "Code suggestions"}
                className="max-h-72 overflow-y-auto py-1"
              >
                {completion.items.map((item, index) => (
                  <div
                    key={item.label}
                    id={`code-completion-${index}`}
                    role="option"
                    aria-selected={index === completion.activeIndex}
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-1.5 text-left text-xs ${index === completion.activeIndex ? "bg-sky-500/20 text-white" : "text-zinc-300"}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => acceptCompletion(item)}
                  >
                    <span className="font-semibold">{item.label}</span>
                    <span className="truncate text-[10px] text-zinc-500">{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        id="code-editor-diagnostics"
        aria-live="polite"
        className={`flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2 text-xs ${diagnostics.length ? "border-rose-500/20 bg-rose-500/5 text-rose-300" : "border-white/5 bg-zinc-950 text-zinc-500"}`}
      >
        {diagnostics.length ? (
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {diagnostics.map((diagnostic, index) => (
              <li key={`${diagnostic.line}-${diagnostic.column}-${index}`} title={`Line ${diagnostic.line}, column ${diagnostic.column}`}>
                <span className="font-semibold">Line {diagnostic.line}:</span> {diagnostic.message}
              </li>
            ))}
          </ul>
        ) : (
          <span>{analysisReady ? "✓ No syntax errors" : "Checking syntax…"}</span>
        )}
        <span className="ml-auto">JSX / TSX · select a value or press Ctrl+Space for suggestions</span>
      </div>
    </div>
  );
}
