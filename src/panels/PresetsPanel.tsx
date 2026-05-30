import type { CookieConsentConfig } from "cookie-banner-sdk";
import { PRESETS } from "../presets";
import { PanelHeader } from "./ui";

export function PresetsPanel({
  config,
  onChange,
}: {
  config: Partial<CookieConsentConfig>;
  onChange: (patch: Partial<CookieConsentConfig>) => void;
}) {
  function apply(theme: Record<string, string>) {
    // Replace the theme wholesale so presets are predictable (not merged onto stale vars).
    onChange({ theme });
  }
  const current = JSON.stringify(config.theme ?? {});

  return (
    <div>
      <PanelHeader title="Presets" sub="A starting look. Apply one, then fine-tune in the Theme panel." />
      <div className="grid grid-cols-2 gap-3">
        {PRESETS.map((p) => {
          const active = JSON.stringify(p.theme) === current;
          return (
            <button
              key={p.id}
              onClick={() => apply(p.theme)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                active ? "border-blue-600 ring-1 ring-blue-600" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="mb-3 flex gap-1.5">
                {["--cc-bg", "--cc-fg", "--cc-accent"].map((v) => (
                  <span
                    key={v}
                    className="h-6 w-6 rounded-full border border-gray-200"
                    style={{ background: p.theme[v] ?? "#fff" }}
                  />
                ))}
              </div>
              <div className="text-sm font-semibold">{p.name}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
