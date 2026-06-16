import type { CookieConsentConfig } from "@ajitbubu/cookie-banner-sdk";
import { TEMPLATES, applyTemplate, isTemplateActive } from "../templates";
import { PanelHeader } from "./ui";

export function TemplatesPanel({
  config,
  onChange,
}: {
  config: Partial<CookieConsentConfig>;
  onChange: (patch: Partial<CookieConsentConfig>) => void;
}) {
  return (
    <div>
      <PanelHeader
        title="Templates"
        sub="Ready-made starting points. Picking one sets the look, position, GPC, and consent model — your cookie lists are kept. Fine-tune in the other panels after."
      />
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map((t) => {
          const active = isTemplateActive(config, t);
          return (
            <button
              key={t.id}
              onClick={() => onChange(applyTemplate(config, t))}
              aria-pressed={active}
              className={`rounded-xl border p-4 text-left transition-colors ${
                active ? "border-blue-600 ring-1 ring-blue-600" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="mb-3 flex items-center gap-1.5">
                {["--cc-bg", "--cc-fg", "--cc-accent"].map((v) => (
                  <span
                    key={v}
                    className="h-6 w-6 rounded-full border border-gray-200"
                    style={{ background: t.theme[v] ?? "#fff" }}
                  />
                ))}
                <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                  {t.tag}
                </span>
              </div>
              <div className="text-sm font-semibold">{t.name}</div>
              <p className="mt-1 text-xs leading-snug text-gray-500">{t.description}</p>
              <div className="mt-2 flex gap-1.5 text-[10px] text-gray-500">
                <span className="rounded bg-gray-100 px-1.5 py-0.5">{t.position.banner} bar</span>
                <span className="rounded bg-gray-100 px-1.5 py-0.5">
                  {t.consentModel === "opt-out" ? "opt-out" : "opt-in"}
                </span>
                {t.honorGpc && <span className="rounded bg-gray-100 px-1.5 py-0.5">GPC</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
