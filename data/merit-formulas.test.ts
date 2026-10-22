import { describe, it, expect } from "vitest";
import {
  getUniversities,
  getUniversityBySlug,
  getUniversitySlugs,
  IBCC_GRADE_EQUIVALENCE,
  IBCC_SOURCE_PAGES,
  MERIT_SOURCE,
} from "./merit-formulas";

const universities = getUniversities();
const formulas = universities.flatMap((u) => u.formulas);
const URL_SAFE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PDF_PAGES = MERIT_SOURCE.pageCount; // 11

function inPdf(pages: readonly number[]) {
  return pages.length > 0 && pages.every((p) => Number.isInteger(p) && p >= 1 && p <= PDF_PAGES);
}

describe("merit-formulas data", () => {
  it("covers all 18 institutions in the PDF formula section (p3-5), in order", () => {
    expect(getUniversitySlugs()).toEqual([
      "nust",
      "uet-lahore",
      "fast-nuces",
      "giki",
      "pieas",
      "nutech",
      "comsats",
      "air-university",
      "bahria-university",
      "ist",
      "ned-uet-karachi",
      "muet-jamshoro",
      "punjab-university",
      "qau",
      "iiui",
      "umt",
      "mdcat",
      "nums",
    ]);
    expect(formulas).toHaveLength(19); // FAST-NUCES has two routes
  });

  it("weights of every formula sum to 100", () => {
    for (const f of formulas) {
      const sum = f.components.reduce((s, c) => s + c.weightPercent, 0);
      expect(sum, f.id).toBe(100);
    }
  });

  it("every weight is in (0, 100] and every stated total is positive", () => {
    for (const f of formulas) {
      for (const c of f.components) {
        expect(c.weightPercent, `${f.id}.${c.key}`).toBeGreaterThan(0);
        expect(c.weightPercent, `${f.id}.${c.key}`).toBeLessThanOrEqual(100);
        if (c.defaultTotalMarks !== undefined) {
          expect(c.defaultTotalMarks, `${f.id}.${c.key}`).toBeGreaterThan(0);
        }
        if (c.inputMode === "percentage") {
          expect(c.defaultTotalMarks, `${f.id}.${c.key}`).toBeUndefined();
        }
      }
    }
  });

  it("no formula repeats a component key", () => {
    for (const f of formulas) {
      const keys = f.components.map((c) => c.key);
      expect(new Set(keys).size, f.id).toBe(keys.length);
    }
  });

  it("every university, formula, flag and minimum cites pages within 1..11", () => {
    for (const u of universities) {
      expect(inPdf(u.sourcePages), u.slug).toBe(true);
      for (const f of u.formulas) {
        expect(inPdf(f.sourcePages), f.id).toBe(true);
        // A formula's pages must be a subset of its university's pages.
        expect(u.sourcePages, f.id).toEqual(expect.arrayContaining(f.sourcePages));
        for (const flag of f.reviewFlags) expect(inPdf(flag.sourcePages), `${f.id}:${flag.code}`).toBe(true);
        for (const c of f.components) {
          for (const m of c.qualifyingMinimums ?? []) {
            expect(inPdf(m.sourcePages), `${f.id}.${c.key}:${m.label}`).toBe(true);
          }
        }
      }
    }
    expect(inPdf(IBCC_SOURCE_PAGES)).toBe(true);
  });

  it("slugs are unique and url-safe; formula ids are globally unique", () => {
    const slugs = universities.map((u) => u.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(URL_SAFE);

    const ids = universities.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);

    const formulaIds = formulas.map((f) => f.id);
    expect(new Set(formulaIds).size).toBe(formulaIds.length);
    for (const id of formulaIds) expect(id).toMatch(URL_SAFE);

    for (const u of universities) {
      const fSlugs = u.formulas.map((f) => f.slug);
      expect(new Set(fSlugs).size, u.slug).toBe(fSlugs.length);
      for (const s of fSlugs) expect(s).toMatch(URL_SAFE);
      for (const f of u.formulas) expect(f.universityId).toBe(u.id);
    }
  });

  it("needsReview mirrors reviewFlags, and a missing year is always flagged", () => {
    for (const f of formulas) {
      expect(f.needsReview, f.id).toBe(f.reviewFlags.length > 0);
      if (f.applicableYear === null) {
        expect(f.reviewFlags.map((x) => x.code), f.id).toContain("year-not-stated");
      }
    }
  });

  it("components without a stated total are flagged total-not-stated", () => {
    for (const f of formulas) {
      const missingTotal = f.components.some(
        (c) => c.inputMode === "marks" && c.defaultTotalMarks === undefined,
      );
      const flagged = f.reviewFlags.some((x) => x.code === "total-not-stated");
      expect(flagged, f.id).toBe(missingTotal);
    }
  });

  it("qualifying minimums are percentages", () => {
    for (const f of formulas) {
      for (const c of f.components) {
        for (const m of c.qualifyingMinimums ?? []) {
          expect(m.minimumPercent).toBeGreaterThan(0);
          expect(m.minimumPercent).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("getUniversityBySlug finds known slugs and returns undefined otherwise", () => {
    expect(getUniversityBySlug("nust")?.shortName).toBe("NUST");
    expect(getUniversityBySlug("fast-nuces")?.formulas.map((f) => f.slug)).toEqual(["nu-test", "nts"]);
    expect(getUniversityBySlug("does-not-exist")).toBeUndefined();
  });

  it("IBCC equivalence table matches PDF p9", () => {
    expect(IBCC_GRADE_EQUIVALENCE).toEqual([
      { grade: "A*", percent: 90 },
      { grade: "A", percent: 85 },
      { grade: "B", percent: 75 },
      { grade: "C", percent: 65 },
      { grade: "D", percent: 55 },
      { grade: "E", percent: 45 },
    ]);
  });
});
