import { describe, it, expect } from "vitest";
import { parseMath, applySymbols, hasMath } from "./math";

describe("applySymbols", () => {
  it("replaces operators and words", () => {
    expect(applySymbols("a >= b")).toContain("≥");
    expect(applySymbols("x != y")).toContain("≠");
    expect(applySymbols("sqrt(3)")).toContain("√");
    expect(applySymbols("2 pi r")).toContain("π");
  });
});

describe("parseMath", () => {
  it("extracts a numeric superscript", () => {
    const segs = parseMath("x^2");
    expect(segs).toEqual([
      { type: "text", value: "x" },
      { type: "sup", value: "2" },
    ]);
  });

  it("extracts a subscript", () => {
    const segs = parseMath("H_2O");
    expect(segs).toEqual([
      { type: "text", value: "H" },
      { type: "sub", value: "2" },
      { type: "text", value: "O" },
    ]);
  });

  it("handles braced exponents and signs", () => {
    expect(parseMath("e^{-x}")).toEqual([
      { type: "text", value: "e" },
      { type: "sup", value: "-x" },
    ]);
    expect(parseMath("a^-1")).toEqual([
      { type: "text", value: "a" },
      { type: "sup", value: "-1" },
    ]);
  });

  it("leaves plain text untouched", () => {
    expect(parseMath("Hello world")).toEqual([
      { type: "text", value: "Hello world" },
    ]);
  });

  it("handles a trailing caret with no exponent gracefully", () => {
    expect(parseMath("3 ^ ")).toEqual([{ type: "text", value: "3 ^ " }]);
  });
});

describe("hasMath", () => {
  it("detects notation", () => {
    expect(hasMath("x^2 + 1")).toBe(true);
    expect(hasMath("plain english")).toBe(false);
  });
});
