import { useMemo, useRef, useState } from "react";
import type { CookieConsentConfig } from "cookie-banner-sdk";
import {
  loadBanners,
  saveBanners,
  newBanner,
  isUsingMemory,
  parseImportedBanner,
  type BannerRecord,
} from "./store/banners";
import { ThemePanel } from "./panels/ThemePanel";
import { TextPanel } from "./panels/TextPanel";
import { CategoriesPanel } from "./panels/CategoriesPanel";
import { GtmPanel } from "./panels/GtmPanel";
import { PositioningPanel } from "./panels/PositioningPanel";
import { PresetsPanel } from "./panels/PresetsPanel";
import { ExportModal } from "./export/ExportModal";
import { PreviewPane } from "./preview/PreviewPane";

const SECTIONS = ["Theme", "Text & Labels", "Categories & Cookies", "GTM", "Positioning", "Presets"] as const;
type Section = (typeof SECTIONS)[number];

export default function App() {
  const [banners, setBanners] = useState<BannerRecord[]>(() => loadBanners());
  const [activeId, setActiveId] = useState<string | null>(() => banners[0]?.id ?? null);
  const [section, setSection] = useState<Section>("Theme");
  const [exportOpen, setExportOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const active = useMemo(() => banners.find((b) => b.id === activeId) ?? null, [banners, activeId]);

  // Autosave model: every change writes through to localStorage. Functional
  // updates avoid stale-closure clobbering (e.g. async import landing after an
  // edit). There is no separate "dirty"/Save step — local builder, nothing to lose.
  function commit(updater: (prev: BannerRecord[]) => BannerRecord[]) {
    setBanners((prev) => {
      const next = updater(prev);
      saveBanners(next);
      return next;
    });
  }

  function createBanner() {
    const b = newBanner(`Banner ${banners.length + 1}`);
    commit((prev) => [...prev, b]);
    setActiveId(b.id);
  }

  function updateConfig(patch: Partial<CookieConsentConfig>) {
    if (!activeId) return;
    commit((prev) =>
      prev.map((b) =>
        b.id === activeId
          ? { ...b, config: { ...b.config, ...patch }, updatedAt: new Date().toISOString() }
          : b,
      ),
    );
  }

  function updateMeta(patch: Partial<BannerRecord>) {
    if (!activeId) return;
    commit((prev) => prev.map((b) => (b.id === activeId ? { ...b, ...patch } : b)));
  }

  function renameActive(name: string) {
    if (!activeId) return;
    commit((prev) => prev.map((b) => (b.id === activeId ? { ...b, name } : b)));
  }

  function deleteBanner(id: string) {
    commit((prev) => prev.filter((b) => b.id !== id));
    setActiveId((cur) => (cur === id ? (banners.find((b) => b.id !== id)?.id ?? null) : cur));
  }

  function importBanner(file: File) {
    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const rec = parseImportedBanner(String(reader.result));
      if (!rec) {
        setImportError("Invalid banner file — expected JSON with a config.");
        return;
      }
      commit((prev) => [...prev, rec]); // functional → no stale-closure clobber
      setActiveId(rec.id);
    };
    reader.onerror = () => setImportError("Could not read the file.");
    reader.readAsText(file);
  }

  // First-run: no saved banners yet.
  if (banners.length === 0) return <EmptyState onCreate={createBanner} />;

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex h-13 items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="text-[15px] font-bold">
            🍪 Consent <span className="text-blue-600">Studio</span>
          </div>
          {active && (
            <input
              aria-label="Banner name"
              value={active.name}
              onChange={(e) => renameActive(e.target.value)}
              className="rounded-md border border-transparent px-2 py-1 text-sm font-medium hover:border-gray-300 focus:border-gray-300 focus:outline-none"
            />
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {isUsingMemory() ? "Saved this session only" : "All changes saved"}
          </span>
          <button
            onClick={() => setExportOpen(true)}
            className="h-9 rounded-md bg-blue-600 px-3.5 text-sm font-semibold text-white hover:brightness-95"
          >
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
            <div
              key={b.id}
              className={`group mb-1.5 flex w-full items-center justify-between rounded-md border px-2.5 py-2 text-sm ${
                b.id === activeId ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <button onClick={() => setActiveId(b.id)} className="flex-1 truncate text-left">
                {b.name}
              </button>
              <button
                onClick={() => deleteBanner(b.id)}
                aria-label={`Delete ${b.name}`}
                title={`Delete ${b.name}`}
                className="ml-1 rounded px-1 text-gray-300 hover:text-red-600 focus-visible:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="flex gap-1.5">
            <button
              onClick={createBanner}
              className="h-8 flex-1 rounded-md border border-dashed border-gray-300 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              + New
            </button>
            <button
              onClick={() => fileInput.current?.click()}
              className="h-8 flex-1 rounded-md border border-dashed border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Import
            </button>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importBanner(f);
              e.target.value = "";
            }}
          />
          {importError && <p className="mt-1.5 text-xs text-red-600">{importError}</p>}
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
          {active && (
            <>
              {section === "Theme" && <ThemePanel config={active.config} onChange={updateConfig} />}
              {section === "Text & Labels" && <TextPanel config={active.config} onChange={updateConfig} />}
              {section === "Categories & Cookies" && (
                <CategoriesPanel config={active.config} onChange={updateConfig} />
              )}
              {section === "GTM" && (
                <GtmPanel
                  config={active.config}
                  gtmContainerId={active.gtmContainerId}
                  onChange={updateConfig}
                  onMeta={updateMeta}
                />
              )}
              {section === "Positioning" && <PositioningPanel config={active.config} onChange={updateConfig} />}
              {section === "Presets" && <PresetsPanel config={active.config} onChange={updateConfig} />}
            </>
          )}
        </main>

        {/* Right: live preview */}
        <aside className="w-[430px] shrink-0 border-l border-gray-200">
          {active && <PreviewPane config={active.config} />}
        </aside>
      </div>

      {exportOpen && active && <ExportModal banner={active} onClose={() => setExportOpen(false)} />}
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

