// Runs INSIDE the preview iframe. Receives a config via postMessage and renders
// the real SDK banner. Resets consent before each init so the banner always shows
// (eng-review TE2: destroy -> clear consent -> init). Verifies message origin.
import { init, type CookieConsentInstance, type CookieConsentConfig } from "@ajitbubu/cookie-banner-sdk";

type Msg = { type: "cc-config"; config: Partial<CookieConsentConfig>; state?: "banner" | "returning" };

let instance: CookieConsentInstance | null = null;
let prevName: string | null = null;
let renderSeq = 0;
const ORIGIN = window.location.origin;

function clearCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; Path=/`;
}

function render(config: Partial<CookieConsentConfig>, state: "banner" | "returning") {
  const errEl = document.getElementById("cc-error");
  try {
    instance?.destroy();
  } catch {
    /* ignore */
  }
  // Use a UNIQUE cookie name per render. This isolates each preview from prior
  // state in BOTH the cookie AND the SDK's in-memory fallback store (which a
  // plain clearCookie can't reach) — code-review #8. Clear the previous one to
  // avoid cookie buildup in the iframe.
  if (prevName) clearCookie(prevName);
  const cookieName = `${config.cookieName || "cc_consent"}__preview${++renderSeq}`;
  prevName = cookieName;
  const renderConfig: Partial<CookieConsentConfig> = { ...config, cookieName };
  // Reset the SDK's double-init guard so re-init re-renders.
  (window as unknown as Record<string, unknown>).__cookieConsentInitialized = undefined;

  if (state === "returning") {
    // Seed a prior-consent cookie so the SDK shows the floating button, not the banner.
    // Reflect the configured default state so "Returning" shows what a real
    // returning visitor's stored choices would look like (code-review #4).
    const cats = config.categories;
    const rec = {
      schemaVersion: 1,
      version: config.consentVersion ?? 1,
      timestamp: new Date(0).toISOString(),
      categories: {
        necessary: true,
        analytics: cats?.analytics?.enabled ?? false,
        functional: cats?.functional?.enabled ?? false,
        marketing: cats?.marketing?.enabled ?? false,
      },
    };
    document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(rec))}; Path=/`;
  }

  try {
    instance = init(renderConfig);
    if (errEl) errEl.style.display = "none";
  } catch {
    if (errEl) errEl.style.display = "flex";
  }
}

window.addEventListener("message", (e: MessageEvent) => {
  if (e.origin !== ORIGIN) return; // origin verification (TE2 hardening)
  const data = e.data as Msg | undefined;
  if (!data || data.type !== "cc-config") return;
  render(data.config, data.state ?? "banner");
});

// Tell the parent we're ready to receive config.
window.parent?.postMessage({ type: "cc-preview-ready" }, ORIGIN);
