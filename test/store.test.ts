import { describe, it, expect, beforeEach } from "vitest";
import { loadBanners, saveBanners, newBanner, parseImportedBanner } from "../src/store/banners";

beforeEach(() => localStorage.clear());

describe("banner store", () => {
  it("loads empty when nothing saved", () => {
    expect(loadBanners()).toEqual([]);
  });

  it("round-trips saved banners", () => {
    const b = newBanner("Site A");
    saveBanners([b]);
    const loaded = loadBanners();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe("Site A");
  });

  it("resets on corrupt JSON without throwing", () => {
    localStorage.setItem("cc-builder-banners", "{not json");
    expect(loadBanners()).toEqual([]);
  });

  it("resets on unknown schemaVersion", () => {
    localStorage.setItem("cc-builder-banners", JSON.stringify({ schemaVersion: 999, banners: [newBanner("x")] }));
    expect(loadBanners()).toEqual([]);
  });

  it("newBanner forces necessary locked + enabled", () => {
    const b = newBanner("x");
    expect(b.config.categories!.necessary).toMatchObject({ enabled: true, locked: true });
  });

  it("parseImportedBanner rejects malformed input", () => {
    expect(parseImportedBanner("garbage")).toBeNull();
    expect(parseImportedBanner(JSON.stringify({ name: "no config" }))).toBeNull();
  });

  it("parseImportedBanner accepts a valid record", () => {
    const rec = parseImportedBanner(JSON.stringify({ name: "Imported", config: { cookieName: "x" } }));
    expect(rec).not.toBeNull();
    expect(rec!.name).toBe("Imported");
  });

  it("parseImportedBanner always mints a fresh id (no collision on re-import)", () => {
    const json = JSON.stringify({ id: "fixed-id", name: "A", config: { cookieName: "x" } });
    const a = parseImportedBanner(json)!;
    const b = parseImportedBanner(json)!;
    expect(a.id).not.toBe("fixed-id");
    expect(a.id).not.toBe(b.id);
  });
});
