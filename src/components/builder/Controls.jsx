import { useRef } from "react";
import Icon from "./Icon";

export const DEVICES = [
  { id: "desktop", label: "Desktop", width: "100%" },
  { id: "tablet", label: "Tablet", width: "768px" },
  { id: "mobile", label: "Mobile", width: "390px" },
];

export function SegmentedControl({ options, value, onChange, ariaLabel, className = "" }) {
  const group = useRef(null);

  // Radio-group keyboard pattern: arrows move + select, only the checked option is in the tab order.
  const handleKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const index = options.findIndex((opt) => opt.id === value);
    const next = options[(index + step + options.length) % options.length];
    onChange(next.id);
    group.current?.querySelector(`[data-option="${next.id}"]`)?.focus();
  };

  return (
    <div ref={group} role="radiogroup" aria-label={ariaLabel} onKeyDown={handleKeyDown} className={`inline-flex rounded-lg border border-white/10 bg-zinc-900 p-0.5 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="radio"
          data-option={opt.id}
          aria-checked={value === opt.id}
          aria-label={opt.showLabel ? undefined : opt.label}
          tabIndex={value === opt.id ? 0 : -1}
          title={opt.label}
          onClick={() => onChange(opt.id)}
          className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${
            value === opt.id ? "bg-white/10 text-white shadow-inner" : "text-zinc-400 hover:text-zinc-100"
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
  return <SegmentedControl ariaLabel="Preview device" options={DEVICES} value={value} onChange={onChange} className="max-sm:hidden" />;
}

const VIEW_OPTIONS = [
  { id: "preview", label: "Preview", icon: "eye", showLabel: true },
  { id: "code", label: "Code", icon: "code", showLabel: true },
];

export function ViewSwitcher({ value, onChange }) {
  return <SegmentedControl ariaLabel="View mode" options={VIEW_OPTIONS} value={value} onChange={onChange} />;
}
