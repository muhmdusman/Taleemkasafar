import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getActiveEntryTest } from "./entry-test";
import { resumeIndex } from "@/lib/quiz/session";
import type { Database } from "@/lib/database.types";

type Usage = Database["public"]["Enums"]["question_usage"];

export type QuizOption = {
  id: string;
  label: string;
  content: string;
};

export type QuizQuestion = {
  id: string;
  statement: string;
  options: QuizOption[];
  /** Present only for already-answered questions (for resume display). */
  savedOptionId: string | null;
};

export type PracticeScreenData = {
  entryTestSlug: string;
  entryTestName: string;
  subjectSlug: string;
  subjectName: string;
  chapterSlug: string;
  chapterTitle: string;
  usage: Usage;
  topicId: string;
  questions: QuizQuestion[];
  resumeIndex: number;
};

/**
 * Load the practice/past-paper screen for a chapter under the user's active
 * entry test. Question content is read with the authenticated cookie client
 * under RLS and NEVER includes the correct-answer flag (that lives behind the
 * grading RPC). Returns null if the subject/chapter isn't part of the test.
 */
export async function getPracticeScreen(
  subjectSlug: string,
  chapterSlug: string,
  usage: Usage,
): Promise<PracticeScreenData | null> {
  const entryTest = await getActiveEntryTest();
  if (!entryTest) return null;

  const supabase = await createClient();

  // Resolve subject + the chapter (top-level topic) by slug.
  const { data: subject } = await supabase
    .from("subjects")
    .select("id, slug, name")
    .eq("slug", subjectSlug)
    .maybeSingle();
  if (!subject) return null;

  const { data: chapter } = await supabase
    .from("topics")
    .select("id, slug, title")
    .eq("subject_id", subject.id)
    .eq("slug", chapterSlug)
    .is("parent_topic_id", null)
    .is("deleted_at", null)
    .maybeSingle();
  if (!chapter) return null;

  // All descendant topic ids (chapter node + its children) for question scope.
  const { data: descendants } = await supabase
    .from("topics")
    .select("id")
    .eq("subject_id", subject.id)
    .or(`id.eq.${chapter.id},parent_topic_id.eq.${chapter.id}`)
    .is("deleted_at", null);
  const topicIds = (descendants ?? []).map((t) => t.id);
  if (topicIds.length === 0) topicIds.push(chapter.id);

  // Questions for this chapter that belong to the active test, filtered to the
  // requested usage when such rows exist (falls back to all chapter questions
  // for the test so the practice surface isn't empty before practice tagging).
  const { data: usageRows } = await supabase
    .from("question_tests")
    .select("question_id, questions!inner(topic_id, deleted_at, moderation_status)")
    .eq("entry_test_id", entryTest.id)
    .eq("usage_type", usage)
    .in("questions.topic_id", topicIds)
    .is("questions.deleted_at", null)
    .eq("questions.moderation_status", "approved");

  const hasUsagePool = (usageRows?.length ?? 0) > 0;

  // Base query for the question content.
  let qQuery = supabase
    .from("questions")
    .select("id, statement")
    .in("topic_id", topicIds)
    .is("deleted_at", null)
    .eq("moderation_status", "approved")
    .order("external_id", { ascending: true });

  if (hasUsagePool) {
    const ids = (usageRows ?? []).map((r) => r.question_id);
    qQuery = qQuery.in("id", ids);
  } else {
    // Fall back to all chapter questions used by this test.
    const { data: testRows } = await supabase
      .from("question_tests")
      .select("question_id")
      .eq("entry_test_id", entryTest.id);
    const testQ = new Set((testRows ?? []).map((r) => r.question_id));
    // Filter happens client-side below if needed; but prefer DB filter:
    const ids = [...testQ];
    if (ids.length > 0) qQuery = qQuery.in("id", ids);
  }

  const { data: questionRows } = await qQuery;
  const questions = questionRows ?? [];

  if (questions.length === 0) {
    return {
      entryTestSlug: entryTest.slug,
      entryTestName: entryTest.name,
      subjectSlug: subject.slug,
      subjectName: subject.name,
      chapterSlug: chapter.slug,
      chapterTitle: chapter.title,
      usage,
      topicId: chapter.id,
      questions: [],
      resumeIndex: 0,
    };
  }

  // Load options (answer-free) for all questions in one round trip.
  const questionIds = questions.map((q) => q.id);
  const { data: optionRows } = await supabase
    .from("question_options")
    .select("id, question_id, option_label, content")
    .in("question_id", questionIds)
    .order("display_order", { ascending: true });

  const optionsByQuestion = new Map<string, QuizOption[]>();
  for (const o of optionRows ?? []) {
    const arr = optionsByQuestion.get(o.question_id) ?? [];
    arr.push({ id: o.id, label: o.option_label, content: o.content });
    optionsByQuestion.set(o.question_id, arr);
  }

  // Load the user's existing answers for this chapter+usage attempt (resume).
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  const savedByQuestion = new Map<string, string | null>();
  if (userId) {
    const { data: attempt } = await supabase
      .from("attempts")
      .select("id")
      .eq("user_id", userId)
      .eq("entry_test_id", entryTest.id)
      .eq("mode", "practice")
      .eq("topic_id", chapter.id)
      .eq("usage", usage)
      .eq("status", "in_progress")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (attempt) {
      const { data: answers } = await supabase
        .from("attempt_answers")
        .select("question_id, selected_option_id")
        .eq("attempt_id", attempt.id);
      for (const a of answers ?? []) {
        savedByQuestion.set(a.question_id, a.selected_option_id);
      }
    }
  }

  const quizQuestions: QuizQuestion[] = questions.map((q) => ({
    id: q.id,
    statement: q.statement,
    options: optionsByQuestion.get(q.id) ?? [],
    savedOptionId: savedByQuestion.get(q.id) ?? null,
  }));

  const savedFlags = quizQuestions.map((q) => q.savedOptionId !== null);

  return {
    entryTestSlug: entryTest.slug,
    entryTestName: entryTest.name,
    subjectSlug: subject.slug,
    subjectName: subject.name,
    chapterSlug: chapter.slug,
    chapterTitle: chapter.title,
    usage,
    topicId: chapter.id,
    questions: quizQuestions,
    resumeIndex: resumeIndex(savedFlags),
  };
}
