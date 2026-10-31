import type { RunResult, TaskFull, TaskSummary, TaskProposalInput, TaskProposalResult, HintResponse, TaskReview } from "./types";
import { apiFetch } from "./fetchApi";
import { startJob, pollJob } from "./jobsApi";

export async function fetchTasks(): Promise<TaskSummary[]> {
  const res = await apiFetch("/api/tasks");
  const data = await res.json();
  return data.tasks || [];
}

export async function fetchTopics(): Promise<Record<string, TaskSummary[]>> {
  const res = await apiFetch("/api/tasks");
  const data = await res.json();
  return data.topics || {};
}

export async function fetchTask(id: string): Promise<TaskFull | null> {
  const res = await apiFetch(`/api/task/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function runTests(taskId: string, code: string): Promise<RunResult> {
  const res = await apiFetch("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId, code }),
  });
  return res.json();
}

/** Генерация задачи: фоновая задача (LLM + тесты + PR), результат — поллингом. */
export async function proposeTask(input: TaskProposalInput): Promise<{ ok: true; data: TaskProposalResult } | { ok: false; error: string }> {
  try {
    const job = await startJob("/api/task-proposal", input);
    const data = await pollJob<TaskProposalResult>(job.id);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось сгенерировать задачу" };
  }
}

/** Подсказка: фоновая задача (LLM), результат — поллингом. */
export async function requestHint(
  taskId: string,
  code: string,
  previousHints: string[],
): Promise<HintResponse | { error: string }> {
  try {
    const job = await startJob("/api/task-hint", { taskId, code, previousHints });
    return await pollJob<HintResponse>(job.id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Не удалось получить подсказку" };
  }
}

/** ИИ-ревью кода: фоновая задача (LLM), результат — поллингом. */
export async function requestReview(
  taskId: string,
  code: string,
): Promise<TaskReview | { error: string }> {
  try {
    const job = await startJob("/api/task-review", { taskId, code });
    return await pollJob<TaskReview>(job.id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Не удалось получить ревью" };
  }
}
