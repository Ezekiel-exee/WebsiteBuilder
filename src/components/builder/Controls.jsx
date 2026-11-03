import Icon from "./Icon";

export const DEVICES = [
  { id: "desktop", label: "Desktop", width: "100%" },
  { id: "tablet", label: "Tablet", width: "768px" },
  { id: "mobile", label: "Mobile", width: "390px" },
];

export function SegmentedControl({ options, value, onChange, ariaLabel }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="inline-flex rounded-lg border border-white/10 bg-zinc-900 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="radio"
          aria-checked={value === opt.id}
          title={opt.label}
          onClick={() => onChange(opt.id)}
          className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition ${
            value === opt.id ? "bg-white/10 text-white shadow-inner" : "text-zinc-500 hover:text-zinc-200"
          }`}
        >
          <Icon name={opt.icon || opt.id} className="h-4 w-4" />
          {opt.showLabel && <span>{opt.label}</span>}
        </button>
      ))}
    </div>
  );
}

export function DeviceSwitcher({ value, onChange }) {
  return <SegmentedControl ariaLabel="Preview device" options={DEVICES} value={value} onChange={onChange} />;
}

const VIEW_OPTIONS = [
  { id: "preview", label: "Preview", icon: "eye", showLabel: true },
  { id: "code", label: "Code", icon: "code", showLabel: true },
];

export function ViewSwitcher({ value, onChange }) {
  return <SegmentedControl ariaLabel="View mode" options={VIEW_OPTIONS} value={value} onChange={onChange} />;
}
