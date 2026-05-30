import type { CookieConsentConfig } from "@ajitbubu/cookie-banner-sdk";

// CDN base for the published SDK. The package name `cookie-banner-sdk` is taken
// on npm; publish under a scoped name and update this constant. Until then the
// snippets are copy-ready but the URLs 404 until the package is published.
export const SDK_CDN = "https://cdn.jsdelivr.net/npm/@ajitbubu/cookie-banner-sdk@0.1.0/dist";

/** Strip non-serializable fields (functions like onConsent) and stringify. */
export function toConfigJson(config: Partial<CookieConsentConfig>): string {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(config)) {
    if (typeof v === "function") continue; // onConsent is code-only
    clean[k] = v;
  }
  return JSON.stringify(clean, null, 2);
}

/** Minimal install: main bundle + init(). For sites without GTM. */
export function toInitSnippet(config: Partial<CookieConsentConfig>): string {
  return `<script src="${SDK_CDN}/cookie-consent.global.js"></script>
<script>
  CookieConsent.init(${indent(toConfigJson(config), 2)});
  // onConsent is code-only — add a callback here if you don't use GTM:
  // CookieConsent.init({ ...config, onConsent: (categories) => { /* gate your scripts */ } });
</script>`;
}

/**
 * Full GTM-ready <head> block. Script ORDER is the whole point:
 *   1) cc-bootstrap  (pushes Consent Mode default = denied)  — BEFORE GTM
 *   2) GTM container snippet
 *   3) SDK main bundle + init()
 * Plus the <body> noscript fallback. (Eng-review TE3 critical path.)
 */
export function toGtmHeadSnippet(
  config: Partial<CookieConsentConfig>,
  gtmId: string,
): { head: string; body: string } {
  const cookieName = config.cookieName ?? "cc_consent";
  const head = `<!-- 1. Consent default (denied) — MUST be above the GTM snippet -->
<script>window.CC_BOOTSTRAP = ${JSON.stringify({ cookieName })};</script>
<script src="${SDK_CDN}/cc-bootstrap.global.js"></script>

<!-- 2. Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');</script>

<!-- 3. Consent banner SDK -->
<script src="${SDK_CDN}/cookie-consent.global.js"></script>
<script>CookieConsent.init(${indent(toConfigJson(config), 2)});</script>`;
  const body = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;
  return { head, body };
}

function indent(s: string, n: number): string {
  const pad = " ".repeat(n);
  return s
    .split("\n")
    .map((line, i) => (i === 0 ? line : pad + line))
    .join("\n");
}
