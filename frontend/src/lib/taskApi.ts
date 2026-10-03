import type { RunResult, TaskFull, TaskSummary } from "./types";
import { apiFetch } from "./fetchApi";

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
