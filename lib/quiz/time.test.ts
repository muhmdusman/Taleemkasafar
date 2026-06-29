import { describe, it, expect } from "vitest";
import { formatTime, remainingSeconds, isExpired } from "./time";

describe("formatTime", () => {
  it("formats sub-hour as M:SS", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(5)).toBe("0:05");
    expect(formatTime(65)).toBe("1:05");
    expect(formatTime(600)).toBe("10:00");
  });
  it("formats an hour or more as H:MM:SS", () => {
    expect(formatTime(3600)).toBe("1:00:00");
    expect(formatTime(7325)).toBe("2:02:05");
  });
  it("clamps negatives to zero", () => {
    expect(formatTime(-10)).toBe("0:00");
  });
  it("floors fractional seconds", () => {
    expect(formatTime(65.9)).toBe("1:05");
  });
});

describe("remainingSeconds", () => {
  it("computes remaining time and clamps at zero", () => {
    const now = 1_000_000;
    expect(remainingSeconds(now + 120_000, now)).toBe(120);
    expect(remainingSeconds(now - 5_000, now)).toBe(0);
  });
  it("accepts Date objects", () => {
    const now = new Date("2026-06-29T16:00:00Z");
    const exp = new Date("2026-06-29T16:30:00Z");
    expect(remainingSeconds(exp, now)).toBe(1800);
  });
});

describe("isExpired", () => {
  it("is true at or past expiry", () => {
    const now = 1_000_000;
    expect(isExpired(now - 1, now)).toBe(true);
    expect(isExpired(now, now)).toBe(true);
    expect(isExpired(now + 1000, now)).toBe(false);
  });
});
