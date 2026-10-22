import { describe, it, expect } from "vitest";
import { getUniversityBySlug } from "@/data/merit-formulas";
import { validateMeritInput, MAX_TOTAL_MARKS, type MeritInput } from "./validate";
import type { MeritFormula } from "./types";

function only(slug: string): MeritFormula {
  const u = getUniversityBySlug(slug);
  if (!u) throw new Error(`university ${slug} not found`);
  return u.formulas[0];
}

const nust = only("nust"); // entryTest /200, intermediate /1100, matric /1100
const giki = only("giki"); // no stated totals
const bahria = only("bahria-university"); // academics as a percentage

const validNust: MeritInput = {
  entryTest: { obtained: 150 },
  intermediate: { obtained: 900 },
  matric: { obtained: 900 },
};

function errorsFor(formula: MeritFormula, input: MeritInput) {
  const r = validateMeritInput(formula, input);
  return r.ok ? [] : r.errors.map((e) => [e.field, e.code]);
}

describe("validateMeritInput", () => {
  it("accepts valid input and fills PDF default totals", () => {
    const r = validateMeritInput(nust, validNust);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.values).toEqual({
      entryTest: { obtained: 150, total: 200 },
      intermediate: { obtained: 900, total: 1100 },
      matric: { obtained: 900, total: 1100 },
    });
  });

  it("flags every missing component as required", () => {
    expect(errorsFor(nust, {})).toEqual([
      ["entryTest.obtained", "required"],
      ["intermediate.obtained", "required"],
      ["matric.obtained", "required"],
    ]);
  });

  it("treats null, undefined and blank strings as missing", () => {
    expect(
      errorsFor(nust, {
        entryTest: { obtained: null },
        intermediate: { obtained: undefined },
        matric: { obtained: "   " },
      }),
    ).toEqual([
      ["entryTest.obtained", "required"],
      ["intermediate.obtained", "required"],
      ["matric.obtained", "required"],
    ]);
  });

  it("rejects NaN, Infinity and non-numeric strings", () => {
    expect(
      errorsFor(nust, {
        entryTest: { obtained: Number.NaN },
        intermediate: { obtained: Number.POSITIVE_INFINITY },
        matric: { obtained: "9OO" },
      }),
    ).toEqual([
      ["entryTest.obtained", "not-a-number"],
      ["intermediate.obtained", "not-a-number"],
      ["matric.obtained", "not-a-number"],
    ]);
    expect(errorsFor(nust, { ...validNust, matric: { obtained: "0x10" } })).toEqual([
      ["matric.obtained", "not-a-number"],
    ]);
  });

  it("rejects negative obtained marks", () => {
    expect(errorsFor(nust, { ...validNust, entryTest: { obtained: -1 } })).toEqual([
      ["entryTest.obtained", "negative"],
    ]);
  });

  it("rejects obtained > total (default and user-supplied totals)", () => {
    expect(errorsFor(nust, { ...validNust, entryTest: { obtained: 201 } })).toEqual([
      ["entryTest.obtained", "exceeds-total"],
    ]);
    expect(errorsFor(nust, { ...validNust, matric: { obtained: 1000, total: 850 } })).toEqual([
      ["matric.obtained", "exceeds-total"],
    ]);
  });

  it("allows obtained == total and obtained == 0", () => {
    expect(errorsFor(nust, { ...validNust, entryTest: { obtained: 200 } })).toEqual([]);
    expect(errorsFor(nust, { ...validNust, entryTest: { obtained: 0 } })).toEqual([]);
  });

  it("rejects total = 0, negative, non-numeric and absurdly large totals", () => {
    expect(errorsFor(nust, { ...validNust, matric: { obtained: 0, total: 0 } })).toEqual([
      ["matric.total", "total-not-positive"],
    ]);
    expect(errorsFor(nust, { ...validNust, matric: { obtained: 0, total: -5 } })).toEqual([
      ["matric.total", "total-not-positive"],
    ]);
    expect(errorsFor(nust, { ...validNust, matric: { obtained: 1, total: Number.NaN } })).toEqual([
      ["matric.total", "total-not-a-number"],
    ]);
    expect(
      errorsFor(nust, { ...validNust, matric: { obtained: 1, total: MAX_TOTAL_MARKS + 1 } }),
    ).toEqual([["matric.total", "total-too-large"]]);
  });

  it("treats an explicitly emptied total as total-required, never the PDF default", () => {
    expect(errorsFor(nust, { ...validNust, matric: { obtained: 900, total: "" } })).toEqual([
      ["matric.total", "total-required"],
    ]);
    expect(errorsFor(nust, { ...validNust, intermediate: { obtained: 900, total: "  " } })).toEqual([
      ["intermediate.total", "total-required"],
    ]);
    // Omitted (undefined/null) still means "use the default".
    expect(errorsFor(nust, { ...validNust, matric: { obtained: 900, total: null } })).toEqual([]);
  });

  it("requires a total when the PDF does not state one", () => {
    expect(
      errorsFor(giki, { entryTest: { obtained: 100 }, intermediate: { obtained: 900 } }),
    ).toEqual([
      ["entryTest.total", "total-required"],
      ["intermediate.total", "total-required"],
    ]);
  });

  it("reports total and obtained errors for the same component together", () => {
    expect(errorsFor(giki, { entryTest: { obtained: -1 }, intermediate: { obtained: 1, total: 100 } })).toEqual([
      ["entryTest.total", "total-required"],
      ["entryTest.obtained", "negative"],
    ]);
  });

  it("percentage components cap at 100 and ignore any supplied total", () => {
    expect(
      errorsFor(bahria, { entryTest: { obtained: 50 }, academics: { obtained: 101 } }),
    ).toEqual([["academics.obtained", "exceeds-total"]]);
    const r = validateMeritInput(bahria, {
      entryTest: { obtained: 50 },
      academics: { obtained: 80, total: 1100 },
    });
    expect(r.ok && r.values.academics).toEqual({ obtained: 80, total: 100 });
  });

  it("returns human messages that name the field", () => {
    const r = validateMeritInput(nust, { ...validNust, entryTest: { obtained: 201 } });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors[0]).toEqual({
      field: "entryTest.obtained",
      component: "entryTest",
      part: "obtained",
      code: "exceeds-total",
      message: "NET Score can't be more than the total marks (200).",
    });
  });

  it("ignores input keys the formula doesn't use", () => {
    // FAST-NUCES NTS route has no matric component (p3).
    const fastNts = getUniversityBySlug("fast-nuces")!.formulas.find((f) => f.slug === "nts")!;
    expect(errorsFor(fastNts, {
      entryTest: { obtained: 50 },
      intermediate: { obtained: 900 },
      matric: { obtained: Number.NaN },
    })).toEqual([]);
  });
});
