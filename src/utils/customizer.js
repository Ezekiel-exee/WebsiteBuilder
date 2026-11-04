export const RADII = [
  { id: "rounded-none", label: "Square" },
  { id: "rounded-sm", label: "Small" },
  { id: "rounded-md", label: "Medium" },
  { id: "rounded-xl", label: "Large" },
  { id: "rounded-full", label: "Pill" },
];

export const THEMES = {
  neon: {
    label: "Neon Cyber",
    container: "slate",
    heading: "text-cyan-100",
    body: "text-slate-300",
    accent: "cyan",
    border: "border-cyan-400/30",
  },
  emerald: {
    label: "Emerald Forest",
    container: "emerald",
    heading: "text-emerald-50",
    body: "text-emerald-200",
    accent: "emerald",
    border: "border-emerald-300/20",
  },
  sunset: {
    label: "Sunset Gradient",
    container: "orange",
    heading: "text-orange-50",
    body: "text-orange-100",
    accent: "orange",
    border: "border-orange-200/30",
  },
  navy: {
    label: "Corporate Navy",
    container: "blue",
    heading: "text-blue-50",
    body: "text-blue-100",
    accent: "blue",
    border: "border-blue-200/25",
  },
  slate: {
    label: "Minimal Slate",
    container: "slate",
    heading: "text-slate-50",
    body: "text-slate-300",
    accent: "slate",
    border: "border-slate-400/20",
  },
  vintage: {
    label: "Vintage Warmth",
    container: "amber",
    heading: "text-amber-50",
    body: "text-amber-100",
    accent: "amber",
    border: "border-amber-200/30",
  },
};

export const DEFAULT_CUSTOMIZATION = {
  globalRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12, linked: true },
  cardRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12, linked: true },
  controlRadius: { topLeft: 6, topRight: 6, bottomRight: 6, bottomLeft: 6, linked: true },
  borderWidth: null,
  theme: "slate",
  mode: "dark",
  container: "slate",
  heading: "text-slate-50",
  body: "text-slate-300",
  accent: "slate",
  border: "border-slate-400/20",
  hover: "lift",
  animation: "none",
};

export const ELEMENT_TARGETS = [
  { id: "component", label: "Whole component" },
  { id: "container", label: "Section / container" },
  { id: "heading", label: "Headings" },
  { id: "body", label: "Body text" },
  { id: "cards", label: "Cards" },
  { id: "actions", label: "Buttons / links" },
  { id: "images", label: "Images / illustrations" },
];

export const TARGET_CAPABILITIES = {
  component: ["theme", "mode", "globalRadius", "cardRadius", "controlRadius", "borderWidth", "container", "heading", "body", "accent", "border", "hover", "animation"],
  container: ["cardRadius", "borderWidth", "container", "accent", "border", "hover"],
  heading: ["heading", "animation"],
  body: ["body", "animation"],
  cards: ["cardRadius", "borderWidth", "container", "accent", "border", "hover"],
  actions: ["controlRadius", "borderWidth", "heading", "accent", "border", "hover"],
  images: ["globalRadius", "borderWidth", "border", "hover"],
};

function matchesTarget(tag, classes, target) {
  if (target === "container") return tag === "section" || tag === "main";
  if (target === "heading") return /^h[1-6]$/.test(tag);
  if (target === "body") return ["p", "li", "blockquote", "small"].includes(tag);
  if (target === "cards") return tag === "article" || (tag === "div" && /rounded-/.test(classes) && /(?:border-|bg-)/.test(classes));
  if (target === "actions") return tag === "button" || tag === "a";
  if (target === "images") return tag === "img" || tag === "svg";
  return false;
}

export function discoverTargets(root) {
  const targets = ["component"];
  const has = (selector) => Boolean(root.querySelector(selector));
  if (has("section, main")) targets.push("container");
  if (has("h1, h2, h3, h4, h5, h6")) targets.push("heading");
  if (has("p, li, blockquote, small")) targets.push("body");
  if (has("article, div[class*='rounded-'][class*='border'], div[class*='rounded-'][class*='bg-']")) targets.push("cards");
  if (has("button, a")) targets.push("actions");
  if (has("img, svg")) targets.push("images");
  return targets;
}

const TAILWIND_COLORS = ["slate", "emerald", "cyan", "orange", "blue", "amber", "rose", "violet"];
const HUE_CLASSES = /((?:bg|text|border|from|via|to|ring|shadow|decoration|outline)-)(?:violet|indigo|cyan|sky|blue|emerald|teal|fuchsia|pink|rose|amber|orange|lime|green|purple|red|yellow)-(\d{2,3}(?:\/\d+)?)/g;
const CLASS_ATTRIBUTE = /\bclassName\s*=\s*(?:\{\s*)?([`"'])([\s\S]*?)\1(?:\s*\})?/g;
const RADIUS_CLASS = /\brounded-(?:none|sm|md|lg|xl|2xl|3xl|full|\[[^\]]+\])\b/g;
const INTERACTIVE_CLASS = /\bclassName\s*=\s*(?:\{\s*)?([`"'])([\s\S]*?)\1(?:\s*\})?/g;

function mapClassAttribute(source, predicate, transform) {
  return source.replace(INTERACTIVE_CLASS, (attribute, quote, classes, offset, fullSource) => {
    const openingTag = fullSource.slice(Math.max(0, offset - 500), offset).match(/<([A-Za-z][\w.]*)[^<>]*$/);
    if (!openingTag || !predicate(openingTag[1], classes)) return attribute;
    return attribute.replace(classes, transform(classes, openingTag[1]));
  });
}

function normalizeSpacingToken(token) {
  const variantIndex = token.lastIndexOf(":");
  const prefix = variantIndex < 0 ? "" : token.slice(0, variantIndex + 1);
  const utility = token.slice(variantIndex + 1);
  const match = utility.match(/^(-?)(p(?:x|y|t|r|b|l|s|e)?|m(?:x|y|t|r|b|l|s|e)?|gap(?:-[xy])?|space-[xy])-((?:\d+(?:\.\d+)?)|\[-?\d+(?:\.\d+)?(?:px|rem)\])$/);
  if (!match) return token;
  const [, negative, property, value] = match;
  let spacingUnits;
  if (value.startsWith("[")) {
    const [, numeric, unit] = value.match(/^\[(-?\d+(?:\.\d+)?)(px|rem)\]$/) || [];
    if (!numeric) return token;
    const pixels = Number(numeric) * (unit === "rem" ? 16 : 1);
    spacingUnits = Math.round(pixels / 8) * 2;
  } else {
    spacingUnits = Math.round(Number(value) / 2) * 2;
  }
  if (Number(value.replace(/[^\d.]/g, "")) > 0) spacingUnits = Math.max(2, spacingUnits);
  return `${prefix}${negative}${property}-${spacingUnits}`;
}

function normalizeTextSizeToken(token) {
  const variantIndex = token.lastIndexOf(":");
  const prefix = variantIndex < 0 ? "" : token.slice(0, variantIndex + 1);
  const utility = token.slice(variantIndex + 1);
  const match = utility.match(/^text-\[(\d+(?:\.\d+)?)px\]$/);
  if (!match) return token;
  const scale = [
    [12, "text-xs"], [14, "text-sm"], [16, "text-base"], [18, "text-lg"],
    [20, "text-xl"], [24, "text-2xl"], [30, "text-3xl"], [36, "text-4xl"],
    [48, "text-5xl"], [60, "text-6xl"], [72, "text-7xl"], [96, "text-8xl"],
  ];
  const pixels = Number(match[1]);
  const nearest = scale.reduce((best, option) =>
    Math.abs(option[0] - pixels) < Math.abs(best[0] - pixels) ? option : best,
  );
  return `${prefix}${nearest[1]}`;
}

function utilityName(token) {
  return token.slice(token.lastIndexOf(":") + 1);
}

function normalizeClassToken(token) {
  const utility = utilityName(token);
  if (token.split(":").includes("hover") && /^scale-(?:105|110|125)$/.test(utility)) {
    return token.replace(/scale-(?:105|110|125)$/, "scale-[1.02]");
  }
  if (utility === "shadow-2xl") return token.replace("shadow-2xl", "shadow-xl");
  if (/^text-\[\d+(?:\.\d+)?px\]$/.test(utility)) return normalizeTextSizeToken(token);
  return normalizeSpacingToken(token);
}

function normalizeClassFragment(fragment) {
  return fragment.replace(/\S+/g, normalizeClassToken);
}

function findTemplateExpressionEnd(source, start) {
  let depth = 1;
  let quote = null;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
    } else if (character === "'" || character === '"' || character === "`") {
      quote = character;
    } else if (character === "{") {
      depth += 1;
    } else if (character === "}" && --depth === 0) {
      return index;
    }
  }
  return -1;
}

function normalizeExpressionStrings(expression) {
  let result = "";
  let index = 0;
  while (index < expression.length) {
    const quote = expression[index];
    if (quote !== "'" && quote !== '"') {
      result += quote;
      index += 1;
      continue;
    }

    let end = index + 1;
    let escaped = false;
    while (end < expression.length) {
      if (escaped) escaped = false;
      else if (expression[end] === "\\") escaped = true;
      else if (expression[end] === quote) break;
      end += 1;
    }
    if (end === expression.length) {
      result += expression.slice(index);
      break;
    }
    result += `${quote}${normalizeClassFragment(expression.slice(index + 1, end))}${quote}`;
    index = end + 1;
  }
  return result;
}

function normalizeTemplateClassList(classes) {
  let result = "";
  let cursor = 0;
  while (cursor < classes.length) {
    const start = classes.indexOf("${", cursor);
    if (start < 0) {
      result += normalizeClassFragment(classes.slice(cursor));
      break;
    }
    result += normalizeClassFragment(classes.slice(cursor, start));
    const end = findTemplateExpressionEnd(classes, start + 2);
    if (end < 0) return classes;
    result += `\${${normalizeExpressionStrings(classes.slice(start + 2, end))}}`;
    cursor = end + 1;
  }
  return result;
}

function normalizeClassList(classes, tag) {
  const hasExpressions = classes.includes("${");
  const normalizedClasses = hasExpressions ? normalizeTemplateClassList(classes) : null;
  let tokens = hasExpressions
    ? null
    : classes.split(/\s+/).filter(Boolean).map(normalizeClassToken);
  const hasUtility = (name) => hasExpressions
    ? new RegExp(`(?:^|\\s)${name}[^\\s]*(?:\\s|$)`).test(normalizedClasses)
    : tokens.some((token) => utilityName(token).startsWith(name));
  const additions = [];

  const isHeading = /^h[1-6]$/.test(tag);
  const isBodyCopy = ["p", "li", "blockquote"].includes(tag);
  if (isHeading) {
    if (!hasUtility("leading-")) additions.push("leading-tight");
    if (!hasUtility("tracking-")) additions.push("tracking-tight");
  }
  if (isBodyCopy && !hasUtility("leading-")) additions.push("leading-relaxed");

  const isInteractive = ["button", "a", "input", "select", "textarea"].includes(tag);
  const isInteractiveCard = hasExpressions
    ? normalizedClasses.includes("hover:")
    : tokens.some((token) => token.includes("hover:"));
  if (isInteractive || isInteractiveCard) {
    if (!hasUtility("transition")) additions.push("transition-all");
    if (!hasUtility("duration-")) additions.push("duration-200");
    if (!hasUtility("ease-")) additions.push("ease-out");
  }
  if (isInteractive && !hasUtility("focus-visible:")) {
    additions.push("focus-visible:outline", "focus-visible:outline-2", "focus-visible:outline-offset-2", "focus-visible:outline-cyan-400");
  }

  if (hasExpressions) {
    return additions.length ? `${normalizedClasses.trimEnd()} ${additions.join(" ")}` : normalizedClasses;
  }
  return [...new Set([...tokens, ...additions])].join(" ");
}

export function refineSource(source) {
  return mapClassAttribute(source, () => true, normalizeClassList);
}

function cssColor(tailwindClass) {
  const hex = tailwindClass.match(/#([\da-f]{6}|[\da-f]{3})/i)?.[1];
  if (hex) {
    const expanded = hex.length === 3 ? hex.split("").map((digit) => digit + digit).join("") : hex;
    return `#${expanded.toLowerCase()}`;
  }
  const [, family, shade] = tailwindClass.match(/(?:bg|text|border)-([a-z]+)-(\d+)/) || [];
  if (!family) return "#64748b";
  const colors = {
    slate: { 50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a", 950: "#020617" },
    emerald: { 50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7", 400: "#34d399", 500: "#10b981", 600: "#059669", 700: "#047857", 800: "#065f46", 900: "#064e3b", 950: "#022c22" },
    cyan: { 50: "#ecfeff", 100: "#cffafe", 200: "#a5f3fc", 300: "#67e8f9", 400: "#22d3ee", 500: "#06b6d4", 600: "#0891b2", 700: "#0e7490", 800: "#155e75", 900: "#164e63", 950: "#083344" },
    orange: { 50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa", 300: "#fdba74", 400: "#fb923c", 500: "#f97316", 600: "#ea580c", 700: "#c2410c", 800: "#9a3412", 900: "#7c2d12", 950: "#431407" },
    blue: { 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a", 950: "#172554" },
    amber: { 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309", 800: "#92400e", 900: "#78350f", 950: "#451a03" },
    rose: { 50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af", 400: "#fb7185", 500: "#f43f5e", 600: "#e11d48", 700: "#be123c", 800: "#9f1239", 900: "#881337", 950: "#4c0519" },
    violet: { 50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 300: "#c4b5fd", 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9", 800: "#5b21b6", 900: "#4c1d95", 950: "#2e1065" },
  };
  return colors[family]?.[shade] || "#64748b";
}

export function isCustomColor(value) {
  return typeof value === "string" && /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value);
}

export function colorToHex(value, kind) {
  if (isCustomColor(value)) return cssColor(value);
  if (kind === "container" && /^[a-z]+$/.test(value)) return cssColor(`bg-${value}-950`);
  if (kind === "accent" && /^[a-z]+$/.test(value)) return cssColor(`bg-${value}-400`);
  return cssColor(value);
}

function colorUtility(prefix, value, shade, opacity = "") {
  return isCustomColor(value) ? `${prefix}[${cssColor(value)}]${opacity}` : `${prefix}${value}-${shade}${opacity}`;
}

function textUtility(value, shade) {
  if (isCustomColor(value)) return `text-[${cssColor(value)}]`;
  return value.startsWith("text-") ? value : `text-${colorFamily(value)}-${shade}`;
}

function borderUtility(value) {
  if (isCustomColor(value)) return `border-[${cssColor(value)}]`;
  return value.startsWith("border-") ? value : `border-${value}-400`;
}

function modeBorderUtility(settings) {
  return settings.mode === "light" && settings.border === DEFAULT_CUSTOMIZATION.border
    ? "border-slate-200"
    : borderUtility(settings.border);
}

function mixColor(hex, target, amount) {
  const color = cssColor(hex).slice(1);
  const other = target.slice(1);
  const channels = [0, 2, 4].map((offset) => {
    const current = Number.parseInt(color.slice(offset, offset + 2), 16);
    const next = Number.parseInt(other.slice(offset, offset + 2), 16);
    return Math.round(current + (next - current) * amount).toString(16).padStart(2, "0");
  });
  return `#${channels.join("")}`;
}

function customSurfaceColor(value, mode, shade) {
  const amount = mode === "light"
    ? shade === "100" ? 0.84 : 0.92
    : shade === "900" ? 0.65 : 0.82;
  return mixColor(value, mode === "light" ? "#ffffff" : "#000000", amount);
}

function colorLuminance(value) {
  const channels = cssColor(value).slice(1).match(/.{2}/g).map((channel) => Number.parseInt(channel, 16) / 255);
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground, background) {
  const values = [colorLuminance(foreground), colorLuminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function ensureContrast(foreground, background, minimum = 4.5) {
  const color = cssColor(foreground);
  if (contrastRatio(color, background) >= minimum) return color;
  const target = contrastRatio("#000000", background) >= contrastRatio("#ffffff", background)
    ? "#000000"
    : "#ffffff";
  for (let step = 1; step <= 100; step += 1) {
    const adjusted = mixColor(color, target, step / 100);
    if (contrastRatio(adjusted, background) >= minimum) return adjusted;
  }
  return target;
}

function colorFamily(tailwindClass, fallback = "slate") {
  return tailwindClass.match(/^(?:text|bg|border)-([a-z]+)-/)?.[1] || fallback;
}

export function getPreviewStyle(settings, targetSettings = settings) {
  const containerColor = (value, shade, mode = settings.mode) => isCustomColor(value)
    ? customSurfaceColor(value, mode, shade)
    : cssColor(`bg-${value}-${shade}`);
  const textColor = (value, shade) => cssColor(settings.mode === "light" && !isCustomColor(value)
    ? `text-${colorFamily(value)}-${shade}`
    : value);
  const targetTextColor = (value, shade) => cssColor(targetSettings.mode === "light" && !isCustomColor(value)
    ? `text-${colorFamily(value)}-${shade}`
    : value);
  const surface = containerColor(settings.container, settings.mode === "light" ? "50" : "950");
  const targetSurface = containerColor(targetSettings.container, targetSettings.mode === "light" ? "50" : "950", targetSettings.mode);
  const subcontainer = containerColor(settings.container, settings.mode === "light" ? "100" : "900");
  const text = ensureContrast(textColor(settings.heading, "900"), surface);
  const content = ensureContrast(textColor(settings.body, "700"), surface);
  const border = cssColor(settings.border);
  const accent = (shade) => isCustomColor(settings.accent)
    ? cssColor(settings.accent)
    : cssColor(`bg-${settings.accent}-${shade}`);
  const targetAccent = (shade) => isCustomColor(targetSettings.accent)
    ? cssColor(targetSettings.accent)
    : cssColor(`bg-${targetSettings.accent}-${shade}`);
  const accentText = ensureContrast(
    accent(settings.mode === "light" ? "700" : "400"),
    surface,
  );
  const targetAccentText = ensureContrast(
    targetAccent(targetSettings.mode === "light" ? "700" : "400"),
    targetSurface,
  );
  const accentBackground = accent(isCustomColor(settings.accent) ? "600" : "700");
  const targetAccentBackground = targetAccent(isCustomColor(targetSettings.accent) ? "600" : "700");
  const onAccent = contrastRatio("#ffffff", accentBackground) >= contrastRatio("#0b1220", accentBackground)
    ? "#ffffff"
    : "#0b1220";
  const targetOnAccent = contrastRatio("#ffffff", targetAccentBackground) >= contrastRatio("#0b1220", targetAccentBackground)
    ? "#ffffff"
    : "#0b1220";
  const targetBorderWidth = targetSettings.borderWidth == null ? settings.borderWidth : targetSettings.borderWidth;
  const radiusValue = (radius) => {
    if (radius && typeof radius === "object") {
      return [radius.topLeft, radius.topRight, radius.bottomRight, radius.bottomLeft]
        .map((value) => `${Math.max(0, Number(value) || 0)}px`)
        .join(" ");
    }
    return ({
    "rounded-none": "0",
    "rounded-sm": "0.125rem",
    "rounded-md": "0.375rem",
    "rounded-xl": "0.75rem",
    "rounded-full": "9999px",
    })[radius];
  };
  return {
    "--studio-container": surface,
    "--studio-subcontainer": subcontainer,
    "--studio-heading": text,
    "--studio-body": content,
    "--studio-accent": accentText,
    "--studio-accent-background": accentBackground,
    "--studio-on-accent": onAccent,
    "--studio-border": border,
    "--studio-border-width": settings.borderWidth == null ? undefined : `${Math.max(0, Math.min(16, Number(settings.borderWidth) || 0))}px`,
    "--studio-global-radius": radiusValue(settings.globalRadius),
    "--studio-card-radius": radiusValue(settings.cardRadius),
    "--studio-control-radius": radiusValue(settings.controlRadius),
    "--studio-target-container": targetSurface,
    "--studio-target-heading": ensureContrast(targetTextColor(targetSettings.heading, "900"), targetSurface),
    "--studio-target-body": ensureContrast(targetTextColor(targetSettings.body, "700"), targetSurface),
    "--studio-target-accent": targetAccentText,
    "--studio-target-accent-background": targetAccentBackground,
    "--studio-target-on-accent": targetOnAccent,
    "--studio-target-action": targetAccentBackground,
    "--studio-target-border": cssColor(targetSettings.border),
    "--studio-target-border-width": targetBorderWidth == null
      ? undefined
      : `${Math.max(0, Math.min(16, Number(targetBorderWidth) || 0))}px`,
    "--studio-target-global-radius": radiusValue(targetSettings.globalRadius),
    "--studio-target-card-radius": radiusValue(targetSettings.cardRadius),
    "--studio-target-control-radius": radiusValue(targetSettings.controlRadius),
    colorScheme: settings.mode,
  };
}

const HOVER_CLASSES = {
  glow: "hover:shadow-xl",
  scale: "hover:scale-[1.02]",
  tilt: "transform-3d hover:rotate-x-3 hover:rotate-y-3",
  lift: "hover:-translate-y-1",
  gradient: "hover:shadow-lg",
  none: "",
};
const ANIMATION_CLASSES = {
  counter: "animate-[counter-roll_900ms_ease-out_both] motion-reduce:animate-none",
  fade: "animate-[fade-up_700ms_ease-out_both] motion-reduce:animate-none",
  typewriter: "animate-[typewriter_2s_steps(30)_both] motion-reduce:animate-none",
  glitch: "animate-[glitch_1.8s_steps(2)_infinite] motion-reduce:animate-none",
  stagger: "animate-[fade-up_700ms_ease-out_both] motion-reduce:animate-none",
  none: "",
};
const ANIMATION_KEYFRAMES =
  "@keyframes counter-roll{from{opacity:0;transform:translateY(.5em)}to{opacity:1;transform:translateY(0)}}" +
  "@keyframes fade-up{from{opacity:0;transform:translateY(.75rem)}to{opacity:1;transform:translateY(0)}}" +
  "@keyframes typewriter{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}" +
  "@keyframes glitch{0%,90%,100%{transform:translate(0);text-shadow:none}92%{transform:translate(-2px,1px);text-shadow:2px 0 #f43f5e,-2px 0 #22d3ee}96%{transform:translate(2px,-1px);text-shadow:-2px 0 #f43f5e,2px 0 #22d3ee}}";
const COLOR_TEXT_CLASS = /\btext-(?:white|black|(?:slate|zinc|neutral|stone|gray|violet|indigo|cyan|sky|blue|emerald|teal|fuchsia|pink|rose|amber|orange|lime|green|purple|red|yellow)-\d{2,3}(?:\/\d+)?)\b|\btext-\[#[\da-f]{3,6}\]/gi;
const COLORED_BACKGROUND_CLASS = /\bbg-(?:zinc|neutral|stone|gray|slate|violet|indigo|cyan|sky|blue|emerald|teal|fuchsia|pink|rose|amber|orange|lime|green|purple|red|yellow)-(\d{2,3})(\/\d+)?\b/g;
const BORDER_COLOR_CLASS = /\bborder-(?:white|black|zinc|neutral|stone|gray|slate|violet|indigo|cyan|sky|blue|emerald|teal|fuchsia|pink|rose|amber|orange|lime|green|purple|red|yellow)(?:-\d{2,3})?(?:\/\d+)?\b|\bborder-\[#[\da-f]{3,6}\]/gi;

function replaceTextColor(classes, color) {
  const hasColor = COLOR_TEXT_CLASS.test(classes);
  COLOR_TEXT_CLASS.lastIndex = 0;
  const updated = classes.replace(COLOR_TEXT_CLASS, color);
  COLOR_TEXT_CLASS.lastIndex = 0;
  return hasColor ? updated : `${updated} ${color}`;
}

function lightTextColor(color, shade = "900") {
  return `text-${colorFamily(color)}-${shade}`;
}

function surfaceColor(settings) {
  return isCustomColor(settings.container)
    ? customSurfaceColor(settings.container, settings.mode, settings.mode === "light" ? "50" : "950")
    : cssColor(`bg-${settings.container}-${settings.mode === "light" ? "50" : "950"}`);
}

function modeTextUtility(value, shade, settings) {
  const selectedColor = isCustomColor(value)
    ? cssColor(value)
    : cssColor(settings.mode === "light" ? `text-${colorFamily(value)}-${shade}` : value);
  const adjusted = ensureContrast(selectedColor, surfaceColor(settings));
  if (isCustomColor(value) || adjusted !== selectedColor) return `text-[${adjusted}]`;
  return settings.mode === "light" ? lightTextColor(value, shade) : textUtility(value, shade);
}

function accentTextUtility(settings) {
  if (isCustomColor(settings.accent)) {
    const adjusted = ensureContrast(settings.accent, surfaceColor(settings));
    return `text-[${adjusted}]`;
  }
  return `text-${settings.accent}-${settings.mode === "light" ? "700" : "400"}`;
}

function accentForegroundUtility(settings) {
  return getPreviewStyle(settings)["--studio-on-accent"] === "#ffffff" ? "text-white" : "text-slate-950";
}

function updateRadius(classes, target, settings) {
  const radius = target === "cards" || target === "container" ? settings.cardRadius :
    target === "actions" ? settings.controlRadius : settings.globalRadius;
  return replaceRadius(classes, radius);
}

function radiusUtility(radius) {
  if (!radius || typeof radius !== "object") return radius;
  const values = [radius.topLeft, radius.topRight, radius.bottomRight, radius.bottomLeft]
    .map((value) => `${Math.max(0, Number(value) || 0)}px`);
  return `rounded-[${values.join("_")}]`;
}

function replaceRadius(classes, radius) {
  const hasRadius = RADIUS_CLASS.test(classes);
  RADIUS_CLASS.lastIndex = 0;
  const utility = radiusUtility(radius);
  const updated = classes.replace(RADIUS_CLASS, utility);
  return hasRadius ? updated : `${updated} ${utility}`;
}

function isBorderWidthUtility(utility) {
  return /^border(?:-(?:(?:x|y|t|r|b|l)(?:-(?:\d+|\[[^\]]+\]))?|\d+|\[[^\]]+\]))?$/.test(utility);
}

function borderWidthUtility(utility, width) {
  const value = Math.max(0, Math.min(16, Number(width) || 0));
  const side = utility.match(/^border-([xytblr])(?:-|$)/)?.[1];
  const base = side ? `border-${side}` : "border";
  if (value === 0) return `${base}-0`;
  if (value === 1) return base;
  return `${base}-[${value}px]`;
}

function applyBorderWidth(classes, width) {
  if (width == null) return classes;
  let hasBorder = false;
  let hasWidth = false;
  const tokens = classes.split(/\s+/).filter(Boolean).map((token) => {
    const variantIndex = token.lastIndexOf(":");
    const prefix = variantIndex < 0 ? "" : token.slice(0, variantIndex + 1);
    const utility = token.slice(variantIndex + 1);
    if (utility === "border" || utility.startsWith("border-")) hasBorder = true;
    if (!isBorderWidthUtility(utility)) return token;
    hasWidth = true;
    return `${prefix}${borderWidthUtility(utility, width)}`;
  });
  if (hasBorder && !hasWidth) tokens.push(borderWidthUtility("border", width));
  return [...new Set(tokens)].join(" ");
}

function updateTargetClasses(classes, target, settings, changedKeys) {
  let updated = classes;
  if (changedKeys.has("borderWidth")) updated = applyBorderWidth(updated, settings.borderWidth);
  if (["globalRadius", "cardRadius", "controlRadius"].some((key) => changedKeys.has(key))) {
    updated = updateRadius(updated, target, settings);
  }
  if (changedKeys.has("container") && ["container", "cards"].includes(target)) {
    if (isCustomColor(settings.container)) {
      const shade = settings.mode === "light" ? "50" : "950";
      const color = colorUtility("bg-", customSurfaceColor(settings.container, settings.mode, shade));
      updated = updated
        .replace(/\bbg-\[#(?:[\da-f]{3}|[\da-f]{6})\]/gi, color)
        .replace(COLORED_BACKGROUND_CLASS, color);
    } else {
      updated = updated
        .replace(/\bbg-\[#(?:[0-9a-fA-F]{3,8})\]/g, `bg-${settings.container}-${settings.mode === "light" ? "50" : "950"}`)
        .replace(COLORED_BACKGROUND_CLASS, (_, shade, opacity) => `bg-${settings.container}-${shade}${opacity || ""}`);
    }
  }
  if (changedKeys.has("heading") && ["heading", "cards", "actions"].includes(target)) {
    updated = replaceTextColor(updated, modeTextUtility(settings.heading, "900", settings));
  }
  if (changedKeys.has("body") && ["body", "cards"].includes(target)) {
    updated = replaceTextColor(updated, modeTextUtility(settings.body, "700", settings));
  }
  if (changedKeys.has("accent")) {
    const hasAccent = HUE_CLASSES.test(updated);
    HUE_CLASSES.lastIndex = 0;
    updated = updated.replace(HUE_CLASSES, (_, prefix, shade) => {
      const selectedShade = prefix === "text-"
        ? settings.mode === "light" ? "700" : "400"
        : prefix === "bg-" ? "700" : shade.replace(/\/\d+$/, "");
      return prefix === "text-"
        ? accentTextUtility(settings)
        : colorUtility(prefix, settings.accent, selectedShade, shade.match(/\/\d+/)?.[0] || "");
    });
    if (!hasAccent && target === "heading") updated = `${updated} ${accentTextUtility(settings)}`;
    if (target === "actions") {
      const hadBackground = /\bbg-(?:zinc|neutral|stone|gray|slate)-\d{2,3}\b/.test(updated);
      const accentBackground = colorUtility("bg-", settings.accent, isCustomColor(settings.accent) ? "600" : "700");
      if (hadBackground) updated = updated.replace(/\bbg-(?:zinc|neutral|stone|gray|slate)-\d{2,3}(?:\/\d+)?\b/, accentBackground);
      else if (!/\bbg-[\w-]+\b/.test(updated)) updated = `${updated} ${accentBackground}`;
      updated = replaceTextColor(updated, accentForegroundUtility(settings));
    }
    if (!hasAccent && ["cards", "container"].includes(target)) updated = `${updated} ring-1 ${colorUtility("ring-", settings.accent, "400")}`;
  }
  if (changedKeys.has("border")) {
    const hadBorderColor = BORDER_COLOR_CLASS.test(updated);
    BORDER_COLOR_CLASS.lastIndex = 0;
    updated = updated.replace(BORDER_COLOR_CLASS, modeBorderUtility(settings));
    if (!hadBorderColor && /\bborder(?:-\d+)?\b/.test(updated)) {
      updated = `${updated} ${modeBorderUtility(settings)}`;
    }
  }
  if (changedKeys.has("hover")) {
    updated = updated
      .replace(/\b(?:hover:shadow-xl|hover:scale-105|hover:scale-\[1\.02\]|transform-3d|hover:rotate-x-3|hover:rotate-y-3|hover:-translate-y-1|hover:shadow-lg)\b/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
    const hover = settings.hover === "gradient"
      ? `${HOVER_CLASSES.gradient} hover:${colorUtility("border-", settings.accent, "400")}`
      : HOVER_CLASSES[settings.hover] || "";
    if (hover) updated = `${updated} ${hover}`;
  }
  if (changedKeys.has("animation") && ["heading", "body"].includes(target)) {
    updated = updated
      .replace(/\b(?:animate-\[[^\]]+\]|motion-reduce:animate-none|delay-\d+)\b/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
    const animation = ANIMATION_CLASSES[settings.animation] || "";
    if (animation) updated = `${updated} ${animation}`;
  }
  return updated;
}

function addAnimationKeyframes(source) {
  if (source.includes("@keyframes typewriter")) return source;
  const componentStart = source.indexOf("export default function");
  if (componentStart < 0) return source;
  const rootTag = /return\s*(?:\(\s*)?(?:<>[\s\S]*?)?(<(?:section|div|main|article|header)\b[^>]*>)/.exec(source.slice(componentStart));
  if (!rootTag) return source;
  const insertionPoint = componentStart + rootTag.index + rootTag[0].length;
  return `${source.slice(0, insertionPoint)}<style>{\`${ANIMATION_KEYFRAMES}\`}</style>${source.slice(insertionPoint)}`;
}

export function customizeSource(source, settings) {
  const isLight = settings.mode === "light";
  let code = refineSource(source).replace(RADIUS_CLASS, radiusUtility(settings.globalRadius));
  code = mapClassAttribute(code, (tag) => ["div", "article", "section", "main", "aside"].includes(tag), (classes) =>
    replaceRadius(classes, settings.cardRadius),
  );
  code = mapClassAttribute(code, (tag) => ["button", "a", "input", "select"].includes(tag), (classes) =>
    replaceRadius(classes, settings.controlRadius),
  );
  code = mapClassAttribute(code, () => true, (classes) => applyBorderWidth(classes, settings.borderWidth));

  if (isCustomColor(settings.container)) {
    const surfaceShade = isLight ? "50" : "950";
    const subcontainerShade = isLight ? "100" : "900";
    const surface = colorUtility("bg-", customSurfaceColor(settings.container, settings.mode, surfaceShade));
    const subcontainer = colorUtility("bg-", customSurfaceColor(settings.container, settings.mode, subcontainerShade));
    code = code.replace(/\bbg-\[#(?:[\da-f]{3}|[\da-f]{6})\]/gi, surface);
    code = isLight
      ? code
        .replace(/\bbg-black\b/g, surface)
        .replace(/\bbg-(?:zinc|neutral|stone|gray|slate)-(?:800|900|950)(\/\d+)?\b/g, (_, opacity = "") =>
          colorUtility("bg-", customSurfaceColor(settings.container, settings.mode, surfaceShade), surfaceShade, opacity))
      : code
        .replace(/\bbg-white\b|\bbg-(?:zinc|neutral|stone|gray|slate)-(?:50|100|200|800|900)(\/\d+)?\b/g, (_, opacity = "") =>
          colorUtility("bg-", customSurfaceColor(settings.container, settings.mode, subcontainerShade), subcontainerShade, opacity))
        .replace(/\bbg-(?:zinc|neutral|stone|gray|slate)-950(\/\d+)?\b/g, (_, opacity = "") =>
          colorUtility("bg-", customSurfaceColor(settings.container, settings.mode, surfaceShade), surfaceShade, opacity));
  } else {
    const surfaceMarker = "__studio_surface_color__";
    const subcontainerMarker = "__studio_subcontainer_color__";
    code = code.replace(/\bbg-\[#(?:[0-9a-fA-F]{3,8})\]/g, surfaceMarker);
    code = isLight
      ? code
        .replace(/\bbg-black\b/g, surfaceMarker)
        .replace(/\bbg-(?:zinc|neutral|stone|gray|slate)-(?:800|900|950)(\/\d+)?\b/g, (_, opacity = "") => `${surfaceMarker}${opacity}`)
      : code.replace(/\bbg-black\b|\bbg-white\b|\bbg-(?:zinc|neutral|stone|gray|slate)-(?:50|100|200|800|900|950)(\/\d+)?\b/g, (_, opacity = "") => `${subcontainerMarker}${opacity}`);
  }
  code = code.replace(HUE_CLASSES, (_, prefix, shade) => {
    if (prefix === "text-") return accentTextUtility(settings);
    const selectedShade = prefix === "bg-" ? "700" : shade.replace(/\/\d+$/, "");
    const opacity = prefix === "bg-" ? shade.match(/\/\d+/)?.[0] || "" : "";
    return colorUtility(prefix, settings.accent, selectedShade, opacity);
  });
  code = code
    .replaceAll("__studio_surface_color__", `bg-${settings.container}-${isLight ? "50" : "950"}`)
    .replaceAll("__studio_subcontainer_color__", `bg-${settings.container}-${isLight ? "50" : "900"}`);
  const headingColor = modeTextUtility(settings.heading, "900", settings);
  const bodyColor = modeTextUtility(settings.body, "700", settings);
  const onAccentColor = accentForegroundUtility(settings);
  const accentBackgroundClass = isCustomColor(settings.accent)
    ? `bg-[${cssColor(settings.accent)}]`
    : `bg-${settings.accent}-700`;
  const neutralTextClass = /\btext-(?:white|black)(?:\/\d+)?\b|\btext-(?:slate|zinc|neutral|stone|gray)-\d{2,3}(?:\/\d+)?\b/gi;
  code = code.replace(neutralTextClass, bodyColor);
  code = code.replace(/\btext-\[#([\da-f]{3}|[\da-f]{6})\]/gi, (_, hex) => {
    const safeColor = ensureContrast(`#${hex}`, surfaceColor(settings));
    return `text-[${safeColor}]`;
  });
  code = mapClassAttribute(code, (tag, classes) =>
    (tag === "button" || tag === "a") && classes.split(/\s+/).includes(accentBackgroundClass),
    (classes) => replaceTextColor(classes, onAccentColor),
  );
  code = mapClassAttribute(code, (tag) => /^h[1-6]$/.test(tag), (classes) => replaceTextColor(classes, headingColor));
  code = mapClassAttribute(code, (tag) => ["p", "li", "blockquote", "small"].includes(tag), (classes) => replaceTextColor(classes, bodyColor));
  code = code.replace(BORDER_COLOR_CLASS, modeBorderUtility(settings));
  BORDER_COLOR_CLASS.lastIndex = 0;

  const hover = settings.hover === "gradient"
    ? `${HOVER_CLASSES.gradient} hover:${colorUtility("border-", settings.accent, "400")}`
    : HOVER_CLASSES[settings.hover] || "";
  if (hover) {
    code = mapClassAttribute(code, (tag) => tag === "button" || tag === "a", (classes) =>
      classes.includes(hover) ? classes : `${classes} ${hover}`,
    );
  }
  const animation = ANIMATION_CLASSES[settings.animation] || "";
  if (animation) {
    let staggerIndex = 0;
    code = mapClassAttribute(code, (tag) => /^h[1-6]$/.test(tag) || tag === "p", (classes) => {
      if (classes.includes(animation)) return classes;
      const delay = settings.animation === "stagger" ? ` delay-${Math.min(++staggerIndex, 8) * 100}` : "";
      return `${classes} ${animation}${delay}`;
    });
    code = addAnimationKeyframes(code);
  }
  const overrides = settings.elementOverrides || {};
  for (const [target, targetOverrides] of Object.entries(overrides)) {
    const changedKeys = new Set(Object.keys(targetOverrides).filter((key) => TARGET_CAPABILITIES[target]?.includes(key)));
    if (!changedKeys.size) continue;
    const targetSettings = { ...settings, ...targetOverrides };
    code = mapClassAttribute(
      code,
      (tag, classes) => matchesTarget(tag, classes, target),
      (classes) => updateTargetClasses(classes, target, targetSettings, changedKeys),
    );
  }
  if (Object.entries(overrides).some(([target, targetOverrides]) =>
    ["heading", "body"].includes(target) && targetOverrides.animation && targetOverrides.animation !== "none",
  )) {
    code = addAnimationKeyframes(code);
  }
  return code;
}

export const COLOR_OPTIONS = {
  container: TAILWIND_COLORS,
  heading: ["text-slate-50", "text-emerald-50", "text-cyan-100", "text-orange-50", "text-blue-50", "text-amber-50", "text-rose-50", "text-violet-50"],
  body: ["text-slate-300", "text-emerald-200", "text-cyan-200", "text-orange-100", "text-blue-100", "text-amber-100", "text-rose-200", "text-violet-200"],
  accent: TAILWIND_COLORS,
  border: ["border-slate-400/20", "border-emerald-300/20", "border-cyan-400/30", "border-orange-200/30", "border-blue-200/25", "border-amber-200/30", "border-rose-300/25", "border-violet-300/25"],
};
