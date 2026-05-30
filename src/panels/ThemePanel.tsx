import type { CookieConsentConfig } from "cookie-banner-sdk";
import { checkContrast } from "../lib/contrast";

type Theme = Record<string, string>;

// SDK default palette — contrast is checked on EFFECTIVE colors, so unset vars
// fall back to these defaults (design-review hardening).
const DEFAULTS: Record<string, string> = {
  "--cc-bg": "#ffffff",
  "--cc-fg": "#111827",
  "--cc-accent": "#2563eb",
  "--cc-accent-fg": "#ffffff",
  "--cc-heading-color": "#111827",
};

const FIELDS: { var: string; label: string; against?: string }[] = [
  { var: "--cc-bg", label: "Background" },
  { var: "--cc-fg", label: "Text", against: "--cc-bg" },
  { var: "--cc-accent", label: "Accent", against: "--cc-bg" },
  { var: "--cc-accent-fg", label: "Accent text", against: "--cc-accent" },
  { var: "--cc-heading-color", label: "Heading", against: "--cc-bg" },
];

export function ThemePanel({
  config,
  onChange,
}: {
  config: Partial<CookieConsentConfig>;
  onChange: (patch: Partial<CookieConsentConfig>) => void;
}) {
  const theme: Theme = config.theme ?? {};
  const eff = (v: string) => theme[v] ?? DEFAULTS[v] ?? "#000000";

  function setVar(name: string, value: string) {
    onChange({ theme: { ...theme, [name]: value } });
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Theme</h2>
      <p className="mb-4 text-sm text-gray-500">
        Colors, type, and shape. Contrast is checked live against WCAG AA.
      </p>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        {FIELDS.map((f) => {
          const value = eff(f.var);
          const result = f.against ? checkContrast(value, eff(f.against)) : null;
          return (
            <div key={f.var} className="mb-4 last:mb-0">
              <label className="mb-1.5 block text-sm font-semibold" htmlFor={f.var}>
                {f.label}
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  aria-label={`${f.label} color`}
                  value={value}
                  onChange={(e) => setVar(f.var, e.target.value)}
                  className="h-8 w-9 cursor-pointer rounded border border-gray-300"
                />
                <input
                  id={f.var}
                  value={value}
                  onChange={(e) => setVar(f.var, e.target.value)}
                  className="w-28 rounded-md border border-gray-300 px-2.5 py-1.5 font-mono text-sm"
                />
                {result && <ContrastBadge ratio={result.ratio} pass={result.passAA} />}
              </div>
            </div>
          );
        })}
        <Slider
          label="Font size"
          unit="px"
          min={12}
          max={20}
          value={parseInt(theme["--cc-font-size"] ?? "14", 10)}
          onChange={(n) => setVar("--cc-font-size", `${n}px`)}
        />
        <Slider
          label="Corner radius"
          unit="px"
          min={0}
          max={20}
          value={parseInt(theme["--cc-radius"] ?? "10", 10)}
          onChange={(n) => setVar("--cc-radius", `${n}px`)}
        />
      </div>
    </div>
  );
}

function ContrastBadge({ ratio, pass }: { ratio: number; pass: boolean }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
        pass
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-600"
      }`}
    >
      AA {ratio.toFixed(1)}:1 {pass ? "✓" : "✕"}
    </span>
  );
}

function Slider({
  label,
  unit,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="mt-4">
      <label className="mb-1.5 block text-sm font-semibold">
        {label} — {value}
        {unit}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
