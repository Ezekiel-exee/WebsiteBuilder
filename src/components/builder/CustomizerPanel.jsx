import { colorToHex, ELEMENT_TARGETS, TARGET_CAPABILITIES, THEMES } from "../../utils/customizer";
import ColorPicker from "./ColorPicker";

const HOVER_OPTIONS = [
  ["glow", "Glow / shadow"],
  ["scale", "Scale up (105%)"],
  ["tilt", "3D tilt"],
  ["lift", "Subtle lift"],
  ["gradient", "Border / color shift"],
  ["none", "None"],
];
const ANIMATION_OPTIONS = [
  ["none", "None"],
  ["counter", "Counter roll-up"],
  ["fade", "Fade + slide up"],
  ["typewriter", "Typewriter"],
  ["glitch", "Glitch"],
  ["stagger", "Staggered reveal"],
];

function SelectControl({ label, value, options, onChange, disabled = false, title }) {
  return (
    <label className={`grid gap-1 text-[11px] font-medium ${disabled ? "cursor-not-allowed text-zinc-600" : "text-zinc-400"}`} title={disabled ? title || "This setting does not apply to the selected element." : undefined}>
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-8 min-w-0 rounded-md border border-white/10 bg-zinc-950 px-2 text-xs text-zinc-100 outline-none transition enabled:focus:border-cyan-400/60 enabled:focus:ring-2 enabled:focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {options.map(([optionValue, optionLabel, optionDisabled]) => (
          <option key={optionValue} value={optionValue} disabled={optionDisabled}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}

const RADIUS_CORNERS = [
  ["topLeft", "TL"],
  ["topRight", "TR"],
  ["bottomRight", "BR"],
  ["bottomLeft", "BL"],
];

function CornerRadiusControl({ label, radiusKey, value, onChange, disabled = false }) {
  const radius = typeof value === "object"
    ? value
    : { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12, linked: true };
  const updateRadius = (update) => onChange((current) => ({
    ...current,
    [radiusKey]: update(typeof current[radiusKey] === "object" ? current[radiusKey] : radius),
  }));
  const toggleLinked = () => updateRadius((current) => {
    if (current.linked) return { ...current, linked: false };
    const linkedValue = current.topLeft;
    return { topLeft: linkedValue, topRight: linkedValue, bottomRight: linkedValue, bottomLeft: linkedValue, linked: true };
  });

  return (
    <fieldset aria-label={label} disabled={disabled} className={`min-w-0 ${disabled ? "opacity-40" : ""}`}>
      <legend className="sr-only">{label}</legend>
      <div className="mb-1 flex items-center justify-between gap-1">
        <span className="text-[10px] font-medium text-zinc-400">{label}</span>
        <button
          type="button"
          aria-label={`${radius.linked ? "Unlink" : "Link"} ${label} corners`}
          aria-pressed={Boolean(radius.linked)}
          onClick={toggleLinked}
          className="rounded px-1.5 py-0.5 text-[9px] font-medium text-cyan-300 transition hover:bg-cyan-400/10 disabled:cursor-not-allowed"
        >
          {radius.linked ? "Linked" : "Link corners"}
        </button>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {RADIUS_CORNERS.map(([key, shortLabel]) => (
          <label key={key} className="grid min-w-0 gap-0.5 text-center text-[8px] uppercase text-zinc-600">
            {shortLabel}
            <input
              aria-label={`${label} ${key.replace(/([A-Z])/g, " $1").toLowerCase()} radius in pixels`}
              type="number"
              min="0"
              max="256"
              step="1"
              value={radius[key] ?? 0}
              onChange={(event) => {
                const nextValue = Math.max(0, Math.min(256, Number(event.target.value) || 0));
                updateRadius((current) => current.linked
                  ? { topLeft: nextValue, topRight: nextValue, bottomRight: nextValue, bottomLeft: nextValue, linked: true }
                  : { ...current, [key]: nextValue });
              }}
              className="h-7 w-full min-w-0 rounded border border-white/10 bg-zinc-900 px-1 text-center font-mono text-[10px] text-white outline-none focus:border-cyan-400/60 disabled:cursor-not-allowed"
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function LineThicknessControl({ value, onChange, disabled = false }) {
  const isOriginal = value == null;
  const thickness = isOriginal ? 1 : Number(value);
  return (
    <fieldset aria-label="Line thickness" disabled={disabled} className={`grid gap-1.5 ${disabled ? "opacity-40" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <legend className="text-[11px] font-medium text-zinc-400">Line thickness</legend>
        <output className="font-mono text-[10px] text-zinc-300">{isOriginal ? "Original" : `${thickness}px`}</output>
      </div>
      <div className="flex items-center gap-2">
        <input
          aria-label="Line thickness in pixels"
          aria-valuetext={isOriginal ? "Original component widths" : `${thickness} pixels`}
          type="range"
          min="0"
          max="8"
          step="1"
          value={thickness}
          onChange={(event) => {
            const nextWidth = Number(event.target.value);
            onChange((current) => ({ ...current, borderWidth: nextWidth }));
          }}
          className="h-1.5 min-w-0 flex-1 cursor-pointer accent-cyan-400 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          disabled={isOriginal}
          onClick={() => onChange((current) => ({ ...current, borderWidth: null }))}
          className="rounded border border-white/10 px-2 py-1 text-[9px] text-zinc-400 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Original
        </button>
      </div>
      <p className="text-[9px] text-zinc-600">Auto keeps the component&apos;s authored border widths.</p>
    </fieldset>
  );
}

export default function CustomizerPanel({ settings, onChange, componentOptions, selectedComponentId, onSelectComponent, selectedTarget, onSelectTarget, availableTargets, onReset }) {
  const supported = new Set(TARGET_CAPABILITIES[selectedTarget] || []);
  const update = (key, value, isColor = false) => onChange((current) => ({ ...current, [key]: value, ...(isColor ? { theme: "custom" } : {}) }));

  const chooseTheme = (id) => {
    if (id === "custom") {
      onChange((current) => ({ ...current, theme: "custom" }));
      return;
    }
    const theme = THEMES[id];
    onChange((current) => ({ ...current, ...theme, theme: id }));
  };
  const palettes = Object.entries(THEMES).map(([id, theme]) => [id, theme]);
  if (settings.theme === "custom") palettes.push(["custom", { ...settings, label: "Custom palette" }]);
  const themeColors = (theme) => [
    colorToHex(theme.container, "container"),
    colorToHex(theme.heading, "heading"),
    colorToHex(theme.body, "body"),
    colorToHex(theme.accent, "accent"),
    colorToHex(theme.border, "border"),
  ];

  return (
    <section aria-label="Customizer control panel" className="rounded-xl border border-white/10 bg-zinc-950/95 p-3 shadow-xl shadow-black/30">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-white">Studio controls</h4>
          <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">Changes apply only to the selected component and its code export.</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-white/10 px-2.5 py-1 text-[11px] font-medium text-zinc-400 transition hover:border-white/20 hover:text-white"
        >
          Reset component
        </button>
      </div>

      <SelectControl
        label="Component to customize"
        value={selectedComponentId}
        options={componentOptions.map((component) => [component.id, component.label])}
        onChange={onSelectComponent}
      />
      <SelectControl
        label="Element scope"
        value={selectedTarget}
        options={ELEMENT_TARGETS.map((target) => [target.id, target.label, !availableTargets.includes(target.id)])}
        onChange={onSelectTarget}
      />

      <fieldset className="mt-4 border-t border-white/10 pt-3">
        <legend className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Color themes</legend>
        <p className="mb-2 text-[10px] text-zinc-600">Choose a shared palette or customize individual colors.</p>
        <div className="grid grid-cols-2 gap-2">
          {palettes.map(([id, theme]) => {
            const selected = settings.theme === id;
            return (
              <button
                key={id}
                type="button"
                aria-label={`${theme.label} theme`}
                aria-pressed={selected}
                disabled={!supported.has("theme")}
                onClick={() => chooseTheme(id)}
                className={`min-w-0 rounded-lg border p-2 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${selected ? "border-cyan-400/70 bg-cyan-400/10 ring-1 ring-cyan-400/20" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}
              >
                <span className="block truncate text-[10px] font-medium text-zinc-200">{theme.label}</span>
                <span className="mt-1.5 flex gap-1" aria-hidden="true">
                  {themeColors(theme).map((color, index) => (
                    <span key={`${color}-${index}`} className="h-3 w-3 rounded-full border border-white/15" style={{ backgroundColor: color }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
        <SelectControl
          label="Color mode"
          value={settings.mode}
          options={[["dark", "Dark"], ["light", "Light"]]}
          onChange={(value) => update("mode", value)}
          disabled={!supported.has("mode")}
        />
        <SelectControl label="Hover interaction" value={settings.hover} options={HOVER_OPTIONS} onChange={(value) => update("hover", value)} disabled={!supported.has("hover")} />
        <SelectControl label="Text / number animation" value={settings.animation} options={ANIMATION_OPTIONS} onChange={(value) => update("animation", value)} disabled={!supported.has("animation")} />
      </div>

      <div className="mt-4 grid gap-3 border-t border-white/10 pt-3">
        <CornerRadiusControl label="Global radius" radiusKey="globalRadius" value={settings.globalRadius} onChange={onChange} disabled={!supported.has("globalRadius")} />
        <CornerRadiusControl label="Card / section radius" radiusKey="cardRadius" value={settings.cardRadius} onChange={onChange} disabled={!supported.has("cardRadius")} />
        <CornerRadiusControl label="Button / input radius" radiusKey="controlRadius" value={settings.controlRadius} onChange={onChange} disabled={!supported.has("controlRadius")} />
        <LineThicknessControl value={settings.borderWidth} onChange={onChange} disabled={!supported.has("borderWidth")} />
      </div>

      <div className="mt-4 grid gap-3 border-t border-white/10 pt-3">
        <div className={`grid gap-1 text-[11px] font-medium ${supported.has("container") ? "text-zinc-400" : "cursor-not-allowed text-zinc-600"}`}>
          <span>Containers / backgrounds</span>
          <ColorPicker label="Containers / backgrounds" kind="container" value={settings.container} onChange={(value) => update("container", value, true)} disabled={!supported.has("container")} />
        </div>
        <div className={`grid gap-1 text-[11px] font-medium ${supported.has("heading") ? "text-zinc-400" : "cursor-not-allowed text-zinc-600"}`}>
          <span>Title / heading</span>
          <ColorPicker label="Title / heading" kind="heading" value={settings.heading} onChange={(value) => update("heading", value, true)} disabled={!supported.has("heading")} />
        </div>
        <div className={`grid gap-1 text-[11px] font-medium ${supported.has("body") ? "text-zinc-400" : "cursor-not-allowed text-zinc-600"}`}>
          <span>Body / content text</span>
          <ColorPicker label="Body / content text" kind="body" value={settings.body} onChange={(value) => update("body", value, true)} disabled={!supported.has("body")} />
        </div>
        <div className={`grid gap-1 text-[11px] font-medium ${supported.has("accent") ? "text-zinc-400" : "cursor-not-allowed text-zinc-600"}`}>
          <span>Primary accents</span>
          <ColorPicker label="Primary accents" kind="accent" value={settings.accent} onChange={(value) => update("accent", value, true)} disabled={!supported.has("accent")} />
        </div>
        <div className={`grid gap-1 text-[11px] font-medium ${supported.has("border") ? "text-zinc-400" : "cursor-not-allowed text-zinc-600"}`}>
          <span>Borders / dividers</span>
          <ColorPicker label="Borders / dividers" kind="border" value={settings.border} onChange={(value) => update("border", value, true)} disabled={!supported.has("border")} />
        </div>
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-zinc-600">Element-specific edits stay scoped to this component. Unsupported controls stay disabled.</p>
    </section>
  );
}
