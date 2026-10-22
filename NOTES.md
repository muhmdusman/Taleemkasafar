# Merit formulas: items to review

Source: `Pakistan Universities Merit Formulas and Admission Criteria Guide.pdf`
(11 pages, repo root). Data: `data/merit-formulas.ts`. Logic: `lib/merit/`.
Every number in the data comes from the PDF; nothing was filled in from memory
or Parhlai. Page refs below are PDF page numbers (1-11).

PDF layout: p1-2 summary table, p3-5 formulas, p5-8 detailed criteria,
p9 IBCC O/A-Level table, p9-11 strategy tips. The PDF contains no worked
examples, so every test example is hand-computed from the PDF's weights.

## Summary

- 18 institutions, 19 formulas (FAST-NUCES has two routes).
- All weights sum to 100 in every formula, and the summary table (p1-2) agrees
  with the formula section (p3-5) on every weight.
- 19/19 formulas have `needsReview: true`, because the PDF never states an
  admission year (item G1).
- 14/19 formulas also have formula-specific flags (23 flags in total, listed
  below). With no formula-specific flags: NUST, FAST-NUCES NTS route, NUTECH,
  Air University, MDCAT.

## Global items (affect every formula)

| # | Item | What the PDF says | Why it needs review | How it's encoded now |
|---|------|-------------------|---------------------|----------------------|
| G1 | Applicable year | No date or admission year anywhere (p1-11) | Formulas change every session; we can't tell which year these are for | `applicableYear: null` + `year-not-stated` flag on every formula. The UI should probably show this as low-severity (or once per page) rather than a warning on every card. |
| G2 | Rounding | Not specified | Universities round differently | Full precision internally; `formatScore()` shows 2 decimals, half-up |
| G3 | Hafiz-e-Quran / other bonus marks | Not mentioned | Several universities give bonus marks | Not modelled |
| G4 | Matric/F.Sc totals | Formulas divide by 1100 (MUET SSC by 850) | Boards with other totals (e.g. 1200) exist | 1100/850 is the default total; the student can override it. The calculator uses obtained / total, so with the PDF total it matches the PDF exactly. |
| G5 | Negative-marking tests (ECAT, NU Test, GIKI, PIEAS) | +4/-1 (ECAT p5), -0.25 (FAST p6), "varies" (GIKI p6), "Yes" (PIEAS p6) | Net scores can be negative in theory | Student enters the net score; obtained must be >= 0 (`net-score-required` flag) |
| G6 | O/A-Level conversion | IBCC grade table A*=90 ... E=45; O-Level "top 8 subjects", A-Level "3 main elective subjects" (p9) | How grades are combined (simple average?) is not stated | Table exported as `IBCC_GRADE_EQUIVALENCE` (reference data only). No converter built. |
| G4b | Entry-test totals | Each formula states a test total where the PDF gives one (e.g. NET /200, ECAT /400, NUMS /150) | A student may have a differently scaled score sheet | The PDF total is the default; the student can override it, just like academic totals. With the default it matches the PDF exactly. |
| G7 | Total-marks sanity cap | n/a | Not from the PDF | `MAX_TOTAL_MARKS = 5000` only rejects typos (largest PDF total is 1100) |
| G8 | Full names / cities | PDF writes "UET Lahore", "FAST-NUCES", "NED UET Karachi", "MUET Jamshoro" without expanding them | Full names may be wanted for SEO | Names kept as written. `city` only set where the PDF name has it (Lahore, Islamabad, Karachi, Jamshoro). No provinces. |
| G9 | Qualifying test minimums | NED 50% (p1, p7), MUET 40% (p2, p7), MDCAT 55% MBBS / 45% BDS (p2, p8) | Only these are stated as mandatory test cutoffs | Encoded as `qualifyingMinimums`; the result reports `met: true/false`. Eligibility minimums (e.g. 60% F.Sc) are text only, because many vary by program. |

## Per-formula items

| University | Item | What the PDF says (page) | Why it's unclear / inconsistent | Encoded as |
|---|---|---|---|---|
| UET Lahore | ECAT negative marking | +4 correct / -1 wrong, 400 marks (p5-6) | Score must be net | Flag `net-score-required`; total 400 |
| FAST-NUCES | NU Test negative marking | -0.25 in some sections (p6) | Score must be net | Flag `net-score-required` |
| FAST-NUCES | SAT route | "SAT and NTS-NAT routes are available" (p6) | No SAT formula given | SAT route excluded (university note) |
| GIKI | Totals | "GIKI Test Score / Total Test Score", "HSSC Score / Total HSSC" (p3) | No totals stated | Flag `total-not-stated`; student enters both totals |
| GIKI | Negative marking | "varies by section" (p6) | Score must be net | Flag `net-score-required` |
| PIEAS | Test total | "PIEAS Test Score / Total Test Score" (p3) | No total stated | Flag `total-not-stated` |
| PIEAS | Negative marking | "Yes." (p6) | Rule not given | Flag `net-score-required` |
| COMSATS | NTS score out of 100 | Formula /100 (p4) vs NTS-NAT has 90 MCQs (p7) | How 90 MCQs map to /100 is not stated | Default total 100 as written; flag `total-inconsistent` |
| Bahria | Academic Percentage | "HSSC + SSC combined" (p2), "Academic Percentage / 100" (p4) | How HSSC and SSC are combined is not stated | One combined % input (`inputMode: "percentage"`); flag `academic-composition-undefined` |
| Bahria, IST, IIUI, UMT | No detail section | Only in summary + formula sections | No eligibility / test structure / negative-marking info | Fields left empty; noted on the university |
| IST | Accepted tests | Summary "NAT / NET / HAT" (p2) vs formula "NET/NAT" (p4) | HAT missing from the formula | Flag `inconsistent-with-summary` |
| IST | NET total | IST formula /100 (p4), but NET is /200 in the NUST formula (p3) | A NUST NET score needs a 200 total | Default 100 as written; flag `total-inconsistent` (student can enter 200) |
| NED UET | Academic input label | "HSC Part 1 / Matric Score / Total Marks" (p4) | OR, or a ratio? | Flag `input-label-ambiguous`; single `academics` input |
| NED UET | Matric weight | Summary: Matric 0%, academics "HSC Part 1/2" (p1); formula mentions Matric (p4) | Contradiction | Flag `inconsistent-with-summary` |
| NED UET | Academic total | "Total Marks" (p4) | No value | Flag `total-not-stated` |
| MUET | SSC total | SSC / 850 (p4) | Every other formula uses 1100 | Encoded 850 as written; flag `unusual-total` |
| MUET | Test name | "Pre-Admin" (p2) vs "MUET Test" (p4) | Naming only, no effect on the maths | Formula note |
| PU | Academic Score | "Academic Score / Total Academic", Matric "Included in Academic" (p2, p4) | How matric + F.Sc combine, and the total, are not stated | Flags `academic-composition-undefined` + `total-not-stated` |
| PU | Test codes | "PU-E, PU-M, PU-C ..." (p8) | Our dashboard's PU tests use PU-E/M/CSP/CSS/CSE/GS/COM/AHS | Text only; not linked to dashboard tests |
| QAU | Academic Score | Same pattern as PU (p2, p4) | Same | Flags `academic-composition-undefined` + `total-not-stated` |
| QAU | Strategy text | "assign 75%+ weightage to F.Sc/Matric" includes QAU (p11), but QAU is 70% (p2, p4, p8) | Minor text inconsistency | Weight 70 used; not affected |
| IIUI | Academic Marks | "Academic Marks / Total Marks", Matric "Included in Academics" (p2, p5) | Same as PU | Flags `academic-composition-undefined` + `total-not-stated` |
| IIUI | Weights by faculty | "Test format varies by faculty" (p2) | Weights may also vary; not stated | One formula; university note |
| UMT | Academic Score | Same pattern as PU (p2, p5) | Same | Flags `academic-composition-undefined` + `total-not-stated` |
| NUMS | Psychological test | Part B "Mandatory evaluation component" (p8), not in the formula (p5) | May affect admission | Flag `component-not-modelled`; ignored in the maths |
| NUMS | Test total 150 | Only in the formula (p5) | Not confirmed by the detail section | Encoded 150 as written |
| MDCAT | Not a university | "Medical & Dental Colleges (PMDC MDCAT)" (p2, p5) | Centralized system, not one institution | Kept as an entry (slug `mdcat`) with a note |
| Air University | NTS scope | NTS NAT accepted "for selected non-engineering programs" (p2) | The formula says "Air Test / NTS" for everyone | Formula note only |

## Institutions included (spot-check)

| # | Slug | Name (as in PDF) | Formula(s) | Weights test / inter / matric | Pages |
|---|------|------------------|------------|-------------------------------|-------|
| 1 | `nust` | National University of Sciences & Technology | NET /200 | 75 / 15 / 10 | 1, 3, 5, 10 |
| 2 | `uet-lahore` | UET Lahore | ECAT /400 | 33 / 50 / 17 | 1, 3, 5, 6, 10 |
| 3 | `fast-nuces` | FAST-NUCES | NU Test /100; NTS /100 | 50 / 40 / 10; 50 / 50 / - | 1, 3, 6, 10 |
| 4 | `giki` | Ghulam Ishaq Khan Institute | GIKI Test /? | 85 / 15 (HSSC) / 0 | 1, 3, 6, 10 |
| 5 | `pieas` | Pakistan Institute of Engineering & Applied Sciences | PIEAS Test /? | 60 / 25 / 15 | 1, 3, 6 |
| 6 | `nutech` | National University of Technology | NUET /100 | 70 / 20 / 10 | 1, 3, 7, 10 |
| 7 | `comsats` | COMSATS University Islamabad | NTS /100 | 50 / 40 / 10 | 2, 4, 7, 11 |
| 8 | `air-university` | Air University | Air Test / NTS /100 | 50 / 35 / 15 | 2, 4, 7, 11 |
| 9 | `bahria-university` | Bahria University | BU Test /100 | 50 / 50% academics (combined) | 2, 4 |
| 10 | `ist` | Institute of Space Technology | NET/NAT /100 | 50 / 40 / 10 | 2, 4, 11 |
| 11 | `ned-uet-karachi` | NED UET Karachi | NED Test /100 | 50 / 50 academics | 1, 4, 7 |
| 12 | `muet-jamshoro` | MUET Jamshoro | MUET Test /100 | 60 / 30 (HSC /1100) / 10 (SSC /850) | 2, 4, 7, 8 |
| 13 | `punjab-university` | University of the Punjab | PU Test /100 | 25 / 75 academics | 2, 4, 8, 10, 11 |
| 14 | `qau` | Quaid-i-Azam University | Entry Test / USAT /100 | 30 / 70 academics | 2, 4, 8, 10, 11 |
| 15 | `iiui` | International Islamic University Islamabad | IIUI Test /100 | 50 / 50 academics | 2, 5 |
| 16 | `umt` | University of Management and Technology | UMT Test / NTS /100 | 30 / 70 academics | 2, 5 |
| 17 | `mdcat` | Medical & Dental Colleges (PMDC MDCAT) | MDCAT /200 | 50 / 40 / 10 | 2, 5, 8 |
| 18 | `nums` | National University of Medical Sciences | NUMS Entry Test /150 | 50 / 40 / 10 | 2, 5, 8 |

"/?" means the PDF gives no total, so the student enters it. "academics" means
one combined academic score (matric is "included in academics" per p2).

## Verification (2026-10-22)

| Command | Result |
|---|---|
| `npx vitest run lib/merit data` | 3 files, 75 tests, all passed (`lib/merit/validate.test.ts` 13, `data/merit-formulas.test.ts` 11, `lib/merit/calculate.test.ts` 51) |
| `npx eslint data lib/merit` | Clean (exit 0, no output) |
| `npx tsc --noEmit` | 0 errors in `data/` or `lib/merit/`. 18 error lines exist elsewhere, all in the stale generated `.next/dev/types/validator.ts` (it still points at the old `app/(dashboard)` routes from the in-progress route restructure). Not owned by this run. |

PDF text was extracted with `pdftotext -layout` and cross-checked against
page renders (`pdftoppm -r 110`) for pp. 1-5, 8 and 9. The formulas on pp. 3-5
appear in the PDF as raw LaTeX source; both sources agree.
