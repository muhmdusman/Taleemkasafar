import { describe, it, expect } from "vitest";
import { getUniversities } from "@/data/merit-formulas";
import {
  calculateMerit,
  formatScore,
  roundTo,
  MERIT_DISCLAIMER,
  type MeritResult,
} from "./calculate";
import type { MeritInput } from "./validate";
import type { MeritFormula } from "./types";

const allFormulas: MeritFormula[] = getUniversities().flatMap((u) => u.formulas);

function formulaById(id: string): MeritFormula {
  const f = allFormulas.find((x) => x.id === id);
  if (!f) throw new Error(`formula ${id} not found`);
  return f;
}

function calc(id: string, input: MeritInput): MeritResult {
  const outcome = calculateMerit(formulaById(id), input);
  if (!outcome.ok) {
    throw new Error(`expected ok, got ${JSON.stringify(outcome.errors)}`);
  }
  return outcome.result;
}

/**
 * One hand-computed example per formula. Weights/denominators are the PDF's
 * (pages in data/merit-formulas.ts). The PDF has no worked examples, so these
 * are our own; arithmetic shown per case.
 */
const CASES: { id: string; input: MeritInput; expected: number }[] = [
  // NUST (p3): 160/200×75 = 60; 990/1100×15 = 13.5; 880/1100×10 = 8 → 81.5
  {
    id: "nust-net",
    input: { entryTest: { obtained: 160 }, intermediate: { obtained: 990 }, matric: { obtained: 880 } },
    expected: 81.5,
  },
  // UET Lahore (p3): 300/400×33 = 24.75; 990/1100×50 = 45; 1045/1100×17 = 16.15 → 85.9
  {
    id: "uet-lahore-ecat",
    input: { entryTest: { obtained: 300 }, intermediate: { obtained: 990 }, matric: { obtained: 1045 } },
    expected: 85.9,
  },
  // FAST NU route (p3): 70/100×50 = 35; 880/1100×40 = 32; 990/1100×10 = 9 → 76
  {
    id: "fast-nuces-nu-test",
    input: { entryTest: { obtained: 70 }, intermediate: { obtained: 880 }, matric: { obtained: 990 } },
    expected: 76,
  },
  // FAST NTS route (p3): 80/100×50 = 40; 935/1100×50 = 42.5 → 82.5
  {
    id: "fast-nuces-nts",
    input: { entryTest: { obtained: 80 }, intermediate: { obtained: 935 } },
    expected: 82.5,
  },
  // GIKI (p3), totals user-supplied: 180/300×85 = 51; 990/1100×15 = 13.5 → 64.5
  {
    id: "giki-test",
    input: { entryTest: { obtained: 180, total: 300 }, intermediate: { obtained: 990, total: 1100 } },
    expected: 64.5,
  },
  // PIEAS (p3), test total user-supplied: 70/100×60 = 42; 990/1100×25 = 22.5; 1045/1100×15 = 14.25 → 78.75
  {
    id: "pieas-test",
    input: { entryTest: { obtained: 70, total: 100 }, intermediate: { obtained: 990 }, matric: { obtained: 1045 } },
    expected: 78.75,
  },
  // NUTECH (p3): 60/100×70 = 42; 880/1100×20 = 16; 990/1100×10 = 9 → 67
  {
    id: "nutech-nuet",
    input: { entryTest: { obtained: 60 }, intermediate: { obtained: 880 }, matric: { obtained: 990 } },
    expected: 67,
  },
  // COMSATS (p4): 75/100×50 = 37.5; 935/1100×40 = 34; 1045/1100×10 = 9.5 → 81
  {
    id: "comsats-nts",
    input: { entryTest: { obtained: 75 }, intermediate: { obtained: 935 }, matric: { obtained: 1045 } },
    expected: 81,
  },
  // Air University (p4): 60/100×50 = 30; 880/1100×35 = 28; 770/1100×15 = 10.5 → 68.5
  {
    id: "air-university-test",
    input: { entryTest: { obtained: 60 }, intermediate: { obtained: 880 }, matric: { obtained: 770 } },
    expected: 68.5,
  },
  // Bahria (p4), academics as %: 70/100×50 = 35; 82/100×50 = 41 → 76
  {
    id: "bahria-university-bu-test",
    input: { entryTest: { obtained: 70 }, academics: { obtained: 82 } },
    expected: 76,
  },
  // IST (p4): 65/100×50 = 32.5; 990/1100×40 = 36; 880/1100×10 = 8 → 76.5
  {
    id: "ist-test",
    input: { entryTest: { obtained: 65 }, intermediate: { obtained: 990 }, matric: { obtained: 880 } },
    expected: 76.5,
  },
  // NED (p4), academic total user-supplied: 72/100×50 = 36; 990/1100×50 = 45 → 81
  {
    id: "ned-uet-karachi-test",
    input: { entryTest: { obtained: 72 }, academics: { obtained: 990, total: 1100 } },
    expected: 81,
  },
  // MUET (p4): 50/100×60 = 30; 880/1100×30 = 24; 765/850×10 = 9 → 63
  {
    id: "muet-jamshoro-test",
    input: { entryTest: { obtained: 50 }, intermediate: { obtained: 880 }, matric: { obtained: 765 } },
    expected: 63,
  },
  // PU (p4), academic total user-supplied: 80/100×25 = 20; 1980/2200×75 = 67.5 → 87.5
  {
    id: "punjab-university-pu-test",
    input: { entryTest: { obtained: 80 }, academics: { obtained: 1980, total: 2200 } },
    expected: 87.5,
  },
  // QAU (p4): 1870/2200×70 = 59.5; 60/100×30 = 18 → 77.5
  {
    id: "qau-test",
    input: { academics: { obtained: 1870, total: 2200 }, entryTest: { obtained: 60 } },
    expected: 77.5,
  },
  // IIUI (p5): 64/100×50 = 32; 1760/2200×50 = 40 → 72
  {
    id: "iiui-test",
    input: { entryTest: { obtained: 64 }, academics: { obtained: 1760, total: 2200 } },
    expected: 72,
  },
  // UMT (p5): 1650/2200×70 = 52.5; 50/100×30 = 15 → 67.5
  {
    id: "umt-test",
    input: { academics: { obtained: 1650, total: 2200 }, entryTest: { obtained: 50 } },
    expected: 67.5,
  },
  // MDCAT (p5): 170/200×50 = 42.5; 1012/1100×40 = 36.8; 1045/1100×10 = 9.5 → 88.8
  {
    id: "mdcat-pmdc",
    input: { entryTest: { obtained: 170 }, intermediate: { obtained: 1012 }, matric: { obtained: 1045 } },
    expected: 88.8,
  },
  // NUMS (p5): 120/150×50 = 40; 990/1100×40 = 36; 990/1100×10 = 9 → 85
  {
    id: "nums-test",
    input: { entryTest: { obtained: 120 }, intermediate: { obtained: 990 }, matric: { obtained: 990 } },
    expected: 85,
  },
];

/** Inputs where every component scores `fraction` of its total. */
function uniformInput(f: MeritFormula, fraction: number): MeritInput {
  const input: MeritInput = {};
  for (const c of f.components) {
    const total = c.inputMode === "percentage" ? 100 : (c.defaultTotalMarks ?? 500);
    input[c.key] = { obtained: total * fraction, total };
  }
  return input;
}

describe("calculateMerit — hand-computed example per formula", () => {
  it("covers every formula in the data file", () => {
    expect(CASES.map((c) => c.id).sort()).toEqual(allFormulas.map((f) => f.id).sort());
  });

  it.each(CASES)("$id → $expected", ({ id, input, expected }) => {
    expect(calc(id, input).aggregate).toBeCloseTo(expected, 10);
  });
});

describe("calculateMerit — boundaries for every formula", () => {
  it.each(allFormulas.map((f) => [f.id, f] as const))("%s: perfect = 100, zero = 0", (_id, f) => {
    const perfect = calculateMerit(f, uniformInput(f, 1));
    const zero = calculateMerit(f, uniformInput(f, 0));
    expect(perfect.ok && perfect.result.aggregate).toBeCloseTo(100, 10);
    expect(zero.ok && zero.result.aggregate).toBe(0);
  });
});

describe("calculateMerit — result shape", () => {
  it("keeps full precision and returns a per-component breakdown", () => {
    // NUST: 150/200×75 = 56.25; 950/1100×15 = 12.954545…; 1000/1100×10 = 9.090909…
    // → 56.25 + 24250/1100 = 78.2954545…
    const r = calc("nust-net", {
      entryTest: { obtained: 150 },
      intermediate: { obtained: 950 },
      matric: { obtained: 1000 },
    });
    expect(r.aggregate).toBeCloseTo(56.25 + 24250 / 1100, 12);
    expect(formatScore(r.aggregate)).toBe("78.30");

    const [test, inter, matric] = r.components;
    expect(test).toMatchObject({ key: "entryTest", obtained: 150, total: 200, weightPercent: 75 });
    expect(test.percentage).toBeCloseTo(75, 12);
    expect(test.contribution).toBeCloseTo(56.25, 12);
    expect(inter.total).toBe(1100);
    expect(inter.percentage).toBeCloseTo((950 / 1100) * 100, 12);
    expect(matric.contribution).toBeCloseTo(10000 / 1100, 12);
  });

  it("returns formula text, source pages, review flags and the disclaimer", () => {
    const f = formulaById("comsats-nts");
    const r = calc("comsats-nts", {
      entryTest: { obtained: 50 },
      intermediate: { obtained: 550 },
      matric: { obtained: 550 },
    });
    expect(r.formulaId).toBe("comsats-nts");
    expect(r.universityId).toBe("comsats");
    expect(r.formulaText).toBe(f.formulaText);
    expect(r.sourcePages).toEqual(f.sourcePages);
    expect(r.needsReview).toBe(true);
    expect(r.reviewFlags.map((x) => x.code)).toContain("total-inconsistent");
    expect(r.disclaimer).toBe(
      "These are estimates. Always verify with the official university admission notification.",
    );
    expect(MERIT_DISCLAIMER).toBe(r.disclaimer);
  });

  it("uses a user-supplied total instead of the PDF default", () => {
    // NUST with a 1200-mark matric board: 160/200×75 = 60; 990/1100×15 = 13.5; 960/1200×10 = 8 → 81.5
    const r = calc("nust-net", {
      entryTest: { obtained: 160 },
      intermediate: { obtained: 990 },
      matric: { obtained: 960, total: 1200 },
    });
    expect(r.components[2].total).toBe(1200);
    expect(r.aggregate).toBeCloseTo(81.5, 10);
  });

  it("accepts numeric strings from form fields", () => {
    const r = calc("fast-nuces-nts", {
      entryTest: { obtained: " 80 " },
      intermediate: { obtained: "935", total: "1100" },
    });
    expect(r.aggregate).toBeCloseTo(82.5, 10);
  });
});

describe("calculateMerit — qualifying minimums (PDF-stated)", () => {
  it("MDCAT: 110/200 = 55% meets MBBS (55%) and BDS (45%)", () => {
    const r = calc("mdcat-pmdc", {
      entryTest: { obtained: 110 },
      intermediate: { obtained: 900 },
      matric: { obtained: 900 },
    });
    expect(r.components[0].qualifyingChecks.map((c) => [c.label, c.met])).toEqual([
      ["MBBS", true],
      ["BDS", true],
    ]);
  });

  it("MDCAT: 100/200 = 50% fails MBBS (55%) but meets BDS (45%)", () => {
    const r = calc("mdcat-pmdc", {
      entryTest: { obtained: 100 },
      intermediate: { obtained: 900 },
      matric: { obtained: 900 },
    });
    expect(r.components[0].qualifyingChecks.map((c) => [c.label, c.met])).toEqual([
      ["MBBS", false],
      ["BDS", true],
    ]);
  });

  it("NED: below 50% on the test is flagged as not qualifying", () => {
    const r = calc("ned-uet-karachi-test", {
      entryTest: { obtained: 49 },
      academics: { obtained: 900, total: 1100 },
    });
    expect(r.components[0].qualifyingChecks).toMatchObject([{ minimumPercent: 50, met: false }]);
  });

  it("MUET: 40/100 meets the 40% minimum", () => {
    const r = calc("muet-jamshoro-test", {
      entryTest: { obtained: 40 },
      intermediate: { obtained: 900 },
      matric: { obtained: 700 },
    });
    expect(r.components[0].qualifyingChecks).toMatchObject([{ minimumPercent: 40, met: true }]);
  });

  it("components without a PDF minimum have no checks", () => {
    const r = calc("nust-net", {
      entryTest: { obtained: 1 },
      intermediate: { obtained: 1 },
      matric: { obtained: 1 },
    });
    expect(r.components.every((c) => c.qualifyingChecks.length === 0)).toBe(true);
  });
});

describe("calculateMerit — invalid input", () => {
  it("returns field errors instead of a result", () => {
    const outcome = calculateMerit(formulaById("nust-net"), {
      entryTest: { obtained: 250 },
      intermediate: { obtained: 990 },
    });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.errors.map((e) => [e.field, e.code])).toEqual([
      ["entryTest.obtained", "exceeds-total"],
      ["matric.obtained", "required"],
    ]);
  });
});

describe("roundTo / formatScore", () => {
  it("rounds half-up despite float artefacts", () => {
    expect(roundTo(1.005)).toBe(1.01);
    expect(roundTo(78.295454545)).toBe(78.3);
    expect(roundTo(85.9)).toBe(85.9);
  });

  it("formats with fixed decimals", () => {
    expect(formatScore(81.5)).toBe("81.50");
    expect(formatScore(0)).toBe("0.00");
    expect(formatScore(100)).toBe("100.00");
    expect(formatScore(66.6666, 1)).toBe("66.7");
  });
});
