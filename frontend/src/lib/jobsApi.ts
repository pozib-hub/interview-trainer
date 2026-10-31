import { apiFetch } from "./fetchApi";

export type JobKind =
  | "plan"
  | "analyze"
  | "task_proposal"
  | "hint"
  | "review"
  | "question_proposal";

export type JobStatus = "pending" | "running" | "done" | "failed";

export interface JobInfo {
  id: string;
  kind: JobKind;
  status: JobStatus;
}

export interface JobView {
  id: string;
  kind: JobKind;
  status: JobStatus;
  result?: unknown;
  error?: string;
  /** Машинный код причины сбоя: network_error, timeout, llm_auth и т.д. */
  errorCode?: string;
}

/** Запускает фоновую задачу: длительные LLM-операции выполняются на сервере,
 *  HTTP-запрос возвращается сразу с id задачи. */
export async function startJob(path: string, body: unknown): Promise<JobInfo> {
  const res = await apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Ошибка ${res.status}`);
  return data as JobInfo;
}

export async function fetchJob(id: string): Promise<JobView> {
  const res = await apiFetch(`/api/jobs/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Ошибка ${res.status}`);
  return data as JobView;
}

/** Поллинг задачи до завершения. Возвращает result при done,
 *  бросает Error с человеческим сообщением при failed. */
export async function pollJob<T>(id: string, intervalMs = 2000): Promise<T> {
  for (;;) {
    const job = await fetchJob(id);
    if (job.status === "done") return job.result as T;
    if (job.status === "failed") {
      const err = new Error(job.error || "Задача завершилась с ошибкой") as Error & { code?: string };
      err.code = job.errorCode;
      throw err;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
