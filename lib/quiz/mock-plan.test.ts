import { describe, it, expect } from "vitest";
import {
  planSlot,
  planMock,
  planTotal,
  proportionalMix,
  NET_PAPER_TARGET,
  type SlotPlanInput,
} from "./mock-plan";

describe("planSlot", () => {
  it("picks exactly the requested mix when the pool is ample", () => {
    const plan = planSlot({
      key: "maths",
      questionCount: 100,
      mix: { easy: 15, medium: 45, hard: 40 },
      available: { easy: 85, medium: 158, hard: 83 },
    });
    expect(plan.pick).toEqual({ easy: 15, medium: 45, hard: 40 });
    expect(plan.total).toBe(100);
    expect(plan.shortfall).toBe(false);
  });

  it("borrows from nearest bands when one band is short", () => {
    // Want 40 hard but only 10 available → borrow 30 from medium then easy.
    const plan = planSlot({
      key: "x",
      questionCount: 100,
      mix: { easy: 15, medium: 45, hard: 40 },
      available: { easy: 85, medium: 158, hard: 10 },
    });
    expect(plan.total).toBe(100);
    expect(plan.shortfall).toBe(false);
    expect(plan.pick.hard).toBe(10);
    // deficit of 30 borrowed: hard borrows from medium first.
    expect(plan.pick.medium).toBe(45 + 30);
    expect(plan.pick.easy).toBe(15);
  });

  it("flags a true shortfall when the whole pool is too small", () => {
    const plan = planSlot({
      key: "tiny",
      questionCount: 100,
      mix: { easy: 15, medium: 45, hard: 40 },
      available: { easy: 5, medium: 5, hard: 5 },
    });
    expect(plan.total).toBe(15);
    expect(plan.shortfall).toBe(true);
  });

  it("trims when the requested mix exceeds questionCount", () => {
    const plan = planSlot({
      key: "over",
      questionCount: 10,
      mix: { easy: 10, medium: 10, hard: 10 },
      available: { easy: 50, medium: 50, hard: 50 },
    });
    expect(plan.total).toBe(10);
    expect(plan.shortfall).toBe(false);
  });

  it("handles an empty/zero slot", () => {
    const plan = planSlot({
      key: "z",
      questionCount: 0,
      mix: {},
      available: { easy: 0, medium: 0, hard: 0 },
    });
    expect(plan.total).toBe(0);
    expect(plan.shortfall).toBe(false);
  });
});

describe("planMock + planTotal", () => {
  it("plans the full NET paper to exactly 200 with real pool counts", () => {
    const slots: SlotPlanInput[] = [
      {
        key: "maths",
        questionCount: 100,
        mix: { easy: 15, medium: 45, hard: 40 },
        available: { easy: 85, medium: 158, hard: 83 },
      },
      {
        key: "physics",
        questionCount: 60,
        mix: { easy: 9, medium: 27, hard: 24 },
        available: { easy: 163, medium: 210, hard: 109 },
      },
      {
        key: "english",
        questionCount: 40,
        mix: { easy: 6, medium: 18, hard: 16 },
        available: { easy: 123, medium: 140, hard: 47 },
      },
    ];
    const plans = planMock(slots);
    expect(planTotal(plans)).toBe(200);
    expect(plans.every((p) => !p.shortfall)).toBe(true);
  });
});

describe("proportionalMix", () => {
  it("derives per-slot mixes that sum exactly to the slot size", () => {
    const maths = proportionalMix(100, 200, NET_PAPER_TARGET);
    expect(maths.easy + maths.medium + maths.hard).toBe(100);

    const physics = proportionalMix(60, 200, NET_PAPER_TARGET);
    expect(physics.easy + physics.medium + physics.hard).toBe(60);

    const english = proportionalMix(40, 200, NET_PAPER_TARGET);
    expect(english.easy + english.medium + english.hard).toBe(40);
  });

  it("keeps global proportions roughly intact (sum to the paper target)", () => {
    const maths = proportionalMix(100, 200, NET_PAPER_TARGET);
    const physics = proportionalMix(60, 200, NET_PAPER_TARGET);
    const english = proportionalMix(40, 200, NET_PAPER_TARGET);
    const totalEasy = maths.easy + physics.easy + english.easy;
    const totalMedium = maths.medium + physics.medium + english.medium;
    const totalHard = maths.hard + physics.hard + english.hard;
    expect(totalEasy + totalMedium + totalHard).toBe(200);
    // within rounding of the 30/90/80 target
    expect(Math.abs(totalEasy - 30)).toBeLessThanOrEqual(2);
    expect(Math.abs(totalMedium - 90)).toBeLessThanOrEqual(2);
    expect(Math.abs(totalHard - 80)).toBeLessThanOrEqual(2);
  });
});
