// Banner template inventory — ready-made starting points the user picks from.
//
// A template is a fuller starting point than a theme Preset (presets.ts): it sets
// the look (theme), where the banner sits (position), GPC honoring, and the consent
// model (opt-in vs opt-out, expressed as the default enabled-state of non-necessary
// categories). Applying a template is non-destructive to the user's cookie lists —
// it only sets theme/position/honorGpc and each category's `enabled`/`locked`.
//
// Note: the SDK has no banner *layout* field (bar/box/modal/slide-in), only
// position (top/bottom + button corner). Templates therefore differ by look +
// position + consent model, not by layout. Layout variants would need SDK changes.

import type { CookieConsentConfig, CategoryConfig, CategoryKey } from "@ajitbubu/cookie-banner-sdk";
import { PRESETS } from "./presets";

const themeOf = (id: string): Record<string, string> => {
  const p = PRESETS.find((x) => x.id === id);
  if (!p) throw new Error(`templates.ts references unknown preset "${id}"`);
  return p.theme;
};

export type ConsentModel = "opt-in" | "opt-out";

export interface Template {
  id: string;
  name: string;
  description: string;
  tag: string; // jurisdiction / style label, e.g. "GDPR", "CCPA", "Accessible"
  consentModel: ConsentModel; // opt-in = GDPR-style (off by default), opt-out = CCPA-style (on)
  theme: Record<string, string>;
  position: CookieConsentConfig["position"];
  honorGpc: boolean;
}

// Non-necessary categories whose default enabled-state the consent model drives.
// `necessary` is always on + locked and is never toggled by a template.
const OPTIONAL: Exclude<CategoryKey, "necessary">[] = ["analytics", "functional", "marketing"];

export const TEMPLATES: Template[] = [
  {
    id: "gdpr-bar-light",
    name: "GDPR — bottom bar",
    description: "Opt-in, light. Non-essential cookies off until the visitor agrees.",
    tag: "GDPR",
    consentModel: "opt-in",
    theme: themeOf("light"),
    position: { banner: "bottom", button: "bottom-left" },
    honorGpc: true,
  },
  {
    id: "gdpr-dark",
    name: "GDPR — dark",
    description: "Opt-in, dark palette. Good on dark or media-heavy sites.",
    tag: "GDPR",
    consentModel: "opt-in",
    theme: themeOf("dark"),
    position: { banner: "bottom", button: "bottom-right" },
    honorGpc: true,
  },
  {
    id: "ccpa-top-notice",
    name: "CCPA — top notice",
    description: "Opt-out, light. Cookies on by default; visitors can reject.",
    tag: "CCPA",
    consentModel: "opt-out",
    theme: themeOf("light"),
    position: { banner: "top", button: "top-right" },
    honorGpc: true,
  },
  {
    id: "minimal-mono",
    name: "Minimal mono",
    description: "Opt-in, monochrome and understated. Sharp corners.",
    tag: "Minimal",
    consentModel: "opt-in",
    theme: themeOf("minimal"),
    position: { banner: "bottom", button: "bottom-left" },
    honorGpc: true,
  },
  {
    id: "accessible-hc",
    name: "Accessible high-contrast",
    description: "Opt-in, maximum contrast and clear focus for a11y-first sites.",
    tag: "Accessible",
    consentModel: "opt-in",
    theme: themeOf("high-contrast"),
    position: { banner: "bottom", button: "bottom-left" },
    honorGpc: true,
  },
  {
    id: "rounded-brand",
    name: "Rounded brand",
    description: "Opt-in, soft corners and a green accent for friendly brands.",
    tag: "Brand",
    consentModel: "opt-in",
    theme: themeOf("rounded"),
    position: { banner: "bottom", button: "bottom-right" },
    honorGpc: true,
  },
];

function defaultCategories(): Record<CategoryKey, CategoryConfig> {
  return {
    necessary: { enabled: true, locked: true, cookies: [] },
    analytics: { cookies: [] },
    functional: { cookies: [] },
    marketing: { cookies: [] },
  };
}

/**
 * Build the config patch for applying `t` onto the current `config`.
 *
 * Sets theme/position/honorGpc wholesale, and the consent model via each
 * category's `enabled` flag — WITHOUT discarding the user's cookie lists,
 * descriptions, or the locked state. `necessary` is always enabled + locked.
 */
export function applyTemplate(
  config: Partial<CookieConsentConfig>,
  t: Template,
): Partial<CookieConsentConfig> {
  const base = config.categories ?? defaultCategories();
  const enabledDefault = t.consentModel === "opt-out";

  const categories = { ...base } as Record<CategoryKey, CategoryConfig>;
  categories.necessary = { ...(base.necessary ?? { cookies: [] }), enabled: true, locked: true };
  for (const k of OPTIONAL) {
    categories[k] = { ...(base[k] ?? { cookies: [] }), enabled: enabledDefault };
  }

  return {
    theme: { ...t.theme },
    position: { ...t.position },
    honorGpc: t.honorGpc,
    categories,
  };
}

/** True if `config` already reflects template `t` (look + position + GPC). */
export function isTemplateActive(config: Partial<CookieConsentConfig>, t: Template): boolean {
  return (
    JSON.stringify(config.theme ?? {}) === JSON.stringify(t.theme) &&
    JSON.stringify(config.position ?? {}) === JSON.stringify(t.position) &&
    config.honorGpc === t.honorGpc
  );
}
