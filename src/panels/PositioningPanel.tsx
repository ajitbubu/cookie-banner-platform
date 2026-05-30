import type { CookieConsentConfig, BannerPosition, ButtonPosition } from "cookie-banner-sdk";
import { PanelHeader, Card, Field, Segmented } from "./ui";

export function PositioningPanel({
  config,
  onChange,
}: {
  config: Partial<CookieConsentConfig>;
  onChange: (patch: Partial<CookieConsentConfig>) => void;
}) {
  const pos = config.position ?? { banner: "bottom", button: "bottom-left" };
  const set = (patch: Partial<typeof pos>) =>
    onChange({ position: { banner: pos.banner ?? "bottom", button: pos.button ?? "bottom-left", ...patch } });

  return (
    <div>
      <PanelHeader title="Positioning" sub="Where the banner sits and which corner the cookie button uses." />
      <Card>
        <Field label="Banner edge">
          <Segmented<BannerPosition>
            value={pos.banner ?? "bottom"}
            onChange={(v) => set({ banner: v })}
            options={[
              ["bottom", "Bottom"],
              ["top", "Top"],
            ]}
          />
        </Field>
        <Field label="Cookie button corner">
          <Segmented<ButtonPosition>
            value={pos.button ?? "bottom-left"}
            onChange={(v) => set({ button: v })}
            options={[
              ["bottom-left", "Bottom left"],
              ["bottom-right", "Bottom right"],
              ["top-left", "Top left"],
              ["top-right", "Top right"],
            ]}
          />
        </Field>
      </Card>
    </div>
  );
}
