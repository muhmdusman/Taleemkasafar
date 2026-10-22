"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

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
  revalidatePath("/performance");
  revalidatePath("/mock");
  return data as string;
}
