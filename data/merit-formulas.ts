/**
 * Merit formulas for Pakistani universities / admission systems.
 *
 * SOURCE OF TRUTH: "Pakistan Universities Merit Formulas and Admission Criteria
 * Guide" (PDF, 11 pages, repo root). Every number below comes from that PDF;
 * nothing is filled in from memory or third-party sites. Each record lists the
 * PDF page(s) it came from. Anything unclear/inconsistent is flagged via
 * `reviewFlags` (=> `needsReview: true`) and explained in docs/NOTES.md.
 *
 * Page map of the PDF:
 *   p1-2  Master Summary Comparison Table (weightages)
 *   p3-5  Step-by-Step Merit Calculation Formulas (denominators + weights)
 *   p5-8  University-by-University Detailed Criteria Breakdown
 *   p9    O/A Level Equivalence Rules (IBCC)
 *   p9-11 Strategic Tips
 *
 * PLAIN DATA ONLY (no React, no DB). The getters at the bottom are the seam a
 * future DB fetch replaces.
 */
import type {
  GradeEquivalence,
  MeritFormula,
  ReviewFlag,
  University,
} from "@/lib/merit/types";

/** Metadata about the source document. */
export const MERIT_SOURCE = {
  title:
    "Pakistan Universities Merit Formulas and Admission Criteria Guide",
  file: "Pakistan Universities Merit Formulas and Admission Criteria Guide.pdf",
  pageCount: 11,
  /** The PDF states no publication date or admission year anywhere. */
  applicableYear: null,
} as const;

/** The PDF gives no year for any formula; every formula carries this flag. */
function yearNotStated(sourcePages: number[]): ReviewFlag {
  return {
    code: "year-not-stated",
    note: "The PDF does not state which admission year/session this formula applies to.",
    sourcePages,
  };
}

/** Keeps `needsReview` in sync with `reviewFlags` so the two can't drift. */
function formula(f: Omit<MeritFormula, "needsReview">): MeritFormula {
  return { ...f, needsReview: f.reviewFlags.length > 0 };
}

const universities: University[] = [
  // 1. NUST — summary p1, formula p3, details p5, tips p10
  {
    id: "nust",
    slug: "nust",
    name: "National University of Sciences & Technology",
    shortName: "NUST",
    sourcePages: [1, 3, 5, 10],
    eligibility:
      "Minimum 60% aggregate in SSC/O-Level and HSSC/A-Level (Pre-Engineering or ICS depending on the program).",
    negativeMarking: "None.",
    testStructure: [
      "Total MCQs: 200 | Time: 3 Hours.",
      "Engineering/Computing: Mathematics (80), Physics (60), Chemistry/Computer Science (30), English (20), Intelligence (10).",
    ],
    notes: [
      "NUST conducts four series of NET per academic year. The highest score among attempts is automatically selected for merit determination.",
    ],
    formulas: [
      formula({
        id: "nust-net",
        universityId: "nust",
        slug: "net",
        label: "NET",
        entryTestName: "NET",
        applicableYear: null,
        components: [
          { key: "entryTest", label: "NET Score", weightPercent: 75, inputMode: "marks", defaultTotalMarks: 200 },
          { key: "intermediate", label: "F.Sc Marks", weightPercent: 15, inputMode: "marks", defaultTotalMarks: 1100 },
          { key: "matric", label: "Matric Marks", weightPercent: 10, inputMode: "marks", defaultTotalMarks: 1100 },
        ],
        formulaText:
          "Aggregate = (NET Score / 200 × 75) + (F.Sc Marks / 1100 × 15) + (Matric Marks / 1100 × 10)",
        sourcePages: [1, 3],
        reviewFlags: [yearNotStated([3])],
        notes: [
          "The PDF only details the Engineering/Computing NET structure (p5); other NUST programs are not described.",
        ],
      }),
    ],
  },

  // 2. UET Lahore — summary p1, formula p3, details p5-6, tips p10
  {
    id: "uet-lahore",
    slug: "uet-lahore",
    name: "UET Lahore",
    shortName: "UET Lahore",
    city: "Lahore",
    sourcePages: [1, 3, 5, 6, 10],
    eligibility: "Minimum 60% unadjusted marks in F.Sc/HSSC (PEC rule).",
    negativeMarking: "Yes. +4 marks for correct answer, -1 mark for incorrect answer.",
    testStructure: [
      "Total MCQs: 100 | Time: 100 Minutes | Total Marks: 400.",
      "Mathematics/Biology (30), Physics (30), Chemistry/Computer Science (30), English (10).",
    ],
    notes: [
      "Domicile restrictions apply for specific seats, though open-merit seats are available across Punjab and affiliated regions.",
    ],
    formulas: [
      formula({
        id: "uet-lahore-ecat",
        universityId: "uet-lahore",
        slug: "ecat",
        label: "ECAT",
        entryTestName: "ECAT",
        applicableYear: null,
        components: [
          { key: "entryTest", label: "ECAT Score", weightPercent: 33, inputMode: "marks", defaultTotalMarks: 400 },
          { key: "intermediate", label: "F.Sc Marks", weightPercent: 50, inputMode: "marks", defaultTotalMarks: 1100 },
          { key: "matric", label: "Matric Marks", weightPercent: 17, inputMode: "marks", defaultTotalMarks: 1100 },
        ],
        formulaText:
          "Aggregate = (ECAT Score / 400 × 33) + (F.Sc Marks / 1100 × 50) + (Matric Marks / 1100 × 17)",
        sourcePages: [1, 3, 6],
        reviewFlags: [
          yearNotStated([3]),
          {
            code: "net-score-required",
            note: "ECAT uses +4/-1 marking (p5). Enter the net ECAT score after negative marking; a negative net score cannot be entered.",
            sourcePages: [5],
          },
        ],
      }),
    ],
  },

  // 3. FAST-NUCES — summary p1, formulas p3, details p6, tips p10
  {
    id: "fast-nuces",
    slug: "fast-nuces",
    name: "FAST-NUCES",
    shortName: "FAST-NUCES",
    sourcePages: [1, 3, 6, 10],
    eligibility:
      "Minimum 60% in Matric and F.Sc (or equivalent). Minimum 50% for selected non-tech disciplines.",
    negativeMarking:
      "Yes (-0.25 per wrong answer in Advanced Math, Physics, and English sections).",
    testStructure: [
      "Advanced Mathematics, Basic Mathematics, Physics, English, and Analytical Reasoning.",
      "Sectional timing enforced during the computer-based test.",
    ],
    notes: [
      "SAT and NTS-NAT routes are available, but cutoff aggregates for the NU Test route are typically lower due to weightage balancing.",
      "The PDF mentions a SAT route (p6) but gives no SAT formula, so it is not included in the calculator.",
    ],
    formulas: [
      formula({
        id: "fast-nuces-nu-test",
        universityId: "fast-nuces",
        slug: "nu-test",
        label: "NU Test Route",
        entryTestName: "NU Test",
        applicableYear: null,
        components: [
          { key: "entryTest", label: "NU Test Score", weightPercent: 50, inputMode: "marks", defaultTotalMarks: 100 },
          { key: "intermediate", label: "F.Sc Marks", weightPercent: 40, inputMode: "marks", defaultTotalMarks: 1100 },
          { key: "matric", label: "Matric Marks", weightPercent: 10, inputMode: "marks", defaultTotalMarks: 1100 },
        ],
        formulaText:
          "Aggregate = (NU Test Score / 100 × 50) + (F.Sc Marks / 1100 × 40) + (Matric Marks / 1100 × 10)",
        sourcePages: [1, 3],
        reviewFlags: [
          yearNotStated([3]),
          {
            code: "net-score-required",
            note: "The NU Test deducts 0.25 per wrong answer in some sections (p6). Enter the net score after negative marking.",
            sourcePages: [6],
          },
        ],
      }),
      formula({
        id: "fast-nuces-nts",
        universityId: "fast-nuces",
        slug: "nts",
        label: "NTS Route",
        entryTestName: "NTS",
        applicableYear: null,
        components: [
          { key: "entryTest", label: "NTS Score", weightPercent: 50, inputMode: "marks", defaultTotalMarks: 100 },
          { key: "intermediate", label: "F.Sc Marks", weightPercent: 50, inputMode: "marks", defaultTotalMarks: 1100 },
        ],
        formulaText:
          "Aggregate = (NTS Score / 100 × 50) + (F.Sc Marks / 1100 × 50)",
        sourcePages: [1, 3],
        reviewFlags: [yearNotStated([3])],
        notes: ["Matric is not part of the NTS route (p1, p3)."],
      }),
    ],
  },

  // 4. GIKI — summary p1, formula p3, details p6, tips p10
  {
    id: "giki",
    slug: "giki",
    name: "Ghulam Ishaq Khan Institute",
    shortName: "GIKI",
    sourcePages: [1, 3, 6, 10],
    eligibility:
      "Minimum 60% in F.Sc (Pre-Engineering / General Science with Math, Physics, CS).",
    negativeMarking: "Yes (varies by section; generally penalizes random guessing).",
    testStructure: [
      "Focuses heavily on Mathematics and Physics, testing conceptual clarity. English proficiency section included.",
    ],
    notes: [
      "GIKI does not weigh SSC/Matric in its final merit calculation.",
      "HSSC/O-A Levels combined for the remaining 15% (p1).",
    ],
    formulas: [
      formula({
        id: "giki-test",
        universityId: "giki",
        slug: "giki-test",
        label: "GIKI Test",
        entryTestName: "GIKI Test",
        applicableYear: null,
        components: [
          { key: "entryTest", label: "GIKI Test Score", weightPercent: 85, inputMode: "marks" },
          { key: "intermediate", label: "HSSC Score", weightPercent: 15, inputMode: "marks" },
        ],
        formulaText:
          "Aggregate = (GIKI Test Score / Total Test Score × 85) + (HSSC Score / Total HSSC × 15)",
        sourcePages: [1, 3],
        reviewFlags: [
          yearNotStated([3]),
          {
            code: "total-not-stated",
            note: "The PDF gives no value for 'Total Test Score' or 'Total HSSC'; the student must enter both totals.",
            sourcePages: [3],
          },
          {
            code: "net-score-required",
            note: "The GIKI test has negative marking that varies by section (p6). Enter the net score after negative marking.",
            sourcePages: [6],
          },
        ],
      }),
    ],
  },

  // 5. PIEAS — summary p1, formula p3, details p6
  {
    id: "pieas",
    slug: "pieas",
    name: "Pakistan Institute of Engineering & Applied Sciences",
    shortName: "PIEAS",
    sourcePages: [1, 3, 6],
    eligibility: "Minimum 60% in Matric and F.Sc.",
    negativeMarking: "Yes.",
    testStructure: [
      "Advanced Physics, Mathematics, Chemistry/Computer Science, and General Ability.",
    ],
    notes: [
      "Highly competitive STEM institution with strong emphasis on core problem-solving capability.",
    ],
    formulas: [
      formula({
        id: "pieas-test",
        universityId: "pieas",
        slug: "pieas-test",
        label: "PIEAS Written Test",
        entryTestName: "PIEAS Test",
        applicableYear: null,
        components: [
          { key: "entryTest", label: "PIEAS Test Score", weightPercent: 60, inputMode: "marks" },
          { key: "intermediate", label: "F.Sc Marks", weightPercent: 25, inputMode: "marks", defaultTotalMarks: 1100 },
          { key: "matric", label: "Matric Marks", weightPercent: 15, inputMode: "marks", defaultTotalMarks: 1100 },
        ],
        formulaText:
          "Aggregate = (PIEAS Test Score / Total Test Score × 60) + (F.Sc Marks / 1100 × 25) + (Matric Marks / 1100 × 15)",
        sourcePages: [1, 3],
        reviewFlags: [
          yearNotStated([3]),
          {
            code: "total-not-stated",
            note: "The PDF gives no value for the PIEAS 'Total Test Score'; the student must enter it.",
            sourcePages: [3],
          },
          {
            code: "net-score-required",
            note: "The PDF says the PIEAS test has negative marking (p6) but not the rule. Enter the net score after negative marking.",
            sourcePages: [6],
          },
        ],
      }),
    ],
  },

  // 6. NUTECH — summary p1, formula p3, details p7, tips p10
  {
    id: "nutech",
    slug: "nutech",
    name: "National University of Technology",
    shortName: "NUTECH",
    sourcePages: [1, 3, 7, 10],
    eligibility:
      "Minimum 60% in SSC and HSSC for Engineering; 50% for Computer Science.",
    negativeMarking: "None.",
    testStructure: [
      "Basic Math, Advanced Math, Physics, Chemistry/Computer Science, English.",
    ],
    notes: [
      "Emphasizes applied engineering skills; heavily weighs the internal entry test (70%).",
    ],
    formulas: [
      formula({
        id: "nutech-nuet",
        universityId: "nutech",
        slug: "nuet",
        label: "NUET",
        entryTestName: "NUET",
        applicableYear: null,
        components: [
          { key: "entryTest", label: "NUET Score", weightPercent: 70, inputMode: "marks", defaultTotalMarks: 100 },
          { key: "intermediate", label: "F.Sc Marks", weightPercent: 20, inputMode: "marks", defaultTotalMarks: 1100 },
          { key: "matric", label: "Matric Marks", weightPercent: 10, inputMode: "marks", defaultTotalMarks: 1100 },
        ],
        formulaText:
          "Aggregate = (NUET Score / 100 × 70) + (F.Sc Marks / 1100 × 20) + (Matric Marks / 1100 × 10)",
        sourcePages: [1, 3],
        reviewFlags: [yearNotStated([3])],
      }),
    ],
  },

  // 7. COMSATS — summary p2, formula p4, details p7, tips p11
  {
    id: "comsats",
    slug: "comsats",
    name: "COMSATS University Islamabad",
    shortName: "COMSATS",
    city: "Islamabad",
    sourcePages: [2, 4, 7, 11],
    eligibility:
      "Minimum 60% for Engineering (PEC mandated); 50% for Computing and Business disciplines.",
    negativeMarking: "None (standard NTS format).",
    testStructure: [
      "NTS-NAT: Total MCQs: 90 | Time: 120 Minutes.",
      "Verbal (20), Analytical (20), Quantitative (20), Subject-specific (30).",
    ],
    notes: [
      "COMSATS conducts multiple special NTS tests per session and accepts national NTS-NAT scores.",
    ],
    formulas: [
      formula({
        id: "comsats-nts",
        universityId: "comsats",
        slug: "nts-nat",
        label: "NTS-NAT",
        entryTestName: "NTS-NAT",
        applicableYear: null,
        components: [
          { key: "entryTest", label: "NTS Score", weightPercent: 50, inputMode: "marks", defaultTotalMarks: 100 },
          { key: "intermediate", label: "F.Sc Marks", weightPercent: 40, inputMode: "marks", defaultTotalMarks: 1100 },
          { key: "matric", label: "Matric Marks", weightPercent: 10, inputMode: "marks", defaultTotalMarks: 1100 },
        ],
        formulaText:
          "Aggregate = (NTS Score / 100 × 50) + (F.Sc Marks / 1100 × 40) + (Matric Marks / 1100 × 10)",
        sourcePages: [2, 4],
        reviewFlags: [
          yearNotStated([4]),
          {
            code: "total-inconsistent",
            note: "The formula divides the NTS score by 100 (p4), but the NTS-NAT structure lists 90 MCQs (p7). The PDF does not say how 90 MCQs map to a score out of 100. Default total kept at 100 as written in the formula.",
            sourcePages: [4, 7],
          },
        ],
      }),
    ],
  },

  // 8. Air University — summary p2, formula p4, details p7, tips p11
  {
    id: "air-university",
    slug: "air-university",
    name: "Air University",
    shortName: "Air University",
    sourcePages: [2, 4, 7, 11],
    eligibility:
      "Minimum 60% for Engineering; 50% for Computing and Social Sciences.",
    negativeMarking: "None.",
    testStructure: [
      "Computer-Based Test (CBT) covering Mathematics, Physics, English, and Analytical Reasoning.",
    ],
    notes: [
      "CBT format; accepts NTS NAT for selected non-engineering programs (p2).",
    ],
    formulas: [
      formula({
        id: "air-university-test",
        universityId: "air-university",
        slug: "air-test",
        label: "Air Test / NTS",
        entryTestName: "Air Test / NTS",
        applicableYear: null,
        components: [
          { key: "entryTest", label: "Air Test / NTS Score", weightPercent: 50, inputMode: "marks", defaultTotalMarks: 100 },
          { key: "intermediate", label: "F.Sc Marks", weightPercent: 35, inputMode: "marks", defaultTotalMarks: 1100 },
          { key: "matric", label: "Matric Marks", weightPercent: 15, inputMode: "marks", defaultTotalMarks: 1100 },
        ],
        formulaText:
          "Aggregate = (Air Test / NTS Score / 100 × 50) + (F.Sc Marks / 1100 × 35) + (Matric Marks / 1100 × 15)",
        sourcePages: [2, 4],
        reviewFlags: [yearNotStated([4])],
        notes: [
          "Per the summary table (p2), NTS NAT is only accepted for selected non-engineering programs.",
        ],
      }),
    ],
  },

  // 9. Bahria University — summary p2, formula p4 (no detail section in PDF)
  {
    id: "bahria-university",
    slug: "bahria-university",
    name: "Bahria University",
    shortName: "Bahria",
    sourcePages: [2, 4],
    notes: [
      "Computer-Based Test (CBT) covering English, Math, and Analytical skills (p2).",
      "The PDF has no detailed criteria section for Bahria University.",
    ],
    formulas: [
      formula({
        id: "bahria-university-bu-test",
        universityId: "bahria-university",
        slug: "bu-test",
        label: "BU Test",
        entryTestName: "BU Test",
        applicableYear: null,
        components: [
          { key: "entryTest", label: "BU Test Score", weightPercent: 50, inputMode: "marks", defaultTotalMarks: 100 },
          {
            key: "academics",
            label: "Academic Percentage",
            weightPercent: 50,
            inputMode: "percentage",
            notes: ["HSSC + SSC combined (p2)."],
          },
        ],
        formulaText:
          "Aggregate = (BU Test Score / 100 × 50) + (Academic Percentage / 100 × 50)",
        sourcePages: [2, 4],
        reviewFlags: [
          yearNotStated([4]),
          {
            code: "academic-composition-undefined",
            note: "'Academic Percentage' is HSSC + SSC combined (p2), but the PDF does not say how the two are combined. The student enters one combined percentage.",
            sourcePages: [2, 4],
          },
        ],
      }),
    ],
  },

  // 10. IST — summary p2, formula p4, tips p11 (no detail section in PDF)
  {
    id: "ist",
    slug: "ist",
    name: "Institute of Space Technology",
    shortName: "IST",
    sourcePages: [2, 4, 11],
    notes: [
      "Uses centralized tests; specialized aerospace/space science programs (p2).",
      "The PDF has no detailed criteria section for IST.",
    ],
    formulas: [
      formula({
        id: "ist-test",
        universityId: "ist",
        slug: "net-nat",
        label: "NET / NAT",
        entryTestName: "NET / NAT",
        applicableYear: null,
        components: [
          { key: "entryTest", label: "Test Score (NET/NAT)", weightPercent: 50, inputMode: "marks", defaultTotalMarks: 100 },
          { key: "intermediate", label: "F.Sc Marks", weightPercent: 40, inputMode: "marks", defaultTotalMarks: 1100 },
          { key: "matric", label: "Matric Marks", weightPercent: 10, inputMode: "marks", defaultTotalMarks: 1100 },
        ],
        formulaText:
          "Aggregate = (Test Score (NET/NAT) / 100 × 50) + (F.Sc Marks / 1100 × 40) + (Matric Marks / 1100 × 10)",
        sourcePages: [2, 4],
        reviewFlags: [
          yearNotStated([4]),
          {
            code: "inconsistent-with-summary",
            note: "The summary table lists 'NAT / NET / HAT' (p2) but the formula only names 'NET/NAT' (p4).",
            sourcePages: [2, 4],
          },
          {
            code: "total-inconsistent",
            note: "The formula divides by 100 (p4), but NET is scored out of 200 in the NUST formula (p3). A NET-taker should enter their total as 200; default kept at 100 as written.",
            sourcePages: [3, 4],
          },
        ],
      }),
    ],
  },

  // 11. NED UET Karachi — summary p1, formula p4, details p7
  {
    id: "ned-uet-karachi",
    slug: "ned-uet-karachi",
    name: "NED UET Karachi",
    shortName: "NED UET",
    city: "Karachi",
    sourcePages: [1, 4, 7],
    eligibility:
      "Minimum 60% aggregate in HSC/A-Level. Must pass entry test with at least 50%.",
    negativeMarking: "None.",
    testStructure: [
      "Mathematics, Physics, Chemistry/Computer Science, English. 100 MCQs total.",
    ],
    formulas: [
      formula({
        id: "ned-uet-karachi-test",
        universityId: "ned-uet-karachi",
        slug: "ned-test",
        label: "NED Test",
        entryTestName: "NED Test",
        applicableYear: null,
        components: [
          {
            key: "entryTest",
            label: "NED Test Score",
            weightPercent: 50,
            inputMode: "marks",
            defaultTotalMarks: 100,
            qualifyingMinimums: [
              { label: "Entry test qualifying score", minimumPercent: 50, sourcePages: [1, 7] },
            ],
          },
          {
            key: "academics",
            label: "HSC Part 1 / Matric Score",
            weightPercent: 50,
            inputMode: "marks",
            notes: ["Label as written in the formula (p4). The summary table says HSC Part 1/2 (p1)."],
          },
        ],
        formulaText:
          "Aggregate = (NED Test Score / 100 × 50) + (HSC Part 1 / Matric Score / Total Marks × 50)",
        sourcePages: [1, 4, 7],
        reviewFlags: [
          yearNotStated([4]),
          {
            code: "input-label-ambiguous",
            note: "The academic input is written as 'HSC Part 1 / Matric Score' (p4): unclear whether it means HSC Part 1 OR Matric, or a ratio.",
            sourcePages: [4],
          },
          {
            code: "inconsistent-with-summary",
            note: "The summary table gives Matric/SSC 0% and labels the 50% academic part 'HSC Part 1/2' (p1), while the formula mentions Matric (p4).",
            sourcePages: [1, 4],
          },
          {
            code: "total-not-stated",
            note: "The formula's academic 'Total Marks' has no value; the student must enter it.",
            sourcePages: [4],
          },
        ],
      }),
    ],
  },

  // 12. MUET Jamshoro — summary p2, formula p4, details p7-8
  {
    id: "muet-jamshoro",
    slug: "muet-jamshoro",
    name: "MUET Jamshoro",
    shortName: "MUET",
    city: "Jamshoro",
    sourcePages: [2, 4, 7, 8],
    eligibility:
      "Minimum 60% in HSC Pre-Engineering/ICS. Minimum 40% score in test required to qualify.",
    negativeMarking: "None.",
    testStructure: [
      "Mathematics (30), Physics (30), Chemistry/Computer (20), English (20).",
    ],
    notes: ["Sindh domicile quotas apply (p2)."],
    formulas: [
      formula({
        id: "muet-jamshoro-test",
        universityId: "muet-jamshoro",
        slug: "muet-test",
        label: "MUET Test (Pre-Admin)",
        entryTestName: "MUET Test",
        applicableYear: null,
        components: [
          {
            key: "entryTest",
            label: "MUET Test Score",
            weightPercent: 60,
            inputMode: "marks",
            defaultTotalMarks: 100,
            qualifyingMinimums: [
              { label: "Entry test qualifying score", minimumPercent: 40, sourcePages: [2, 7] },
            ],
          },
          { key: "intermediate", label: "HSC Marks", weightPercent: 30, inputMode: "marks", defaultTotalMarks: 1100 },
          { key: "matric", label: "SSC Marks", weightPercent: 10, inputMode: "marks", defaultTotalMarks: 850 },
        ],
        formulaText:
          "Aggregate = (MUET Test Score / 100 × 60) + (HSC Marks / 1100 × 30) + (SSC Marks / 850 × 10)",
        sourcePages: [2, 4, 7],
        reviewFlags: [
          yearNotStated([4]),
          {
            code: "unusual-total",
            note: "SSC is divided by 850 (p4), unlike the 1100 used for Matric in every other formula. Encoded as written.",
            sourcePages: [4],
          },
        ],
        notes: [
          "The summary table calls the test 'Pre-Admin' (p2); the formula calls it 'MUET Test' (p4).",
        ],
      }),
    ],
  },

  // 13. University of the Punjab — summary p2, formula p4, details p8, tips p10-11
  {
    id: "punjab-university",
    slug: "punjab-university",
    name: "University of the Punjab",
    shortName: "PU",
    sourcePages: [2, 4, 8, 10, 11],
    eligibility:
      "Minimum 50-60% depending on the department (60% mandatory for PEC engineering).",
    negativeMarking: "None.",
    testStructure: [
      "Category-specific (PU-E for Pre-Engineering, PU-M for Pre-Medical, PU-C for Computer Science, etc.).",
      "100 MCQs covering subject basics and general logic.",
    ],
    notes: ["Academic-heavy formula; high F.Sc marks critical (p2)."],
    formulas: [
      formula({
        id: "punjab-university-pu-test",
        universityId: "punjab-university",
        slug: "pu-test",
        label: "PU Test",
        entryTestName: "PU Test",
        applicableYear: null,
        components: [
          { key: "entryTest", label: "PU Test Score", weightPercent: 25, inputMode: "marks", defaultTotalMarks: 100 },
          {
            key: "academics",
            label: "Academic Score",
            weightPercent: 75,
            inputMode: "marks",
            notes: ["Academic Record; Matric is included in Academic (p2)."],
          },
        ],
        formulaText:
          "Aggregate = (PU Test Score / 100 × 25) + (Academic Score / Total Academic × 75)",
        sourcePages: [2, 4],
        reviewFlags: [
          yearNotStated([4]),
          {
            code: "academic-composition-undefined",
            note: "Matric is 'Included in Academic' (p2) but the PDF does not say how matric and F.Sc are combined into the Academic Score.",
            sourcePages: [2, 4],
          },
          {
            code: "total-not-stated",
            note: "'Total Academic' has no value in the PDF; the student must enter it.",
            sourcePages: [4],
          },
        ],
      }),
    ],
  },

  // 14. Quaid-i-Azam University — summary p2, formula p4, details p8, tips p10-11
  {
    id: "qau",
    slug: "qau",
    name: "Quaid-i-Azam University",
    shortName: "QAU",
    city: "Islamabad",
    sourcePages: [2, 4, 8, 10, 11],
    eligibility:
      "Minimum 50% in HSSC for general sciences; higher thresholds for specific departments.",
    negativeMarking: "None.",
    notes: [
      "Primarily academic-record driven (70%). Accepts USAT or university-administered entrance exams.",
    ],
    formulas: [
      formula({
        id: "qau-test",
        universityId: "qau",
        slug: "entry-test-usat",
        label: "Entry Test / USAT",
        entryTestName: "Entry Test / USAT",
        applicableYear: null,
        components: [
          {
            key: "academics",
            label: "Academic Score",
            weightPercent: 70,
            inputMode: "marks",
            notes: ["Matric is 'Included in Academic' (p2)."],
          },
          { key: "entryTest", label: "Entry Test / USAT Score", weightPercent: 30, inputMode: "marks", defaultTotalMarks: 100 },
        ],
        formulaText:
          "Aggregate = (Academic Score / Total Academic × 70) + (Entry Test / USAT Score / 100 × 30)",
        sourcePages: [2, 4],
        reviewFlags: [
          yearNotStated([4]),
          {
            code: "academic-composition-undefined",
            note: "Matric is 'Included in Academic' (p2) but the PDF does not say how matric and HSSC are combined into the Academic Score.",
            sourcePages: [2, 4],
          },
          {
            code: "total-not-stated",
            note: "'Total Academic' has no value in the PDF; the student must enter it.",
            sourcePages: [4],
          },
        ],
      }),
    ],
  },

  // 15. IIUI — summary p2, formula p5 (no detail section in PDF)
  {
    id: "iiui",
    slug: "iiui",
    name: "International Islamic University Islamabad",
    shortName: "IIUI",
    city: "Islamabad",
    sourcePages: [2, 5],
    notes: [
      "Test format varies by faculty (Engineering vs Basic Sciences) (p2).",
      "The PDF has no detailed criteria section for IIUI.",
    ],
    formulas: [
      formula({
        id: "iiui-test",
        universityId: "iiui",
        slug: "iiui-test",
        label: "IIUI Test",
        entryTestName: "IIUI Test",
        applicableYear: null,
        components: [
          { key: "entryTest", label: "IIUI Test Score", weightPercent: 50, inputMode: "marks", defaultTotalMarks: 100 },
          {
            key: "academics",
            label: "Academic Marks",
            weightPercent: 50,
            inputMode: "marks",
            notes: ["Matric is 'Included in Academics' (p2)."],
          },
        ],
        formulaText:
          "Aggregate = (IIUI Test Score / 100 × 50) + (Academic Marks / Total Marks × 50)",
        sourcePages: [2, 5],
        reviewFlags: [
          yearNotStated([5]),
          {
            code: "academic-composition-undefined",
            note: "Matric is 'Included in Academics' (p2) but the PDF does not say how matric and HSSC are combined into Academic Marks.",
            sourcePages: [2, 5],
          },
          {
            code: "total-not-stated",
            note: "The academic 'Total Marks' has no value in the PDF; the student must enter it.",
            sourcePages: [5],
          },
        ],
      }),
    ],
  },

  // 16. UMT — summary p2, formula p5 (no detail section in PDF)
  {
    id: "umt",
    slug: "umt",
    name: "University of Management and Technology",
    shortName: "UMT",
    city: "Lahore",
    sourcePages: [2, 5],
    notes: [
      "Offers various merit scholarship brackets based on cumulative score (p2).",
      "The PDF has no detailed criteria section for UMT.",
    ],
    formulas: [
      formula({
        id: "umt-test",
        universityId: "umt",
        slug: "umt-test",
        label: "UMT Test / NTS",
        entryTestName: "UMT Test / NTS",
        applicableYear: null,
        components: [
          {
            key: "academics",
            label: "Academic Score",
            weightPercent: 70,
            inputMode: "marks",
            notes: ["Matric is 'Included in Academics' (p2)."],
          },
          { key: "entryTest", label: "UMT Test / NTS Score", weightPercent: 30, inputMode: "marks", defaultTotalMarks: 100 },
        ],
        formulaText:
          "Aggregate = (Academic Score / Total Academic × 70) + (UMT Test / NTS Score / 100 × 30)",
        sourcePages: [2, 5],
        reviewFlags: [
          yearNotStated([5]),
          {
            code: "academic-composition-undefined",
            note: "Matric is 'Included in Academics' (p2) but the PDF does not say how matric and HSSC are combined into the Academic Score.",
            sourcePages: [2, 5],
          },
          {
            code: "total-not-stated",
            note: "'Total Academic' has no value in the PDF; the student must enter it.",
            sourcePages: [5],
          },
        ],
      }),
    ],
  },

  // 17. MDCAT (PMDC) — summary p2, formula p5, details p8
  {
    id: "mdcat",
    slug: "mdcat",
    name: "Medical & Dental Colleges (PMDC MDCAT)",
    shortName: "MDCAT",
    sourcePages: [2, 5, 8],
    eligibility:
      "Minimum 60% in F.Sc Pre-Medical. Qualifying MDCAT score: 55% for MBBS, 45% for BDS.",
    negativeMarking: "None.",
    testStructure: [
      "Total MCQs: 200.",
      "Biology (68), Chemistry (54), Physics (54), English (18), Logical Reasoning (6).",
    ],
    notes: [
      "Centralized PMDC policy (p2). This is an admission system for medical & dental colleges, not a single university.",
    ],
    formulas: [
      formula({
        id: "mdcat-pmdc",
        universityId: "mdcat",
        slug: "mdcat",
        label: "MDCAT",
        entryTestName: "MDCAT",
        applicableYear: null,
        components: [
          {
            key: "entryTest",
            label: "MDCAT Score",
            weightPercent: 50,
            inputMode: "marks",
            defaultTotalMarks: 200,
            qualifyingMinimums: [
              { label: "MBBS", minimumPercent: 55, sourcePages: [2, 8] },
              { label: "BDS", minimumPercent: 45, sourcePages: [2, 8] },
            ],
          },
          { key: "intermediate", label: "F.Sc Pre-Medical Marks", weightPercent: 40, inputMode: "marks", defaultTotalMarks: 1100 },
          { key: "matric", label: "Matric Marks", weightPercent: 10, inputMode: "marks", defaultTotalMarks: 1100 },
        ],
        formulaText:
          "Aggregate = (MDCAT Score / 200 × 50) + (F.Sc Pre-Medical Marks / 1100 × 40) + (Matric Marks / 1100 × 10)",
        sourcePages: [2, 5, 8],
        reviewFlags: [yearNotStated([5])],
      }),
    ],
  },

  // 18. NUMS — summary p2, formula p5, details p8
  {
    id: "nums",
    slug: "nums",
    name: "National University of Medical Sciences",
    shortName: "NUMS",
    sourcePages: [2, 5, 8],
    eligibility: "Minimum 60% in F.Sc Pre-Medical.",
    negativeMarking: "None.",
    testStructure: [
      "Part A (Subject Weightage): Biology, Chemistry, Physics, English.",
      "Part B (Psychological Test): Mandatory evaluation component.",
    ],
    notes: [
      "Applies to Army Medical College and private military-affiliated colleges (p2).",
    ],
    formulas: [
      formula({
        id: "nums-test",
        universityId: "nums",
        slug: "nums-test",
        label: "NUMS Entry Test",
        entryTestName: "NUMS Entry Test",
        applicableYear: null,
        components: [
          { key: "entryTest", label: "NUMS Entry Test Score", weightPercent: 50, inputMode: "marks", defaultTotalMarks: 150 },
          { key: "intermediate", label: "F.Sc Pre-Medical Marks", weightPercent: 40, inputMode: "marks", defaultTotalMarks: 1100 },
          { key: "matric", label: "Matric Marks", weightPercent: 10, inputMode: "marks", defaultTotalMarks: 1100 },
        ],
        formulaText:
          "Aggregate = (NUMS Entry Test Score / 150 × 50) + (F.Sc Pre-Medical Marks / 1100 × 40) + (Matric Marks / 1100 × 10)",
        sourcePages: [2, 5],
        reviewFlags: [
          yearNotStated([5]),
          {
            code: "component-not-modelled",
            note: "Part B (Psychological Test) is a mandatory evaluation component (p8) but is not part of the formula (p5). The calculator ignores it.",
            sourcePages: [5, 8],
          },
        ],
      }),
    ],
  },
];

/**
 * IBCC O/A-Level grade equivalence table (PDF p9). Reference data only: the
 * PDF does not define how grades are aggregated (it only says "top 8 subjects"
 * for O-Level and "3 main elective subjects" for A-Level), so no converter is
 * wired into the calculator. See docs/NOTES.md.
 */
export const IBCC_GRADE_EQUIVALENCE: readonly GradeEquivalence[] = [
  { grade: "A*", percent: 90 },
  { grade: "A", percent: 85 },
  { grade: "B", percent: 75 },
  { grade: "C", percent: 65 },
  { grade: "D", percent: 55 },
  { grade: "E", percent: 45 },
];
export const IBCC_SOURCE_PAGES: readonly number[] = [9];

// ---------------------------------------------------------------------------
// Getters: the seam a future DB fetch replaces.
// ---------------------------------------------------------------------------

/** All universities in PDF order (formula section, p3-5). */
export function getUniversities(): readonly University[] {
  return universities;
}

export function getUniversityBySlug(slug: string): University | undefined {
  return universities.find((u) => u.slug === slug);
}

/** Slugs for `generateStaticParams` on /merit-calculator/[university]. */
export function getUniversitySlugs(): string[] {
  return universities.map((u) => u.slug);
}
