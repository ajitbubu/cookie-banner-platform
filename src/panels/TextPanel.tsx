import type { CookieConsentConfig, Labels } from "@ajitbubu/cookie-banner-sdk";
import { PanelHeader, Card, Field, TextInput } from "./ui";

const FIELDS: { key: keyof Labels; label: string; placeholder: string }[] = [
  { key: "bannerText", label: "Banner text", placeholder: "We use cookies to improve your experience…" },
  { key: "acceptAll", label: "Accept All button", placeholder: "Accept All" },
  { key: "rejectAll", label: "Reject All button", placeholder: "Reject All" },
  { key: "preferences", label: "Preferences button", placeholder: "Preferences" },
  { key: "modalTitle", label: "Modal title", placeholder: "Cookie Preferences" },
];

export function TextPanel({
  config,
  onChange,
}: {
  config: Partial<CookieConsentConfig>;
  onChange: (patch: Partial<CookieConsentConfig>) => void;
}) {
  const labels = (config.labels ?? {}) as Partial<Labels>;
  const set = (key: keyof Labels, value: string) =>
    onChange({ labels: { ...labels, [key]: value } as Labels });

  return (
    <div>
      <PanelHeader title="Text & Labels" sub="Leave blank to use the SDK default. Supports any language." />
      <Card>
        {FIELDS.map((f) => (
          <Field key={String(f.key)} label={f.label}>
            <TextInput
              value={(labels[f.key] as string) ?? ""}
              placeholder={f.placeholder}
              onChange={(v) => set(f.key, v)}
            />
          </Field>
        ))}
      </Card>
    </div>
  );
}
