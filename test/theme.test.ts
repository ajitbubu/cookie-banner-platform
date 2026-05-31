import { describe, it, expect } from "vitest";
import { pxValue } from "../src/panels/ThemePanel";

describe("pxValue (slider parse, code-review #5)", () => {
  it("parses a px value", () => {
    expect(pxValue("14px", 14)).toBe(14);
    expect(pxValue("0px", 10)).toBe(0); // 0 is valid (radius), not coerced to fallback
  });
  it("falls back on non-numeric / unit-only values instead of NaN", () => {
    expect(pxValue("medium", 14)).toBe(14);
    expect(pxValue(undefined, 14)).toBe(14);
    expect(pxValue("", 10)).toBe(10);
  });
  it("takes the leading integer of mixed values (e.g. 1rem -> 1)", () => {
    expect(pxValue("1rem", 14)).toBe(1);
  });
});
