import { describe, it, expect } from "vitest";
import {
  resumeIndex,
  paletteStatus,
  buildSections,
  sectionIndexOf,
  nextSectionStart,
  prevSectionStart,
  sectionAnsweredCount,
} from "./session";

describe("resumeIndex", () => {
  it("returns 0 for an empty set", () => {
    expect(resumeIndex([])).toBe(0);
  });
  it("returns the first unanswered index", () => {
    expect(resumeIndex([true, true, false, false])).toBe(2);
  });
  it("returns the last index when all answered", () => {
    expect(resumeIndex([true, true, true])).toBe(2);
  });
  it("returns 0 when none answered", () => {
    expect(resumeIndex([false, false])).toBe(0);
  });
});

describe("paletteStatus", () => {
  it("prioritises current", () => {
    expect(paletteStatus(2, 2, { saved: true, review: true })).toBe("current");
  });
  it("then review", () => {
    expect(paletteStatus(1, 2, { saved: true, review: true })).toBe("review");
  });
  it("then saved", () => {
    expect(paletteStatus(1, 2, { saved: true })).toBe("saved");
  });
  it("then selected", () => {
    expect(paletteStatus(1, 2, { selected: true })).toBe("selected");
  });
  it("else unattempted", () => {
    expect(paletteStatus(1, 2, {})).toBe("unattempted");
  });
});

describe("buildSections", () => {
  const labels = [
    "Maths", "Maths", "Maths",
    "Physics", "Physics",
    "English",
  ];
  const sections = buildSections(labels);

  it("groups contiguous labels into sections", () => {
    expect(sections).toEqual([
      { label: "Maths", start: 0, end: 3 },
      { label: "Physics", start: 3, end: 5 },
      { label: "English", start: 5, end: 6 },
    ]);
  });

  it("finds the section index for a question", () => {
    expect(sectionIndexOf(sections, 0)).toBe(0);
    expect(sectionIndexOf(sections, 4)).toBe(1);
    expect(sectionIndexOf(sections, 5)).toBe(2);
    expect(sectionIndexOf(sections, 99)).toBe(-1);
  });

  it("navigates to next/prev section starts", () => {
    expect(nextSectionStart(sections, 0)).toBe(3); // Maths -> Physics
    expect(nextSectionStart(sections, 4)).toBe(5); // Physics -> English
    expect(nextSectionStart(sections, 5)).toBeNull(); // last
    expect(prevSectionStart(sections, 5)).toBe(3); // English -> Physics
    expect(prevSectionStart(sections, 4)).toBe(0); // Physics -> Maths
    expect(prevSectionStart(sections, 0)).toBeNull(); // first
  });

  it("counts answered within a section", () => {
    const saved = [true, false, true, false, true, false];
    expect(sectionAnsweredCount(sections[0], saved)).toBe(2); // 0..2
    expect(sectionAnsweredCount(sections[1], saved)).toBe(1); // 3..4
    expect(sectionAnsweredCount(sections[2], saved)).toBe(0); // 5
  });

  it("handles an empty label list", () => {
    expect(buildSections([])).toEqual([]);
  });
});
