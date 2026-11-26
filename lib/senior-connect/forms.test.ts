import { describe, expect, it, vi } from "vitest";
import { CONSENT_YES, SIGNUP_FORMS, firstInvalidField, validateSignup } from "./forms";
import { buildWeb3FormsPayload, submitSignup, WEB3FORMS_ENDPOINT } from "./web3forms";

const student = {
  fullName: "  Ayesha Khan ",
  email: "ayesha@example.com",
  phone: "0300-1234567",
  entryTest: "net",
  targetUniversity: "NUST",
  consent: CONSENT_YES,
};

const senior = {
  fullName: "Bilal Ahmed",
  email: "bilal@seecs.edu.pk",
  phone: "+92 321 7654321",
  university: "NUST",
  campus: "H-12 Islamabad",
  program: "",
  consent: CONSENT_YES,
};

describe("validateSignup", () => {
  it("accepts a complete student sign-up and normalises values", () => {
    const r = validateSignup("student", student);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.values.fullName).toBe("Ayesha Khan");
      expect(r.values.phone).toBe("03001234567");
      expect(r.values.entryTest).toBe("net");
    }
  });

  it("accepts a senior with the optional programme left empty", () => {
    const r = validateSignup("senior", senior);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.values.phone).toBe("+923217654321");
      expect(r.values.program).toBe("");
    }
  });

  it("requires every required field with a specific message", () => {
    const r = validateSignup("senior", {});
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.fullName).toBe("Enter your full name.");
      expect(r.errors.university).toBe("Enter your university.");
      expect(r.errors.campus).toBe("Enter your campus.");
      expect(r.errors.consent).toMatch(/tick/);
      expect(r.errors.program).toBeUndefined();
    }
  });

  it("rejects bad email, non-Pakistani phone, unknown test and long text", () => {
    const r = validateSignup("student", {
      ...student,
      email: "not-an-email",
      phone: "12345",
      entryTest: "sat",
      targetUniversity: "x".repeat(121),
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.errors).sort()).toEqual(
        ["email", "entryTest", "phone", "targetUniversity"].sort(),
      );
    }
  });

  it("requires consent", () => {
    const r = validateSignup("student", { ...student, consent: "" });
    expect(r.ok).toBe(false);
  });

  it("reports the first invalid field in form order", () => {
    const r = validateSignup("student", { ...student, email: "", targetUniversity: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(firstInvalidField("student", r.errors)).toBe("email");
  });

  it("collects the five details the owner asked for from seniors", () => {
    const names = SIGNUP_FORMS.senior.fields.map((f) => f.name);
    for (const n of ["fullName", "phone", "university", "email", "campus"]) {
      expect(names).toContain(n);
    }
  });
});

describe("Web3Forms delivery", () => {
  it("builds a readable payload with reply-to email and labels", () => {
    const r = validateSignup("student", student);
    if (!r.ok) throw new Error("fixture invalid");
    const p = buildWeb3FormsPayload("student", r.values, "key-123");
    expect(p.access_key).toBe("key-123");
    expect(p.email).toBe("ayesha@example.com");
    expect(p.botcheck).toBe(false);
    expect(p["Entry test you're preparing for"]).toBe("NET (NUST)");
    expect(p["Consent to be contacted"]).toBe("Yes");
    expect(String(p.subject)).toContain("Ayesha Khan");
  });

  it("returns not_configured without an access key and never calls fetch", async () => {
    const fetchImpl = vi.fn();
    const res = await submitSignup("senior", {}, undefined, fetchImpl as unknown as typeof fetch);
    expect(res).toEqual({ ok: false, reason: "not_configured" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("posts JSON to the endpoint and reports success", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 }));
    const r = validateSignup("senior", senior);
    if (!r.ok) throw new Error("fixture invalid");
    const res = await submitSignup("senior", r.values, "key", fetchImpl as unknown as typeof fetch);
    expect(res).toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(WEB3FORMS_ENDPOINT);
    expect(JSON.parse(String(init.body)).Campus).toBe("H-12 Islamabad");
  });

  it("maps rate limits, rejections and network errors", async () => {
    const r = validateSignup("senior", senior);
    if (!r.ok) throw new Error("fixture invalid");
    const call = (impl: unknown) => submitSignup("senior", r.values, "key", impl as typeof fetch);
    expect(await call(async () => new Response("{}", { status: 429 }))).toEqual({ ok: false, reason: "rate_limited" });
    expect(await call(async () => new Response(JSON.stringify({ success: false }), { status: 400 }))).toEqual({ ok: false, reason: "rejected" });
    expect(await call(async () => { throw new TypeError("offline"); })).toEqual({ ok: false, reason: "network" });
  });
});
