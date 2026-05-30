import { describe, it, expect } from "vitest";
import { toConfigJson, toInitSnippet, toGtmHeadSnippet } from "../src/lib/export";

const cfg = {
  cookieName: "cc_demo",
  onConsent: () => {}, // function — must be stripped
  theme: { "--cc-accent": "#2563eb" },
};

describe("export", () => {
  it("strips non-serializable onConsent from JSON", () => {
    const json = toConfigJson(cfg);
    expect(json).not.toContain("onConsent");
    expect(JSON.parse(json).cookieName).toBe("cc_demo");
  });

  it("init snippet loads the main bundle and calls init", () => {
    const s = toInitSnippet(cfg);
    expect(s).toContain("cookie-consent.global.js");
    expect(s).toContain("CookieConsent.init(");
  });

  it("GTM head snippet keeps the critical script order: bootstrap < GTM < SDK", () => {
    const { head, body } = toGtmHeadSnippet(cfg, "GTM-ABC123");
    const iBootstrap = head.indexOf("cc-bootstrap.global.js");
    const iGtm = head.indexOf("googletagmanager.com/gtm.js");
    const iSdk = head.indexOf("cookie-consent.global.js");
    expect(iBootstrap).toBeGreaterThan(-1);
    expect(iBootstrap).toBeLessThan(iGtm);
    expect(iGtm).toBeLessThan(iSdk);
    expect(head).toContain("GTM-ABC123");
    expect(body).toContain("GTM-ABC123");
  });
});
