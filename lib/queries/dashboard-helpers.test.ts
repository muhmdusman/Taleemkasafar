import { describe, it, expect } from "vitest";
import {
  resolveDisplayName,
  avatarInitial,
  cardIndex,
  sumQuestionCounts,
  chapterMetaLabel,
  pickLiveMock,
  openPracticeFrom,
  nextChapterAfter,
} from "./dashboard-helpers";

describe("resolveDisplayName", () => {
  it("prefers a non-empty profile name", () => {
    expect(resolveDisplayName("Ali Khan", "ali@example.com")).toBe("Ali Khan");
  });

  it("trims whitespace from the profile name", () => {
    expect(resolveDisplayName("  Sara  ", null)).toBe("Sara");
  });

  it("falls back to the email local-part when name is missing", () => {
    expect(resolveDisplayName(null, "usman2789@gmail.com")).toBe("usman2789");
    expect(resolveDisplayName("", "usman2789@gmail.com")).toBe("usman2789");
    expect(resolveDisplayName("   ", "usman2789@gmail.com")).toBe("usman2789");
  });

  it("falls back to 'there' when nothing usable is provided", () => {
    expect(resolveDisplayName(null, null)).toBe("there");
    expect(resolveDisplayName(undefined, undefined)).toBe("there");
    expect(resolveDisplayName("", "not-an-email")).toBe("there");
  });
});

describe("avatarInitial", () => {
  it("returns the uppercased first letter", () => {
    expect(avatarInitial("ali")).toBe("A");
    expect(avatarInitial("Sara")).toBe("S");
  });

  it("returns 'U' for empty input", () => {
    expect(avatarInitial("")).toBe("U");
    expect(avatarInitial("   ")).toBe("U");
  });
});

describe("cardIndex", () => {
  it("zero-pads to two digits, 1-based", () => {
    expect(cardIndex(0)).toBe("01");
    expect(cardIndex(8)).toBe("09");
    expect(cardIndex(11)).toBe("12");
  });
});

describe("sumQuestionCounts", () => {
  it("sums counts, treating null as 0", () => {
    expect(
      sumQuestionCounts([
        { question_count: 34 },
        { question_count: null },
        { question_count: 7 },
      ]),
    ).toBe(41);
  });

  it("returns 0 for an empty list", () => {
    expect(sumQuestionCounts([])).toBe(0);
  });
});

describe("chapterMetaLabel", () => {
  it("shows only MCQs when there are no subtopics", () => {
    expect(chapterMetaLabel(0, 34)).toBe("34 MCQs");
    expect(chapterMetaLabel(null, 12)).toBe("12 MCQs");
  });

  it("includes the topic count when subtopics exist", () => {
    expect(chapterMetaLabel(18, 140)).toBe("18 Topics · 140 MCQs");
  });

  it("treats null question count as 0", () => {
    expect(chapterMetaLabel(0, null)).toBe("0 MCQs");
  });
});

describe("pickLiveMock", () => {
  const now = Date.parse("2026-10-30T12:00:00Z");

  it("skips mocks whose timer has run out", () => {
    const picked = pickLiveMock(
      [
        { id: "expired", expires_at: "2026-10-30T11:00:00Z" },
        { id: "live", expires_at: "2026-10-30T13:00:00Z" },
      ],
      now,
    );
    expect(picked?.id).toBe("live");
  });

  it("treats a missing expiry as still running", () => {
    expect(pickLiveMock([{ id: "open", expires_at: null }], now)?.id).toBe("open");
  });

  it("returns null when every mock has expired or there are none", () => {
    expect(pickLiveMock([{ id: "x", expires_at: "2026-10-30T11:59:59Z" }], now)).toBeNull();
    expect(pickLiveMock([], now)).toBeNull();
  });
});

describe("openPracticeFrom", () => {
  it("returns an in-progress sitting with its chapter", () => {
    expect(
      openPracticeFrom("a1", { topic_id: "t1", usage: "past_paper", status: "in_progress" }),
    ).toEqual({ attemptId: "a1", topicId: "t1", usage: "past_paper" });
  });

  it("accepts the embedded row as a one-item array", () => {
    expect(
      openPracticeFrom("a1", [{ topic_id: "t1", usage: null, status: "in_progress" }]),
    ).toEqual({ attemptId: "a1", topicId: "t1", usage: "practice" });
  });

  it("returns null for a finished sitting or one without a chapter", () => {
    expect(openPracticeFrom("a1", { topic_id: "t1", status: "submitted" })).toBeNull();
    expect(openPracticeFrom("a1", { topic_id: null, status: "in_progress" })).toBeNull();
    expect(openPracticeFrom("a1", null)).toBeNull();
  });
});

describe("nextChapterAfter", () => {
  const chapters = [
    { chapter_slug: "kinematics", chapter_title: "Kinematics", question_count: 30 },
    { chapter_slug: "empty", chapter_title: "Empty", question_count: 0 },
    { chapter_slug: "dynamics", chapter_title: null, question_count: 12 },
  ];

  it("skips chapters without questions", () => {
    expect(nextChapterAfter(chapters, "kinematics")).toEqual({
      slug: "dynamics",
      title: "dynamics",
    });
  });

  it("returns null for the last chapter or an unknown slug", () => {
    expect(nextChapterAfter(chapters, "dynamics")).toBeNull();
    expect(nextChapterAfter(chapters, "missing")).toBeNull();
  });
});
