import { describe, expect, it } from "vitest";
import { hasSessionCookie } from "./session-hint";

describe("hasSessionCookie", () => {
  it("is false with no cookies", () => {
    expect(hasSessionCookie("")).toBe(false);
  });

  it("detects a single session cookie", () => {
    expect(hasSessionCookie("theme=light; sb-lcsuasddoertvoujwsgo-auth-token=base64-abc")).toBe(
      true,
    );
  });

  it("detects chunked session cookies", () => {
    expect(hasSessionCookie("sb-abc123-auth-token.0=part1; sb-abc123-auth-token.1=part2")).toBe(
      true,
    );
  });

  it("ignores the PKCE code-verifier cookie (no session yet)", () => {
    expect(hasSessionCookie("sb-abc123-auth-token-code-verifier=xyz")).toBe(false);
  });

  it("ignores empty values and look-alike names", () => {
    expect(hasSessionCookie("sb-abc123-auth-token=")).toBe(false);
    expect(hasSessionCookie("my-sb-abc123-auth-token=1; auth-token=1")).toBe(false);
  });
});
