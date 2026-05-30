import type { CookieConsentConfig, CategoryConfig, CookieDef, CategoryKey } from "cookie-banner-sdk";
import { PanelHeader, Toggle } from "./ui";

const ORDER: { key: CategoryKey; name: string }[] = [
  { key: "necessary", name: "Strictly Necessary" },
  { key: "analytics", name: "Performance / Analytics" },
  { key: "functional", name: "Functional" },
  { key: "marketing", name: "Marketing" },
];

const COLS: (keyof CookieDef)[] = ["name", "provider", "domain", "duration"];

export function CategoriesPanel({
  config,
  onChange,
}: {
  config: Partial<CookieConsentConfig>;
  onChange: (patch: Partial<CookieConsentConfig>) => void;
}) {
  const cats = (config.categories ?? {}) as Record<CategoryKey, CategoryConfig>;

  function patchCat(key: CategoryKey, patch: Partial<CategoryConfig>) {
    const base = cats[key] ?? { cookies: [] };
    onChange({ categories: { ...cats, [key]: { ...base, ...patch } } as Record<CategoryKey, CategoryConfig> });
  }

  function setCookie(key: CategoryKey, i: number, field: keyof CookieDef, value: string) {
    const cookies = [...(cats[key]?.cookies ?? [])];
    cookies[i] = { ...cookies[i], [field]: value };
    patchCat(key, { cookies });
  }
  function addCookie(key: CategoryKey) {
    patchCat(key, { cookies: [...(cats[key]?.cookies ?? []), { name: "" }] });
  }
  function removeCookie(key: CategoryKey, i: number) {
    patchCat(key, { cookies: (cats[key]?.cookies ?? []).filter((_, j) => j !== i) });
  }

  return (
    <div>
      <PanelHeader title="Categories & Cookies" sub="Strictly Necessary is always on. List the cookies each category covers — they appear in the preferences modal." />
      <div className="flex flex-col gap-4">
        {ORDER.map(({ key, name }) => {
          const cat = cats[key] ?? { cookies: [] };
          const locked = key === "necessary";
          return (
            <div key={key} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{name}</h3>
                {locked ? (
                  <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                    Always Active
                  </span>
                ) : (
                  <Toggle
                    checked={cat.enabled ?? false}
                    onChange={(v) => patchCat(key, { enabled: v })}
                    label={`Enable ${name} by default`}
                  />
                )}
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                    {COLS.map((c) => (
                      <th key={c} className="pb-1 font-semibold capitalize">{c}</th>
                    ))}
                    <th className="pb-1" />
                  </tr>
                </thead>
                <tbody>
                  {(cat.cookies ?? []).map((ck, i) => (
                    <tr key={i}>
                      {COLS.map((c) => (
                        <td key={c} className="py-1 pr-2">
                          <input
                            value={(ck[c] as string) ?? ""}
                            placeholder={c === "name" ? "_ga" : c}
                            onChange={(e) => setCookie(key, i, c, e.target.value)}
                            className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                          />
                        </td>
                      ))}
                      <td className="py-1">
                        <button
                          onClick={() => removeCookie(key, i)}
                          aria-label="Remove cookie"
                          className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-100 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(cat.cookies ?? []).length === 0 && (
                    <tr>
                      <td colSpan={COLS.length + 1} className="py-2 text-xs text-gray-400">
                        No cookies listed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <button
                onClick={() => addCookie(key)}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
              >
                + Add cookie
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
