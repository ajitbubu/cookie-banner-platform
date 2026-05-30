import type { CookieConsentConfig } from "cookie-banner-sdk";
import { PanelHeader, Card, Field, TextInput, Toggle } from "./ui";

export function GtmPanel({
  config,
  gtmContainerId,
  onChange,
  onMeta,
}: {
  config: Partial<CookieConsentConfig>;
  gtmContainerId?: string;
  onChange: (patch: Partial<CookieConsentConfig>) => void;
  onMeta: (patch: { gtmContainerId?: string }) => void;
}) {
  const gtm = config.gtm ?? { consentMode: true, dataLayerEvent: "cookie_consent_update" };
  const set = (patch: Partial<typeof gtm>) =>
    onChange({ gtm: { consentMode: gtm.consentMode ?? true, dataLayerEvent: gtm.dataLayerEvent ?? "cookie_consent_update", ...patch } });

  return (
    <div>
      <PanelHeader title="Google Tag Manager" sub="The SDK signals consent to GTM via Consent Mode v2. The SDK does not load GTM — the container ID is only used to build your install snippet." />
      <Card>
        <Field label="Consent Mode v2">
          <div className="flex items-center gap-3">
            <Toggle
              checked={gtm.consentMode ?? true}
              onChange={(v) => set({ consentMode: v })}
              label="Consent Mode"
            />
            <span className="text-sm text-gray-500">Emit gtag consent default/update signals</span>
          </div>
        </Field>
        <Field label="dataLayer event name">
          <TextInput value={gtm.dataLayerEvent ?? ""} placeholder="cookie_consent_update" onChange={(v) => set({ dataLayerEvent: v })} />
        </Field>
        <Field label="GTM container ID (for the export snippet)">
          <TextInput value={gtmContainerId ?? ""} placeholder="GTM-XXXXXXX" onChange={(v) => onMeta({ gtmContainerId: v || undefined })} />
        </Field>
      </Card>
    </div>
  );
}
