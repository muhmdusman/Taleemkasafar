import { describe, expect, it } from "vitest";
import {
  MESSAGE_MAX,
  MESSAGE_MIN,
  NAME_MAX,
  firstInvalidField,
  isLikelySpam,
  isValidPakistaniPhone,
  validateContact,
  type ContactInput,
} from "./validate";

const valid: ContactInput = {
  name: "Ayesha Khan",
  email: "ayesha@example.com",
  phone: "",
  topic: "students",
  message: "I want to know when ECAT practice will be available.",
};

describe("validateContact", () => {
  it("accepts a valid submission and trims values", () => {
    const r = validateContact({ ...valid, name: "  Ayesha Khan  ", email: " ayesha@example.com " });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.values.name).toBe("Ayesha Khan");
      expect(r.values.email).toBe("ayesha@example.com");
      expect(r.values.phone).toBeNull();
      expect(r.values.topic).toBe("students");
    }
  });

  it("requires name, email, topic and message", () => {
    const r = validateContact({});
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.errors).sort()).toEqual(["email", "message", "name", "topic"]);
      expect(r.errors.phone).toBeUndefined();
    }
  });

  it("enforces name length", () => {
    const short = validateContact({ ...valid, name: "A" });
    const long = validateContact({ ...valid, name: "A".repeat(NAME_MAX + 1) });
    expect(!short.ok && short.errors.name).toMatch(/at least/);
    expect(!long.ok && long.errors.name).toMatch(/more than/);
  });

  it.each(["not-an-email", "a@b", "a b@c.com", "@example.com"])("rejects email %s", (email) => {
    const r = validateContact({ ...valid, email });
    expect(!r.ok && r.errors.email).toBeTruthy();
  });

  it("rejects an unknown topic", () => {
    const r = validateContact({ ...valid, topic: "pricing-hack" });
    expect(!r.ok && r.errors.topic).toMatch(/from the list/);
  });

  it("enforces message length (trimmed)", () => {
    const short = validateContact({ ...valid, message: `  ${"x".repeat(MESSAGE_MIN - 1)}  ` });
    const exact = validateContact({ ...valid, message: "x".repeat(MESSAGE_MIN) });
    const long = validateContact({ ...valid, message: "x".repeat(MESSAGE_MAX + 1) });
    expect(!short.ok && short.errors.message).toMatch(/at least/);
    expect(exact.ok).toBe(true);
    expect(!long.ok && long.errors.message).toMatch(/more than/);
  });

  it("normalises a valid phone number", () => {
    const r = validateContact({ ...valid, phone: "+92 300 123-4567" });
    expect(r.ok && r.values.phone).toBe("+923001234567");
  });

  it("rejects an invalid phone number", () => {
    const r = validateContact({ ...valid, phone: "12345" });
    expect(!r.ok && r.errors.phone).toMatch(/Pakistani number/);
  });
});

describe("isValidPakistaniPhone", () => {
  it.each([
    "03001234567",
    "0300-1234567",
    "0300 1234567",
    "+923001234567",
    "+92 300 1234567",
    "+92-300-1234567",
    "00923001234567",
    "042-35711111",
    "(042) 3571 1111",
  ])("accepts %s", (phone) => {
    expect(isValidPakistaniPhone(phone)).toBe(true);
  });

  it.each([
    "3001234567", // no 0 / +92
    "0300123456", // too short
    "030012345678", // too long
    "+13001234567", // not Pakistan
    "+920001234567", // starts with 0 after country code
    "0300-12345ab",
    "",
  ])("rejects %s", (phone) => {
    expect(isValidPakistaniPhone(phone)).toBe(false);
  });
});

describe("honeypot + focus helpers", () => {
  it("flags a filled honeypot as spam", () => {
    expect(isLikelySpam({ ...valid, website: "http://spam.example" })).toBe(true);
    expect(isLikelySpam({ ...valid, website: "  " })).toBe(false);
    expect(isLikelySpam(valid)).toBe(false);
  });

  it("returns the first invalid field in form order", () => {
    expect(firstInvalidField({ message: "x", email: "x" })).toBe("email");
    expect(firstInvalidField({})).toBeUndefined();
  });
});
