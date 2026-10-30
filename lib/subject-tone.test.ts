import { describe, expect, it } from "vitest";
import { TONES, subjectTone } from "./subject-tone";

describe("subjectTone", () => {
  it("uses the fixed tone for known subjects", () => {
    expect(subjectTone("maths")).toBe("blue");
    expect(subjectTone("physics")).toBe("amber");
    expect(subjectTone("english")).toBe("violet");
  });

  it("ignores the pu- namespace prefix", () => {
    expect(subjectTone("pu-maths")).toBe("blue");
    expect(subjectTone("pu-verbal-reasoning")).toBe("violet");
    expect(subjectTone("pu-computer-science")).toBe("rose");
  });

  it("accepts display names as well as slugs", () => {
    expect(subjectTone("Computer Science")).toBe("rose");
    expect(subjectTone("  Physics ")).toBe("amber");
  });

  it("gives unknown subjects a stable tone from the palette", () => {
    const tone = subjectTone("astronomy");
    expect(TONES.includes(tone)).toBe(true);
    expect(subjectTone("astronomy")).toBe(tone);
  });

  it("falls back to blue for empty input", () => {
    expect(subjectTone(null)).toBe("blue");
    expect(subjectTone("")).toBe("blue");
  });
});
