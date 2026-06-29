/**
 * Pure mock-generation planning logic (no DB, no IO) — fully unit-testable.
 *
 * Given a blueprint's per-subject slots (each with a target difficulty mix) and
 * the questions actually available per (subject, difficulty), compute exactly how
 * many questions to pick from each (subject, difficulty) bucket so that every
 * slot reaches its required `questionCount`, borrowing from the nearest band when
 * a band is short. This keeps mock generation deterministic and reproducible;
 * the SQL side only has to execute the resulting pick counts.
 */

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard"];

/**
 * Whole-paper target mix for the NET full mock (sums to 200):
 * 30 easy / 90 medium / 80 hard. Per-slot mixes are derived proportionally and
 * stored as data in `mock_blueprint_slots.difficulty_mix`.
 */
export const NET_PAPER_TARGET: Record<Difficulty, number> = {
  easy: 30,
  medium: 90,
  hard: 80,
};

export type DifficultyMix = Partial<Record<Difficulty, number>>;

export type SlotPlanInput = {
  /** Stable key for the slot (e.g. subject slug or test_subject id). */
  key: string;
  /** Total questions this slot must contribute. */
  questionCount: number;
  /** Desired counts per difficulty (should sum to questionCount). */
  mix: DifficultyMix;
  /** How many approved questions exist per difficulty for this slot's subject. */
  available: Record<Difficulty, number>;
};

export type SlotPlan = {
  key: string;
  /** Resolved number of questions to pick per difficulty. */
  pick: Record<Difficulty, number>;
  /** Total resolved picks (== questionCount unless the pool is too small). */
  total: number;
  /** True if the pool could not satisfy questionCount even after borrowing. */
  shortfall: boolean;
};

/** Borrowing order from a given band: nearest bands first (medium is central). */
const BORROW_ORDER: Record<Difficulty, Difficulty[]> = {
  easy: ["medium", "hard"],
  medium: ["hard", "easy"],
  hard: ["medium", "easy"],
};

function zeroPick(): Record<Difficulty, number> {
  return { easy: 0, medium: 0, hard: 0 };
}

/**
 * Plan one slot: clamp each band's requested count to what's available, then
 * redistribute any deficit to the nearest bands that still have headroom.
 */
export function planSlot(input: SlotPlanInput): SlotPlan {
  const { key, questionCount, mix, available } = input;
  const pick = zeroPick();

  // 1. Take what the mix asks for, clamped to availability. Track per-band
  //    deficit (what a band wanted but couldn't supply) so we borrow from the
  //    SHORT band's nearest neighbours, not arbitrarily.
  const bandDeficit = zeroPick();
  for (const d of DIFFICULTIES) {
    const want = Math.max(0, Math.floor(mix[d] ?? 0));
    pick[d] = Math.min(want, available[d]);
    bandDeficit[d] = want - pick[d];
  }

  let total = pick.easy + pick.medium + pick.hard;

  // 2. Cover each short band's deficit by borrowing from its nearest neighbours
  //    that still have unused availability.
  for (const d of DIFFICULTIES) {
    let need = bandDeficit[d];
    if (need <= 0) continue;
    for (const donor of BORROW_ORDER[d]) {
      if (need <= 0) break;
      const headroom = available[donor] - pick[donor];
      if (headroom > 0) {
        const take = Math.min(headroom, need);
        pick[donor] += take;
        need -= take;
      }
    }
  }

  // 3. If the requested mix summed to less than questionCount (under-specified),
  //    top up from any band with headroom (medium first).
  total = pick.easy + pick.medium + pick.hard;
  let deficit = questionCount - total;
  if (deficit > 0) {
    for (const donor of ["medium", "hard", "easy"] as Difficulty[]) {
      if (deficit <= 0) break;
      const headroom = available[donor] - pick[donor];
      if (headroom > 0) {
        const take = Math.min(headroom, deficit);
        pick[donor] += take;
        deficit -= take;
      }
    }
  } else if (deficit < 0) {
    // Over-allocated (mix summed above questionCount): trim from the largest
    // bands first so proportions stay reasonable.
    let excess = -deficit;
    const order = [...DIFFICULTIES].sort((a, b) => pick[b] - pick[a]);
    for (const d of order) {
      if (excess <= 0) break;
      const take = Math.min(pick[d], excess);
      pick[d] -= take;
      excess -= take;
    }
  }

  total = pick.easy + pick.medium + pick.hard;
  return { key, pick, total, shortfall: total < questionCount };
}

/** Plan every slot of a blueprint. */
export function planMock(slots: SlotPlanInput[]): SlotPlan[] {
  return slots.map(planSlot);
}

/** Total questions a plan will produce across all slots. */
export function planTotal(plans: SlotPlan[]): number {
  return plans.reduce((sum, p) => sum + p.total, 0);
}

/**
 * Derive a per-slot mix proportional to a whole-paper target. Used when seeding
 * the blueprint so each slot's mix sums to its own size while keeping the global
 * easy/medium/hard proportions. Remainders are assigned to medium then hard so
 * the per-slot mix always sums exactly to questionCount.
 */
export function proportionalMix(
  questionCount: number,
  paperTotal: number,
  target: Record<Difficulty, number>,
): Record<Difficulty, number> {
  const raw: Record<Difficulty, number> = {
    easy: (target.easy / paperTotal) * questionCount,
    medium: (target.medium / paperTotal) * questionCount,
    hard: (target.hard / paperTotal) * questionCount,
  };
  const mix: Record<Difficulty, number> = {
    easy: Math.floor(raw.easy),
    medium: Math.floor(raw.medium),
    hard: Math.floor(raw.hard),
  };
  let remainder = questionCount - (mix.easy + mix.medium + mix.hard);
  // Distribute leftover units to the bands with the largest fractional parts.
  const byFraction = (["medium", "hard", "easy"] as Difficulty[]).sort(
    (a, b) => (raw[b] - Math.floor(raw[b])) - (raw[a] - Math.floor(raw[a])),
  );
  for (const d of byFraction) {
    if (remainder <= 0) break;
    mix[d] += 1;
    remainder -= 1;
  }
  return mix;
}
