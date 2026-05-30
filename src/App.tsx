import { useMemo, useState } from "react";
import type { CookieConsentConfig } from "cookie-banner-sdk";
import {
  loadBanners,
  saveBanners,
  newBanner,
  isUsingMemory,
  type BannerRecord,
} from "./store/banners";
import { ThemePanel } from "./panels/ThemePanel";
import { PreviewPane } from "./preview/PreviewPane";

const SECTIONS = ["Theme", "Text & Labels", "Categories & Cookies", "GTM", "Positioning", "Presets"] as const;
type Section = (typeof SECTIONS)[number];

export default function App() {
  const [banners, setBanners] = useState<BannerRecord[]>(() => loadBanners());
  const [activeId, setActiveId] = useState<string | null>(() => banners[0]?.id ?? null);
  const [section, setSection] = useState<Section>("Theme");
  const [dirty, setDirty] = useState(false);

  const active = useMemo(() => banners.find((b) => b.id === activeId) ?? null, [banners, activeId]);

  function persist(next: BannerRecord[]) {
    setBanners(next);
    saveBanners(next);
  }

  function createBanner() {
    const b = newBanner(`Banner ${banners.length + 1}`);
    persist([...banners, b]);
    setActiveId(b.id);
    setDirty(false);
  }

  function updateConfig(patch: Partial<CookieConsentConfig>) {
    if (!active) return;
    const next = banners.map((b) =>
      b.id === active.id
        ? { ...b, config: { ...b.config, ...patch }, updatedAt: new Date().toISOString() }
        : b,
    );
    setBanners(next);
    setDirty(true);
  }

  function save() {
    saveBanners(banners);
    setDirty(false);
  }

  // First-run: no saved banners yet.
  if (banners.length === 0) return <EmptyState onCreate={createBanner} />;

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex h-13 items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5">
        <div className="text-[15px] font-bold">
          🍪 Consent <span className="text-blue-600">Studio</span>
        </div>
        <div className="flex items-center gap-2">
          {isUsingMemory() && (
            <span className="text-xs text-amber-600">Saved this session only</span>
          )}
          <button
            onClick={save}
            className="relative h-9 rounded-md border border-gray-300 px-3.5 text-sm font-semibold hover:bg-gray-50"
          >
            Save
            {dirty && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
            )}
          </button>
          <button className="h-9 rounded-md bg-blue-600 px-3.5 text-sm font-semibold text-white hover:brightness-95">
            Export
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left: banners + section nav */}
        <nav className="w-56 shrink-0 overflow-auto border-r border-gray-200 bg-white p-3.5">
          <h4 className="mx-1 mb-1.5 mt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Banners
          </h4>
          {banners.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveId(b.id)}
              className={`mb-1.5 flex w-full items-center justify-between rounded-md border px-2.5 py-2 text-left text-sm ${
                b.id === activeId ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className="truncate">{b.name}</span>
            </button>
          ))}
          <button
            onClick={createBanner}
            className="h-8 w-full rounded-md border border-dashed border-gray-300 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            + New banner
          </button>
          <h4 className="mx-1 mb-1.5 mt-4 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Edit
          </h4>
          {SECTIONS.map((s) => (
            <button
              key={s}
              aria-current={section === s ? "true" : undefined}
              onClick={() => setSection(s)}
              className={`mb-0.5 block w-full rounded-md px-2.5 py-2 text-left text-sm ${
                section === s ? "bg-blue-50 font-semibold text-blue-600" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </nav>

        {/* Center: active panel form */}
        <main className="flex-1 overflow-auto bg-gray-50 px-6 py-5">
          {active && section === "Theme" ? (
            <ThemePanel config={active.config} onChange={updateConfig} />
          ) : (
            <Placeholder section={section} />
          )}
        </main>

        {/* Right: live preview */}
        <aside className="w-[430px] shrink-0 border-l border-gray-200">
          {active && <PreviewPane config={active.config} />}
        </aside>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 text-center">
      <div className="text-4xl">🍪</div>
      <h1 className="mt-3 text-xl font-bold">
        Consent <span className="text-blue-600">Studio</span>
      </h1>
      <p className="mt-1 max-w-sm text-sm text-gray-500">
        Design a cookie consent banner, preview the real thing live, and export a ready-to-paste
        snippet. No account, nothing leaves your browser.
      </p>
      <button
        onClick={onCreate}
        className="mt-5 h-10 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:brightness-95"
      >
        Create your first banner
      </button>
    </div>
  );
}

function Placeholder({ section }: { section: Section }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{section}</h2>
      <p className="mt-1 text-sm text-gray-500">This panel is coming next.</p>
    </div>
  );
}
