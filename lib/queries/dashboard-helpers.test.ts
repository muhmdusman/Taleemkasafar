import { describe, it, expect } from "vitest";
import {
  resolveDisplayName,
  avatarInitial,
  cardIndex,
  sumQuestionCounts,
  chapterMetaLabel,
  pickOpenMock,
  mockSecondsLeft,
  pickFocusSubject,
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

describe("pickOpenMock", () => {
  const now = Date.parse("2026-10-30T12:00:00Z");

  it("prefers a running mock over an older expired one", () => {
    const picked = pickOpenMock(
      [
        { id: "live", expires_at: "2026-10-30T13:00:00Z" },
        { id: "expired", expires_at: "2026-10-30T11:00:00Z" },
      ],
      now,
    );
    expect(picked?.attempt.id).toBe("live");
    expect(picked?.state).toBe("running");
  });

  it("reports a paused mock even after its original expiry", () => {
    const picked = pickOpenMock(
      [{ id: "p", expires_at: "2026-10-30T11:00:00Z", paused_at: "2026-10-30T10:30:00Z" }],
      now,
    );
    expect(picked?.state).toBe("paused");
  });

  it("treats a missing expiry as still running", () => {
    expect(pickOpenMock([{ id: "open", expires_at: null }], now)?.state).toBe("running");
  });

  it("offers the newest unsubmitted mock as timeUp within a week of expiry", () => {
    const picked = pickOpenMock([{ id: "x", expires_at: "2026-10-29T12:00:00Z" }], now);
    expect(picked?.state).toBe("timeUp");
  });

  it("drops mocks that ran out more than a week ago", () => {
    expect(pickOpenMock([{ id: "old", expires_at: "2026-10-01T12:00:00Z" }], now)).toBeNull();
    expect(pickOpenMock([], now)).toBeNull();
  });
});

describe("mockSecondsLeft", () => {
  const now = Date.parse("2026-10-30T12:00:00Z");

  it("counts down to expiry while running", () => {
    expect(mockSecondsLeft({ expires_at: "2026-10-30T12:10:00Z" }, now)).toBe(600);
  });

  it("is frozen at expiry minus pause time while paused", () => {
    expect(
      mockSecondsLeft(
        { expires_at: "2026-10-30T11:00:00Z", paused_at: "2026-10-30T10:30:00Z" },
        now,
      ),
    ).toBe(1800);
  });

  it("clamps at 0 and is null without a time limit", () => {
    expect(mockSecondsLeft({ expires_at: "2026-10-30T11:00:00Z" }, now)).toBe(0);
    expect(mockSecondsLeft({ expires_at: null }, now)).toBeNull();
  });
});

describe("pickFocusSubject", () => {
  const subjects = [
    { id: "m", slug: "maths", name: "Maths" },
    { id: "p", slug: "physics", name: "Physics" },
    { id: "e", slug: "english", name: "English" },
  ];

  it("picks the weakest subject of the latest mock", () => {
    expect(
      pickFocusSubject(
        subjects,
        { maths: { correct: 60, total: 100 }, physics: { correct: 24, total: 60 } },
        {},
      ),
    ).toEqual({ slug: "physics", name: "Physics", reason: "mock", percent: 40 });
  });

  it("falls back to low practice accuracy with enough answers", () => {
    expect(
      pickFocusSubject(
        subjects,
        { maths: { correct: 90, total: 100 } },
        { m: { answered: 50, correct: 45 }, p: { answered: 20, correct: 9 }, e: { answered: 4, correct: 0 } },
      ),
    ).toEqual({ slug: "physics", name: "Physics", reason: "practice", percent: 45 });
  });

  it("suggests an untouched subject once practice has started", () => {
    expect(
      pickFocusSubject(subjects, null, { m: { answered: 30, correct: 27 }, p: { answered: 12, correct: 10 } }),
    ).toEqual({ slug: "english", name: "English", reason: "new", percent: null });
  });

  it("returns null with no activity or when everything is strong", () => {
    expect(pickFocusSubject(subjects, null, {})).toBeNull();
    expect(
      pickFocusSubject(subjects, null, {
        m: { answered: 30, correct: 27 },
        p: { answered: 30, correct: 25 },
        e: { answered: 30, correct: 24 },
      }),
    ).toBeNull();
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
