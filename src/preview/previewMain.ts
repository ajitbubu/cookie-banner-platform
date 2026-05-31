// Runs INSIDE the preview iframe. Receives a config via postMessage and renders
// the real SDK banner. Resets consent before each init so the banner always shows
// (eng-review TE2: destroy -> clear consent -> init). Verifies message origin.
import { init, type CookieConsentInstance, type CookieConsentConfig } from "@ajitbubu/cookie-banner-sdk";

type Msg = { type: "cc-config"; config: Partial<CookieConsentConfig>; state?: "banner" | "returning" };

let instance: CookieConsentInstance | null = null;
const ORIGIN = window.location.origin;

function clearCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; Path=/`;
}

function render(config: Partial<CookieConsentConfig>, state: "banner" | "returning") {
  const errEl = document.getElementById("cc-error");
  const cookieName = config.cookieName || "cc_consent";
  // Set the cookie to match the requested state, THEN init/update — the SDK reads
  // it to decide banner-vs-button. Clearing/seeding fresh each render keeps the
  // preview deterministic (code-review #8: no stale state bleeds across renders).
  clearCookie(cookieName);
  if (state === "returning") {
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
    // init once, then update() in place — no full destroy/init per keystroke, so
    // the preview re-themes/rebuilds without flicker or focus loss (#9).
    if (!instance) instance = init(config);
    else instance.update(config);
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
