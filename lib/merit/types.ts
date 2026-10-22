/**
 * Merit-calculator domain types (plain data, no React, no DB).
 *
 * Shaped so each record maps 1:1 to a future table:
 *   universities            -> University (minus `formulas`)
 *   merit_formulas          -> MeritFormula (FK `universityId`)
 *   merit_formula_components-> MeritComponent (FK formula id + position)
 *   merit_review_flags      -> ReviewFlag (FK formula id)
 *
 * Every record carries the page numbers of the source PDF
 * ("Pakistan Universities Merit Formulas and Admission Criteria Guide", 11 pages)
 * it was extracted from.
 */

/** Which part of the student's record a component weighs. */
export type ComponentKey =
  /** University / centralized entry test score. */
  | "entryTest"
  /** F.Sc / HSSC / HSC (Intermediate) marks. */
  | "intermediate"
  /** Matric / SSC marks. */
  | "matric"
  /**
   * A single combined academic score (e.g. "Academic Score / Total Academic").
   * Used where the PDF does NOT split matric and intermediate.
   */
  | "academics";

/**
 * How the student enters a component.
 * - `marks`: obtained + total marks (total may default from the PDF).
 * - `percentage`: a 0-100 percentage (total is fixed at 100). Only used where
 *   the PDF formula itself takes a percentage (Bahria "Academic Percentage").
 */
export type InputMode = "marks" | "percentage";

/** A minimum score the PDF says is mandatory to qualify (e.g. MDCAT 55% MBBS). */
export type QualifyingMinimum = {
  /** Who/what the minimum applies to, e.g. "MBBS", "Entry test qualifying score". */
  label: string;
  /** Minimum percentage of this component, 0-100. */
  minimumPercent: number;
  sourcePages: number[];
};

export type MeritComponent = {
  key: ComponentKey;
  /** Label as written in the PDF formula, e.g. "NET Score", "F.Sc Marks". */
  label: string;
  /** Weight in the aggregate, 0-100. All weights of a formula sum to 100. */
  weightPercent: number;
  inputMode: InputMode;
  /**
   * Denominator stated in the PDF formula (e.g. 200 for NET, 1100 for F.Sc).
   * Omitted when the PDF uses a variable like "Total Test Score".
   */
  defaultTotalMarks?: number;
  qualifyingMinimums?: QualifyingMinimum[];
  notes?: string[];
};

/** Machine-readable reasons a formula needs human review. See NOTES.md. */
export type ReviewCode =
  /** The PDF never states the admission year/session a formula applies to. */
  | "year-not-stated"
  /** The PDF formula uses a variable total ("Total Test Score") with no value. */
  | "total-not-stated"
  /** A stated total conflicts with other PDF content (e.g. 90 MCQs vs /100). */
  | "total-inconsistent"
  /** A stated total differs from the norm used elsewhere in the PDF (e.g. SSC /850). */
  | "unusual-total"
  /** "Academic Score" combines matric + inter but the PDF never says how. */
  | "academic-composition-undefined"
  /** An input label is ambiguous (e.g. "HSC Part 1 / Matric Score"). */
  | "input-label-ambiguous"
  /** The formula section disagrees with the summary table / detail section. */
  | "inconsistent-with-summary"
  /** The PDF mentions a mandatory part that the formula does not include. */
  | "component-not-modelled"
  /** The test uses negative marking; the student must enter the NET score. */
  | "net-score-required";

export type ReviewFlag = {
  code: ReviewCode;
  note: string;
  sourcePages: number[];
};

export type MeritFormula = {
  /** Globally unique, stable id, e.g. "fast-nuces-nu-test". */
  id: string;
  universityId: string;
  /** URL-safe, unique within its university, e.g. "nu-test". */
  slug: string;
  /** Program/route/test label, e.g. "NU Test Route". */
  label: string;
  entryTestName?: string;
  /** Year/session as written in the PDF, or null when the PDF does not state it. */
  applicableYear: string | null;
  /** Components in the order the PDF formula lists them. */
  components: MeritComponent[];
  /** Human-readable formula, faithful to the PDF. */
  formulaText: string;
  sourcePages: number[];
  /** True when `reviewFlags` is non-empty. */
  needsReview: boolean;
  reviewFlags: ReviewFlag[];
  notes?: string[];
};

export type University = {
  /** Stable id (equals slug today; kept separate so slugs can change later). */
  id: string;
  /** URL-safe slug for /merit-calculator/[university]. */
  slug: string;
  /** Name as written in the PDF. */
  name: string;
  shortName: string;
  /** Only set when the city appears in the PDF's name for the institution. */
  city?: string;
  formulas: MeritFormula[];
  /** Every PDF page that mentions this institution. */
  sourcePages: number[];
  /** Eligibility minimums as stated in the PDF detail section. */
  eligibility?: string;
  /** Negative-marking rule as stated in the PDF. */
  negativeMarking?: string;
  /** Test structure lines as stated in the PDF. */
  testStructure?: string[];
  notes?: string[];
};

/** IBCC O/A-Level grade -> percentage equivalence row (PDF p.9). */
export type GradeEquivalence = {
  grade: string;
  percent: number;
};
