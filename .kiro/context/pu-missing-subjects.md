# PU Entry Tests — Missing Subject Data

The 8 official Punjab University entry tests are seeded, but only **5 of the
14 unique subjects** across those tests currently have question data in
`pu_csp_css_mcqs.csv`. This document lists what's missing so we can add
question banks later without any schema/seed changes.

## Seeded now (5 subjects — have data)

| Subject slug | Display name | Chapters | Questions |
|---|---|---|---|
| `pu-verbal-reasoning` | Verbal Reasoning | 7 | 406 |
| `pu-quantitative-reasoning` | Quantitative Reasoning | 13 | 220 |
| `pu-maths` | Mathematics | 6 | 161 |
| `pu-physics` | Physics | 11 | 159 |
| `pu-computer-science` | Computer Science | 11 | 499 |

## Deferred (9 subjects — no data yet)

These subjects appear in the official PU composition matrix but have no
questions in the current CSV, so they are **not seeded**. The importer
silently skips them when materialising `test_subjects`. Once question data
is available for any of them, add the slug/name to `PU_SUBJECT_NAMES` in
`mcqs/build_pu_import_sql.py` and rerun — the composition matrix
already knows where each subject belongs.

| Subject slug | Display name | Which tests need it |
|---|---|---|
| `pu-chemistry` | Chemistry | PU-E, PU-M |
| `pu-biology` | Biology | PU-M |
| `pu-statistics` | Statistics | PU-CSS, PU-GS |
| `pu-economics` | Economics | PU-CSE, PU-GS, PU-COM |
| `pu-accounting` | Accounting | PU-COM |
| `pu-commerce` | Commerce | PU-COM |
| `pu-islamiat-ethics` | Islamiat / Ethics | PU-AHS |
| `pu-pakistan-studies` | Pakistan Studies | PU-AHS |
| `pu-general-knowledge` | General Knowledge | PU-AHS |

## What each test looks like right now (partial vs full)

Verbal + Quant Reasoning are common to all 8 tests and are already in place.
The `covered / official` numbers below are subject-specific sections.

| Test | Full (official) | Covered now | Missing |
|---|---|---|---|
| **PU-E** — Pre-Engineering | Physics, Chemistry, Maths | Physics, Maths | Chemistry |
| **PU-M** — Pre-Medical | Physics, Chemistry, Biology | Physics | Chemistry, Biology |
| **PU-AHS** — Arts, Humanities & Social Sciences | Islamiat/Ethics, Pak Studies, GK | — (only common) | Islamiat/Ethics, Pak Studies, GK |
| **PU-CSP** — ICS with Physics Combination | Physics, CS, Maths | Physics, CS, Maths | ✅ complete |
| **PU-CSS** — ICS with Statistics Combination | Statistics, CS, Maths | CS, Maths | Statistics |
| **PU-CSE** — ICS with Economics Combination | Economics, CS, Maths | CS, Maths | Economics |
| **PU-GS** — General Science | Statistics, Economics, Maths | Maths | Statistics, Economics |
| **PU-COM** — Commerce | Accounting, Economics, Commerce | — (only common) | Accounting, Economics, Commerce |

## How to fill a missing subject in later

1. Get the raw MCQ CSV for the subject (same column shape as `pu_csp_css_mcqs.csv`).
2. Merge its rows into `pu_csp_css_mcqs.csv` (or a sibling CSV that the
   pipeline learns to read).
3. Add the subject to `PU_SUBJECT_NAMES` in `mcqs/build_pu_import_sql.py`,
   and to `SUBJECT_TESTS` in `mcqs/standardize_pu.py` with its correct
   `tests` list (see the "Which tests need it" column above).
4. Run:
   ```
   python3 mcqs/standardize_pu.py
   python3 mcqs/build_pu_import_sql.py
   psql "$DB_URL" -f mcqs/pu_import.sql
   ```
5. The importer is idempotent — nothing existing gets duplicated, and the
   new subject just shows up in the right tests automatically.

## Priority for filling in

Suggested order (highest impact first, based on how many tests it unlocks
and how central the test is to Pakistani admissions):

1. **Chemistry** — unlocks Pre-Engineering completeness AND partially
   unlocks Pre-Medical. Two flagship tests.
2. **Biology** — completes Pre-Medical.
3. **Statistics** — completes PU-CSS and partially unlocks PU-GS.
4. **Economics** — completes PU-CSE, partially unlocks PU-GS and PU-COM.
5. **Accounting, Commerce** — complete PU-COM alongside Economics.
6. **Islamiat/Ethics, Pakistan Studies, General Knowledge** — the whole
   PU-AHS test currently has only Verbal + Quant.
