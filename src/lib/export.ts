import type { CookieConsentConfig } from "@ajitbubu/cookie-banner-sdk";

// CDN base for the published SDK. The package name `cookie-banner-sdk` is taken
// on npm; publish under a scoped name and update this constant. Until then the
// snippets are copy-ready but the URLs 404 until the package is published.
export const SDK_CDN = "https://cdn.jsdelivr.net/npm/@ajitbubu/cookie-banner-sdk@0.1.0/dist";

// Platform (internal-delivery) install. The agency hosts a versioned consent CORE
// and an ingest endpoint; each client gets a thin stub with its config baked in
// (decisions T1 hybrid + 1A). Swap these bases for your platform's real domains.
export const PLATFORM_CDN = "https://cdn.your-platform.example/consent";
export const PLATFORM_INGEST = "https://app.your-platform.example";
export const CORE_CHANNEL = "stable";

/** Strip non-serializable fields (functions like onConsent). */
export function cleanConfig(config: Partial<CookieConsentConfig>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(config)) {
    if (typeof v === "function") continue; // onConsent is code-only
    clean[k] = v;
  }
  return clean;
}

/** Strip non-serializable fields (functions like onConsent) and stringify. */
export function toConfigJson(config: Partial<CookieConsentConfig>): string {
  return JSON.stringify(cleanConfig(config), null, 2);
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

export interface PlatformSnippetOpts {
  siteKey: string; // public per-client key (the platform assigns the real one)
  cdnBase?: string;
  ingestBase?: string;
  coreChannel?: string;
}

/**
 * Per-client platform install (internal-delivery model). A thin stub bakes the
 * client's config + site key + ingest endpoint into `window.__CC_SITE__`, then
 * loads the hosted, versioned consent CORE which renders the banner and POSTs
 * consent events to the ingest endpoint. Updating the core centrally patches all
 * client sites at once.
 *
 * Decisions baked in:
 *   T1  — config/styling baked per client, but consent logic loads from a hosted
 *         versioned core (`consent-core@<channel>`) so compliance fixes ship fleet-wide.
 *   2A/3A — buffering/retry/idempotency + origin-checked ingest live in the core,
 *         not the stub; the stub only declares where to send events.
 */
export function toPlatformSnippet(
  config: Partial<CookieConsentConfig>,
  opts: PlatformSnippetOpts,
): string {
  const cdn = opts.cdnBase ?? PLATFORM_CDN;
  const ingest = opts.ingestBase ?? PLATFORM_INGEST;
  const channel = opts.coreChannel ?? CORE_CHANNEL;
  const site = {
    key: opts.siteKey,
    ingest: `${ingest}/ingest`,
    config: cleanConfig(config),
  };
  return `<!-- Consent Monitor — paste in <head>. Core updates are pushed centrally; this stub stays put. -->
<script>window.__CC_SITE__ = ${indent(JSON.stringify(site, null, 2), 2)};</script>
<script src="${cdn}/consent-core@${channel}.js" defer></script>`;
}

function indent(s: string, n: number): string {
  const pad = " ".repeat(n);
  return s
    .split("\n")
    .map((line, i) => (i === 0 ? line : pad + line))
    .join("\n");
}
