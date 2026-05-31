import { useMemo, useRef, useState } from "react";
import type { BannerRecord } from "../store/banners";
import { toConfigJson, toInitSnippet, toGtmHeadSnippet } from "../lib/export";

type Tab = "json" | "init" | "gtm";

export function ExportModal({ banner, onClose }: { banner: BannerRecord; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("init");
  const [copied, setCopied] = useState(false);
  // Only close on a click that BOTH started and ended on the backdrop. A drag-select
  // inside the textarea that releases over the backdrop must not close it (#10).
  const downOnBackdrop = useRef(false);

  const content = useMemo(() => {
    if (tab === "json") return toConfigJson(banner.config);
    if (tab === "init") return toInitSnippet(banner.config);
    const gtmId = banner.gtmContainerId?.trim();
    if (!gtmId) {
      return "// Add your GTM container ID in the GTM panel to generate the\n// full <head> install snippet (bootstrap → GTM → SDK, in order).";
    }
    const { head, body } = toGtmHeadSnippet(banner.config, gtmId);
    return `<!-- In <head> -->\n${head}\n\n<!-- Top of <body> -->\n${body}`;
  }, [tab, banner]);

  function download() {
    const ext = tab === "json" ? "json" : "html";
    const blob = new Blob([content], { type: tab === "json" ? "application/json" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${banner.name.replace(/\s+/g, "-").toLowerCase() || "banner"}.${tab === "json" ? "config.json" : ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked — select the textarea so the user can copy manually.
      const ta = document.getElementById("cc-export-text") as HTMLTextAreaElement | null;
      ta?.select();
    }
  }

  const TABS: [Tab, string][] = [
    ["init", "Init snippet"],
    ["gtm", "GTM-ready"],
    ["json", "Config JSON"],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => { downOnBackdrop.current = e.target === e.currentTarget; }}
      onClick={(e) => { if (downOnBackdrop.current && e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
          <h3 className="font-semibold">Export — {banner.name}</h3>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700">✕</button>
        </div>
        <div className="flex gap-1 px-5 pt-3">
          {TABS.map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1.5 text-sm ${
                tab === t ? "bg-blue-50 font-semibold text-blue-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-5 py-3">
          <textarea
            id="cc-export-text"
            readOnly
            value={content}
            className="h-72 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-xs"
          />
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3">
          <span className="text-xs text-gray-500">
            Place the snippet in your site's &lt;head&gt;, above your GTM tag.
          </span>
          <div className="flex gap-2">
            <button
              onClick={download}
              className="h-9 rounded-md border border-gray-300 px-4 text-sm font-semibold hover:bg-gray-50"
            >
              Download
            </button>
            <button
              onClick={copy}
              className="h-9 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:brightness-95"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
