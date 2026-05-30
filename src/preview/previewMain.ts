// Runs INSIDE the preview iframe. Receives a config via postMessage and renders
// the real SDK banner. Resets consent before each init so the banner always shows
// (eng-review TE2: destroy -> clear consent -> init). Verifies message origin.
import { init, type CookieConsentInstance, type CookieConsentConfig } from "cookie-banner-sdk";

type Msg = { type: "cc-config"; config: Partial<CookieConsentConfig>; state?: "banner" | "returning" };

let instance: CookieConsentInstance | null = null;
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
  const cookieName = config.cookieName || "cc_consent";
  clearCookie(cookieName);
  // Reset the SDK's double-init guard so re-init re-renders.
  (window as unknown as Record<string, unknown>).__cookieConsentInitialized = undefined;

  if (state === "returning") {
    // Seed a prior-consent cookie so the SDK shows the floating button, not the banner.
    const rec = {
      schemaVersion: 1,
      version: config.consentVersion ?? 1,
      timestamp: new Date(0).toISOString(),
      categories: { necessary: true, analytics: false, functional: false, marketing: false },
    };
    document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(rec))}; Path=/`;
  }

  try {
    instance = init(config);
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
