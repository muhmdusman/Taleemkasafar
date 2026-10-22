import { describe, expect, it } from "vitest";
import { getUniversityBySlug, getUniversitySlugs } from "@/data/merit-formulas";
import { getMeritSitemapEntries } from "@/lib/seo/merit-sitemap";
import {
  admissionYearNotice,
  entryTestNames,
  formatPages,
  universityMetaDescription,
  weightSummary,
} from "./display";

const nust = getUniversityBySlug("nust")!;
const fast = getUniversityBySlug("fast-nuces")!;

describe("merit display helpers", () => {
  it("summarises weights in formula order", () => {
    expect(weightSummary(nust.formulas[0])).toBe("Test 75% · Inter 15% · Matric 10%");
    expect(weightSummary(getUniversityBySlug("punjab-university")!.formulas[0])).toBe(
      "Test 25% · Academics 75%",
    );
  });

  it("lists unique entry test names", () => {
    expect(entryTestNames(fast)).toEqual(["NU Test", "NTS"]);
  });

  it("formats sorted, de-duplicated page refs", () => {
    expect(formatPages([5, 3, 3])).toBe("p. 3, 5");
  });

  it("names the test and weights in the meta description", () => {
    const d = universityMetaDescription(nust);
    expect(d).toContain("NUST");
    expect(d).toContain("NET (Test 75%, Inter 15%, Matric 10%)");
  });
});

describe("getMeritSitemapEntries", () => {
  it("has one absolute URL per university slug", () => {
    const entries = getMeritSitemapEntries();
    const slugs = getUniversitySlugs();
    expect(entries).toHaveLength(slugs.length);
    slugs.forEach((slug, i) => {
      expect(entries[i].url).toMatch(new RegExp(`^https?://[^/]+/merit-calculator/${slug}$`));
    });
  });

  it("derives the admission-year notice from the data", () => {
    expect(admissionYearNotice(nust.formulas)).toBe(
      "The source guide doesn't state which admission year this formula applies to. Confirm it in the current admission notification.",
    );
    expect(admissionYearNotice(fast.formulas)).toMatch(/which admission year these formulas apply to/);
    const dated = { ...nust.formulas[0], applicableYear: "2026", reviewFlags: [] };
    expect(admissionYearNotice([dated])).toBe(
      "Per the source guide, this formula applies to the 2026 admission year. Confirm it in the current admission notification.",
    );
    expect(admissionYearNotice([dated, fast.formulas[1]])).toMatch(/admission year for: NTS Route\./);
    expect(admissionYearNotice([])).toBeNull();
  });
});
