"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";
import { routes } from "@/lib/routes";

type Usage = Database["public"]["Enums"]["question_usage"];

export type PracticeGrade = {
  ok: boolean;
  isCorrect?: boolean;
  correctOptionId?: string | null;
  explanation?: string | null;
  error?: string;
};

/**
 * Get-or-create the in-progress practice/past-paper attempt for a chapter.
 * Returns the attempt id (or null on failure).
 */
export async function startPractice(
  entryTestSlug: string,
  topicId: string,
  usage: Usage,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_attempt", {
    p_entry_test: entryTestSlug,
    p_topic: topicId,
    p_usage: usage,
  });
  if (error) return null;
  return data as string;
}

/**
 * Grade one practice answer on the server. Returns correctness + explanation
 * (the only place the client learns the correct answer).
 */
export async function answerPractice(
  attemptId: string,
  questionId: string,
  optionId: string,
  timeTakenMs: number,
): Promise<PracticeGrade> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_practice_answer", {
    p_attempt: attemptId,
    p_question: questionId,
    p_option: optionId,
    p_time_ms: timeTakenMs,
  });
  if (error) return { ok: false, error: error.message };

  const row = Array.isArray(data) ? data[0] : data;
  return {
    ok: true,
    isCorrect: row?.is_correct ?? false,
    correctOptionId: row?.correct_option_id ?? null,
    explanation: row?.explanation ?? null,
  };
}

/** End the current practice attempt (mark submitted). */
export async function finishPractice(attemptId: string): Promise<void> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  if (!userId) return;
  await supabase
    .from("attempts")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", attemptId)
    .eq("user_id", userId);
}

/** Toggle a bookmark on a question for the signed-in user. */
export async function toggleBookmark(questionId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  if (!userId) return false;

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (existing) {
    await supabase.from("bookmarks").delete().eq("id", existing.id);
    return false;
  }
  await supabase
    .from("bookmarks")
    .insert({ user_id: userId, question_id: questionId });
  return true;
}

/** Generate a fresh mock attempt from a blueprint. Returns the attempt id. */
export async function startMock(blueprintId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("generate_mock_attempt", {
    p_blueprint: blueprintId,
  });
  if (error) return null;
  return data as string;
}

/** Persist a single mock selection (no grading, no feedback). */
export async function saveMockAnswer(
  attemptId: string,
  questionId: string,
  optionId: string | null,
  timeTakenMs: number | null,
): Promise<boolean> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  if (!userId) return false;

  // Owner check via the parent attempt; RLS also enforces this.
  const { error } = await supabase
    .from("attempt_answers")
    .update({
      selected_option_id: optionId,
      time_taken_ms: timeTakenMs,
      answered_at: new Date().toISOString(),
    })
    .eq("attempt_id", attemptId)
    .eq("question_id", questionId);
  return !error;
}

/** Toggle the mark-for-review flag on a mock question. */
export async function toggleReview(
  attemptId: string,
  questionId: string,
  marked: boolean,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("attempt_answers")
    .update({ marked_for_review: marked })
    .eq("attempt_id", attemptId)
    .eq("question_id", questionId);
  return !error;
}

/**
 * Submit + grade a mock. The client sends its saved selections as a fallback;
 * the server is the source of truth and grades against the hidden key.
 */
export async function submitMock(
  attemptId: string,
  answers: {
    question_id: string;
    selected_option_id: string | null;
    time_taken_ms: number | null;
  }[],
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_mock", {
    p_attempt: attemptId,
    p_answers: answers,
  });
  if (error) return null;
  revalidatePath(routes.dashboard);
  revalidatePath(routes.performance);
  revalidatePath(routes.mocks);
  return data as string;
}

/**
 * Pause a running mock: the server freezes its remaining time (mcq_15
 * `pause_mock`). Returns false if pausing failed or the migration isn't
 * applied yet; the caller then tells the student the timer keeps running.
 * No revalidatePath: that would re-render (and re-download) the whole paper
 * just before the student leaves; the dashboard is dynamic and refetches on
 * navigation anyway.
 */
export async function pauseMock(attemptId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("pause_mock", { p_attempt: attemptId });
  return !error;
}

export type MockSync = {
  status: Database["public"]["Enums"]["attempt_status"];
  expiresAt: string | null;
};

/**
 * Called whenever a mock sitting opens (including Back/Forward, which can
 * show a cached screen): resumes the mock if it was paused and returns the
 * authoritative status + expiry. Falls back to a plain read when the mcq_15
 * migration isn't applied yet. Null if the attempt isn't the caller's.
 */
export async function syncMock(attemptId: string): Promise<MockSync | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("resume_mock", {
    p_attempt: attemptId,
  });
  if (!error) {
    const row = Array.isArray(data) ? data[0] : data;
    return row
      ? { status: row.current_status, expiresAt: row.current_expires_at }
      : null;
  }

  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  if (!userId) return null;
  const { data: attempt } = await supabase
    .from("attempts")
    .select("status, expires_at")
    .eq("id", attemptId)
    .eq("user_id", userId)
    .eq("mode", "mock")
    .maybeSingle();
  return attempt ? { status: attempt.status, expiresAt: attempt.expires_at } : null;
}
