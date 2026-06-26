import { describe, it, expect } from "vitest";
import {
  resolveDisplayName,
  avatarInitial,
  cardIndex,
} from "./dashboard-helpers";

describe("resolveDisplayName", () => {
  it("prefers a non-empty profile name", () => {
    expect(resolveDisplayName("Ali Khan", "ali@example.com")).toBe("Ali Khan");
  });

  it("trims whitespace from the profile name", () => {
    expect(resolveDisplayName("  Sara  ", null)).toBe("Sara");
  });

  it("falls back to the email local-part when name is missing", () => {
    expect(resolveDisplayName(null, "usman2789@gmail.com")).toBe("usman2789");
    expect(resolveDisplayName("", "usman2789@gmail.com")).toBe("usman2789");
    expect(resolveDisplayName("   ", "usman2789@gmail.com")).toBe("usman2789");
  });

  it("falls back to 'there' when nothing usable is provided", () => {
    expect(resolveDisplayName(null, null)).toBe("there");
    expect(resolveDisplayName(undefined, undefined)).toBe("there");
    expect(resolveDisplayName("", "not-an-email")).toBe("there");
  });
});

describe("avatarInitial", () => {
  it("returns the uppercased first letter", () => {
    expect(avatarInitial("ali")).toBe("A");
    expect(avatarInitial("Sara")).toBe("S");
  });

  it("returns 'U' for empty input", () => {
    expect(avatarInitial("")).toBe("U");
    expect(avatarInitial("   ")).toBe("U");
  });
});

describe("cardIndex", () => {
  it("zero-pads to two digits, 1-based", () => {
    expect(cardIndex(0)).toBe("01");
    expect(cardIndex(8)).toBe("09");
    expect(cardIndex(11)).toBe("12");
  });
});
