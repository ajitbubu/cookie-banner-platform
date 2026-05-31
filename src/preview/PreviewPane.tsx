import { useEffect, useRef, useState } from "react";
import type { CookieConsentConfig } from "@ajitbubu/cookie-banner-sdk";
import { Segmented } from "../panels/ui";

type Device = "desktop" | "tablet" | "mobile";
type State = "banner" | "returning";

const WIDTHS: Record<Device, number> = { desktop: 1280, tablet: 768, mobile: 375 };

export function PreviewPane({ config }: { config: Partial<CookieConsentConfig> }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [state, setState] = useState<State>("banner");
  // `ready` is STATE (not a ref) so flipping it re-runs the post effect, and we
  // key it off the iframe's load event — which fires only after preview.html's
  // module has executed and attached its message listener. This avoids both the
  // dropped-edit race (debounce effect bailing while not-ready and never re-firing)
  // and the missed cc-preview-ready race (load is the authoritative ready signal).
  const [ready, setReady] = useState(false);

  // Re-key the iframe-ready flag if the iframe element is ever remounted.
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "cc-config", config, state },
        window.location.origin,
      );
    }, 150);
    return () => clearTimeout(t);
  }, [ready, config, state]);

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="flex items-center justify-center gap-2 border-b border-gray-200 bg-white py-2">
        <Segmented<Device>
          value={device}
          onChange={setDevice}
          options={[
            ["desktop", "Desktop"],
            ["tablet", "Tablet"],
            ["mobile", "Mobile"],
          ]}
        />
        <Segmented<State>
          value={state}
          onChange={setState}
          options={[
            ["banner", "Banner"],
            ["returning", "Returning"],
          ]}
        />
      </div>
      <div className="flex flex-1 items-stretch justify-center overflow-auto p-4">
        <iframe
          ref={iframeRef}
          src={`${import.meta.env.BASE_URL}preview.html`}
          title="Live preview"
          onLoad={() => setReady(true)}
          className="h-full rounded-lg border border-gray-200 bg-white shadow-sm transition-all"
          style={{ width: WIDTHS[device], maxWidth: "100%" }}
        />
      </div>
    </div>
  );
}

