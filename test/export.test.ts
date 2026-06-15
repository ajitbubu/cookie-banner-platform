import { describe, it, expect } from "vitest";
import { toConfigJson, toInitSnippet, toGtmHeadSnippet, toPlatformSnippet } from "../src/lib/export";

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

  it("platform snippet bakes site key + ingest + config and loads the hosted core", () => {
    const s = toPlatformSnippet(cfg, { siteKey: "site_abc123" });
    expect(s).toContain("window.__CC_SITE__");
    expect(s).toContain('"key": "site_abc123"');
    expect(s).toContain("/ingest");
    expect(s).toContain("consent-core@stable.js");
    expect(s).toContain("cc_demo"); // config is baked in
    expect(s).not.toContain("onConsent"); // function stripped
  });

  it("platform snippet honors custom bases", () => {
    const s = toPlatformSnippet(cfg, {
      siteKey: "k",
      cdnBase: "https://cdn.acme.io/c",
      ingestBase: "https://app.acme.io",
      coreChannel: "v2",
    });
    expect(s).toContain("https://cdn.acme.io/c/consent-core@v2.js");
    expect(s).toContain("https://app.acme.io/ingest");
  });
});
