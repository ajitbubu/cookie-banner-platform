import { useEffect, useRef, useState } from "react";
import type { CookieConsentConfig } from "cookie-banner-sdk";

type Device = "desktop" | "tablet" | "mobile";
type State = "banner" | "returning";

const WIDTHS: Record<Device, number> = { desktop: 1280, tablet: 768, mobile: 375 };

export function PreviewPane({ config }: { config: Partial<CookieConsentConfig> }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const [device, setDevice] = useState<Device>("desktop");
  const [state, setState] = useState<State>("banner");

  // Wait for the iframe to report ready, then (re)post on every config/state change.
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "cc-preview-ready") {
        readyRef.current = true;
        post();
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function post() {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "cc-config", config, state },
      window.location.origin,
    );
  }

  // Debounced re-post on config/state change (eng-review: ~150ms debounce).
  useEffect(() => {
    if (!readyRef.current) return;
    const t = setTimeout(post, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, state]);

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="flex items-center justify-center gap-2 border-b border-gray-200 bg-white py-2">
        <Segmented
          value={device}
          onChange={(v) => setDevice(v as Device)}
          options={[
            ["desktop", "Desktop"],
            ["tablet", "Tablet"],
            ["mobile", "Mobile"],
          ]}
        />
        <Segmented
          value={state}
          onChange={(v) => setState(v as State)}
          options={[
            ["banner", "Banner"],
            ["returning", "Returning"],
          ]}
        />
      </div>
      <div className="flex flex-1 items-stretch justify-center overflow-auto p-4">
        <iframe
          ref={iframeRef}
          src="/preview.html"
          title="Live preview"
          className="h-full rounded-lg border border-gray-200 bg-white shadow-sm transition-all"
          style={{ width: WIDTHS[device], maxWidth: "100%" }}
        />
      </div>
    </div>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="flex overflow-hidden rounded-md border border-gray-300">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`px-3 py-1 text-xs ${
            value === v ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
