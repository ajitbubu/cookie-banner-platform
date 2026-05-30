import { describe, it, expect } from "vitest";
import { contrastRatio, isValidHex, checkContrast } from "../src/lib/contrast";

describe("contrast", () => {
  it("black on white is 21:1", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
  });
  it("white on white is 1:1", () => {
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 1);
  });
  it("supports 3-digit hex and missing #", () => {
    expect(contrastRatio("000", "fff")).toBeCloseTo(21, 0);
  });
  it("returns null for invalid hex", () => {
    expect(contrastRatio("nope", "#fff")).toBeNull();
    expect(isValidHex("#12")).toBe(false);
  });
  it("flags a failing pair (AA needs 4.5:1)", () => {
    const r = checkContrast("#9aa3b2", "#ffffff");
    expect(r).not.toBeNull();
    expect(r!.passAA).toBe(false);
  });
  it("passes a strong pair", () => {
    expect(checkContrast("#111827", "#ffffff")!.passAA).toBe(true);
  });
});
