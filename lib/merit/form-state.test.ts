import { describe, expect, it } from "vitest";
import { getUniversityBySlug } from "@/data/merit-formulas";
import { calculateMerit } from "./calculate";
import {
  buildMeritInput,
  clearFormulaValues,
  formFieldValue,
  formStateKey,
  type MeritFormValues,
} from "./form-state";

const fast = getUniversityBySlug("fast-nuces")!;
const [nuTest, nts] = fast.formulas;
const nust = getUniversityBySlug("nust")!.formulas[0];
const comp = (f: typeof nust, key: string) => f.components.find((c) => c.key === key)!;

function set(values: MeritFormValues, f: typeof nust, key: string, part: "obtained" | "total", v: string) {
  return { ...values, [formStateKey(f, comp(f, key), part)]: v };
}

describe("merit form state", () => {
  it("keeps shared marks when switching FAST-NUCES routes", () => {
    let values: MeritFormValues = {};
    values = set(values, nuTest, "entryTest", "obtained", "70");
    values = set(values, nuTest, "intermediate", "obtained", "950");
    values = set(values, nuTest, "matric", "obtained", "1000");

    // F.Sc Marks is the same component on both routes: carried over.
    expect(formFieldValue(values, nts, comp(nts, "intermediate"), "obtained")).toBe("950");
    // NU Test Score and NTS Score are different tests: not carried over.
    expect(formFieldValue(values, nts, comp(nts, "entryTest"), "obtained")).toBe("");
    // Switching back restores everything.
    expect(formFieldValue(values, nuTest, comp(nuTest, "entryTest"), "obtained")).toBe("70");
    expect(formFieldValue(values, nuTest, comp(nuTest, "matric"), "obtained")).toBe("1000");
  });

  it("keeps totals per formula and pre-fills the PDF default when untouched", () => {
    const values = set({}, nuTest, "intermediate", "total", "1050");
    expect(formFieldValue(values, nuTest, comp(nuTest, "intermediate"), "total")).toBe("1050");
    expect(formFieldValue(values, nts, comp(nts, "intermediate"), "total")).toBe("1100");
  });

  it("an emptied pre-filled total is a total-required error, not the default", () => {
    let values: MeritFormValues = {};
    values = set(values, nust, "entryTest", "obtained", "150");
    values = set(values, nust, "intermediate", "obtained", "990");
    values = set(values, nust, "matric", "obtained", "1045");
    expect(calculateMerit(nust, buildMeritInput(values, nust)).ok).toBe(true);

    values = set(values, nust, "matric", "total", "");
    expect(formFieldValue(values, nust, comp(nust, "matric"), "total")).toBe("");
    const outcome = calculateMerit(nust, buildMeritInput(values, nust));
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.errors.map((e) => [e.field, e.code])).toEqual([["matric.total", "total-required"]]);
  });

  it("clear drops only the current formula's fields", () => {
    let values: MeritFormValues = {};
    values = set(values, nuTest, "entryTest", "obtained", "70");
    values = set(values, nuTest, "matric", "total", "1050");
    values = set(values, nts, "entryTest", "obtained", "60");
    values = set(values, nts, "entryTest", "total", "120");
    const cleared = clearFormulaValues(values, nts);
    expect(formFieldValue(cleared, nts, comp(nts, "entryTest"), "obtained")).toBe("");
    expect(formFieldValue(cleared, nts, comp(nts, "entryTest"), "total")).toBe("100");
    expect(formFieldValue(cleared, nuTest, comp(nuTest, "entryTest"), "obtained")).toBe("70");
    expect(formFieldValue(cleared, nuTest, comp(nuTest, "matric"), "total")).toBe("1050");
  });
});
