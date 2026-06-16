import { describe, it, expect } from "vitest";
import { TEMPLATES, applyTemplate, isTemplateActive, type Template } from "../src/templates";

const byId = (id: string): Template => {
  const t = TEMPLATES.find((x) => x.id === id);
  if (!t) throw new Error(`no template ${id}`);
  return t;
};

describe("template inventory", () => {
  it("ships templates with unique ids and required fields", () => {
    expect(TEMPLATES.length).toBeGreaterThan(0);
    const ids = TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length); // unique
    for (const t of TEMPLATES) {
      expect(t.theme["--cc-bg"]).toBeTruthy();
      expect(["bottom", "top"]).toContain(t.position.banner);
      expect(["opt-in", "opt-out"]).toContain(t.consentModel);
    }
  });
});

describe("applyTemplate", () => {
  it("sets theme, position, and honorGpc from the template", () => {
    const t = byId("gdpr-dark");
    const patch = applyTemplate({}, t);
    expect(patch.theme).toEqual(t.theme);
    expect(patch.position).toEqual(t.position);
    expect(patch.honorGpc).toBe(true);
    // returns a copy, not the template's own objects
    expect(patch.theme).not.toBe(t.theme);
    expect(patch.position).not.toBe(t.position);
  });

  it("opt-in disables non-essential categories by default", () => {
    const patch = applyTemplate({}, byId("gdpr-bar-light"));
    expect(patch.categories!.analytics.enabled).toBe(false);
    expect(patch.categories!.functional.enabled).toBe(false);
    expect(patch.categories!.marketing.enabled).toBe(false);
  });

  it("opt-out enables non-essential categories by default", () => {
    const patch = applyTemplate({}, byId("ccpa-top-notice"));
    expect(patch.categories!.analytics.enabled).toBe(true);
    expect(patch.categories!.functional.enabled).toBe(true);
    expect(patch.categories!.marketing.enabled).toBe(true);
  });

  it("keeps necessary on + locked regardless of model", () => {
    for (const t of TEMPLATES) {
      const patch = applyTemplate({}, t);
      expect(patch.categories!.necessary.enabled).toBe(true);
      expect(patch.categories!.necessary.locked).toBe(true);
    }
  });

  it("preserves existing cookie lists (non-destructive)", () => {
    const existing = {
      categories: {
        necessary: { enabled: true, locked: true, cookies: [{ name: "sid" }] },
        analytics: { enabled: true, cookies: [{ name: "_ga", provider: "Google" }] },
        functional: { cookies: [] },
        marketing: { cookies: [{ name: "_fbp" }] },
      },
    };
    const patch = applyTemplate(existing, byId("gdpr-bar-light"));
    expect(patch.categories!.analytics.cookies).toEqual([{ name: "_ga", provider: "Google" }]);
    expect(patch.categories!.marketing.cookies).toEqual([{ name: "_fbp" }]);
    expect(patch.categories!.necessary.cookies).toEqual([{ name: "sid" }]);
    // but enabled is reset to the template's model (opt-in → off)
    expect(patch.categories!.analytics.enabled).toBe(false);
  });
});

describe("isTemplateActive", () => {
  it("is true when theme + position + gpc match the applied template", () => {
    const t = byId("gdpr-bar-light");
    const patch = applyTemplate({}, t);
    expect(isTemplateActive(patch, t)).toBe(true);
  });

  it("is false for a different template or a tweaked config", () => {
    const t = byId("gdpr-bar-light");
    const patch = applyTemplate({}, t);
    expect(isTemplateActive(patch, byId("gdpr-dark"))).toBe(false);
    expect(isTemplateActive({ ...patch, honorGpc: false }, t)).toBe(false);
  });
});
