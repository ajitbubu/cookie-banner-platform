import type { CookieConsentConfig } from "@ajitbubu/cookie-banner-sdk";

// A saved banner = builder metadata + the SDK config it produces.
export interface BannerRecord {
  id: string;
  name: string;
  updatedAt: string; // ISO
  gtmContainerId?: string; // builder-only, for the export snippet
  config: Partial<CookieConsentConfig>;
}

// Versioned envelope so a future record-shape change can migrate, not corrupt.
// (Eng-review TE1 — mirrors the SDK cookie schemaVersion fail-safe.)
const KEY = "cc-builder-banners";
const SCHEMA_VERSION = 1;

interface Stored {
  schemaVersion: number;
  banners: BannerRecord[];
}

// In-memory fallback when localStorage is unavailable (private mode / quota).
let memory: BannerRecord[] | null = null;
let usingMemory = false;

export function isUsingMemory(): boolean {
  return usingMemory;
}

function readRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    usingMemory = true;
    return null;
  }
}

/**
 * Load saved banners. Unknown schemaVersion or corrupt JSON fails safe to an
 * empty list (never throws). Returns a fresh array each call.
 */
export function loadBanners(): BannerRecord[] {
  if (usingMemory && memory) return [...memory];
  const raw = readRaw();
  if (raw == null) return memory ? [...memory] : [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn("[builder] corrupt banner store — resetting.");
    return [];
  }
  if (typeof parsed !== "object" || parsed === null) return [];
  const env = parsed as Partial<Stored>;
  if (env.schemaVersion !== SCHEMA_VERSION) {
    // Only v1 exists today; unknown version → drop with a warning rather than
    // render a shape the editor can't handle. Future versions add migration here.
    console.warn(`[builder] unknown store schemaVersion ${env.schemaVersion} — resetting.`);
    return [];
  }
  if (!Array.isArray(env.banners)) return [];
  // Validate each record — a corrupt/old entry missing id/name/config would crash
  // the panels or preview downstream (code-review #7). Drop bad ones, keep the rest.
  const valid = env.banners.filter(
    (b): b is BannerRecord =>
      !!b &&
      typeof (b as BannerRecord).id === "string" &&
      typeof (b as BannerRecord).name === "string" &&
      typeof (b as BannerRecord).config === "object" &&
      (b as BannerRecord).config !== null,
  );
  if (valid.length !== env.banners.length) {
    console.warn(
      `[builder] dropped ${env.banners.length - valid.length} malformed banner record(s).`,
    );
  }
  return valid;
}

/** Persist banners. Falls back to in-memory (this session only) if blocked. */
export function saveBanners(banners: BannerRecord[]): { persisted: boolean } {
  const env: Stored = { schemaVersion: SCHEMA_VERSION, banners };
  try {
    localStorage.setItem(KEY, JSON.stringify(env));
    return { persisted: true };
  } catch {
    usingMemory = true;
    memory = [...banners];
    return { persisted: false };
  }
}

export function newBanner(name: string): BannerRecord {
  return {
    id: crypto.randomUUID(),
    name,
    updatedAt: new Date().toISOString(),
    config: {
      cookieName: "cc_consent",
      categories: {
        necessary: { enabled: true, locked: true, cookies: [] },
        analytics: { cookies: [] },
        functional: { cookies: [] },
        marketing: { cookies: [] },
      },
    },
  };
}

/** Parse + validate an imported banner JSON. Returns null on any problem. */
export function parseImportedBanner(json: string): BannerRecord | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const r = parsed as Partial<BannerRecord>;
  if (typeof r.config !== "object" || r.config === null) return null;
  return {
    // Always mint a fresh id — importing a previously-exported banner must not
    // collide with the original (duplicate ids break selection + React keys).
    id: crypto.randomUUID(),
    name: typeof r.name === "string" ? r.name : "Imported banner",
    updatedAt: new Date().toISOString(),
    gtmContainerId: typeof r.gtmContainerId === "string" ? r.gtmContainerId : undefined,
    config: r.config as Partial<CookieConsentConfig>,
  };
}
