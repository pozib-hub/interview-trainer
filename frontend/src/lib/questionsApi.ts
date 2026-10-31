import type { AnalyzeVerdict, PlanQuestion, QuestionsDirection, QuestionsIndex, QuestionsTechnology } from "./types";
import { apiFetch } from "./fetchApi";
import { startJob, pollJob } from "./jobsApi";

export async function fetchQuestionsIndex(): Promise<QuestionsIndex> {
  const res = await apiFetch("/api/questions");
  const data = await res.json();
  return data as QuestionsIndex;
}

export interface PlanInterviewResult {
  questions: PlanQuestion[];
  durationMinutes: number;
  iterations: number;
  lastAdjustment: string | null;
}

export interface AnalyzeItemInput {
  id: string;
  question: string;
  referenceAnswer: string;
  userAnswer: string;
}

export function startPlanJob(direction: string, technologies: string[]): Promise<{ id: string }> {
  return startJob("/api/question-interview/plan", { direction, technologies });
}

export function startAnalyzeJob(items: AnalyzeItemInput[]): Promise<{ id: string }> {
  return startJob("/api/question-interview/analyze", { items });
}

export function pollQuestionJob<T>(id: string, intervalMs?: number): Promise<T> {
  return pollJob<T>(id, intervalMs);
}

export interface QuestionProposalInput {
  question: string;
  userAnswer?: string;
  direction?: string;
  technology?: string;
  notes?: string;
}

export interface QuestionProposalResult {
  prUrl: string;
  branch: string;
  file: string;
  dryRun: boolean;
  direction: string;
  technology: string;
  chapter: string;
  chapterTitle: string;
  question: string;
  answer: string;
  newTechnology: boolean;
  newChapter: boolean;
}

/** Предложение вопроса: фоновая задача (LLM + GitHub PR), результат — поллингом. */
export async function proposeQuestion(
  input: QuestionProposalInput
): Promise<{ ok: true; data: QuestionProposalResult } | { ok: false; error: string }> {
  try {
    const job = await startJob("/api/question-proposal", input);
    const data = await pollJob<QuestionProposalResult>(job.id);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось оформить вопрос" };
  }
}

export function directionQuestionCount(direction: QuestionsDirection): number {
  const viaTech = direction.technologies.reduce(
    (n, t) => n + t.chapters.reduce((m, c) => m + c.questions.length, 0),
    0
  );
  const own = direction.chapters.reduce((n, c) => n + c.questions.length, 0);
  return viaTech + own;
}

export function technologyQuestionCount(technology: QuestionsTechnology): number {
  return technology.chapters.reduce((n, c) => n + c.questions.length, 0);
}

export interface QuestionCategoryOption {
  value: string;
  label: string;
}

export function buildCategoryOptions(index: QuestionsIndex): QuestionCategoryOption[] {
  const out: QuestionCategoryOption[] = [];
  for (const d of index.directions) {
    if (d.technologies.length > 0) {
      for (const t of d.technologies) {
        out.push({ value: t.id, label: `${d.title} / ${t.title}` });
      }
    } else {
      out.push({ value: d.id, label: d.title });
    }
  }
  return out;
}

export function categoryLabel(index: QuestionsIndex, value: string): string {
  if (!value) return "Без категории";
  for (const d of index.directions) {
    const tech = d.technologies.find((t) => t.id === value);
    if (tech) return `${d.title} / ${tech.title}`;
    if (d.id === value) return d.title;
  }
  return "Без категории";
}
