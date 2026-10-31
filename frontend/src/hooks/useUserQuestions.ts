import { useCallback, useEffect, useState } from "react";
import type { UserQuestion } from "@lib/types";
import { apiFetch } from "@lib/fetchApi";

export interface UserQuestionDraft {
  question: string;
  answer: string;
  category?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    let message = `Ошибка ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {}
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/**
 * Собственные вопросы пользователя — хранятся на сервере (PostgreSQL)
 * и привязаны к учётной записи или гостевой сессии.
 */
export function useUserQuestions() {
  const [questions, setQuestions] = useState<UserQuestion[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    request<UserQuestion[]>("/api/my-questions")
      .then((items) => {
        if (!cancelled) setQuestions(items ?? []);
      })
      .catch(() => {
        if (!cancelled) setQuestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addQuestion = useCallback((draft: UserQuestionDraft): Promise<UserQuestion> => {
    setError("");
    return request<UserQuestion>("/api/my-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: draft.question,
        answer: draft.answer,
        category: draft.category ?? "",
      }),
    }).then((item) => {
      setQuestions((prev) => [item, ...(prev ?? [])]);
      return item;
    });
  }, []);

  const updateQuestion = useCallback((id: string, draft: UserQuestionDraft): Promise<UserQuestion> => {
    setError("");
    return request<UserQuestion>(`/api/my-questions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: draft.question,
        answer: draft.answer,
        category: draft.category ?? "",
      }),
    }).then((item) => {
      setQuestions((prev) => (prev ?? []).map((q) => (q.id === id ? item : q)));
      return item;
    });
  }, []);

  const removeQuestion = useCallback((id: string): Promise<void> => {
    setError("");
    return request<void>(`/api/my-questions/${id}`, { method: "DELETE" })
      .then(() => {
        setQuestions((prev) => (prev ?? []).filter((q) => q.id !== id));
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Не удалось удалить вопрос");
      });
  }, []);

  return {
    questions: questions ?? [],
    loaded: questions !== null,
    error,
    addQuestion,
    updateQuestion,
    removeQuestion,
  };
}
