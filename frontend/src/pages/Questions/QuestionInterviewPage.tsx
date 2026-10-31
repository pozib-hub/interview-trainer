import { useEffect, useRef, useState } from "react";
import type { AnalyzeVerdict, PlanQuestion, QuestionsIndex, StoredInterviewSession } from "@lib/types";
import {
  fetchQuestionsIndex,
  startPlanJob,
  startAnalyzeJob,
  pollQuestionJob,
  type PlanInterviewResult,
} from "@lib/questionsApi";
import SetupPhase from "./interview/components/SetupPhase";
import SessionPhase from "./interview/components/SessionPhase";
import ResultsPhase from "./interview/components/ResultsPhase";
import ConfirmFinishModal from "./interview/components/ConfirmFinishModal";

type Phase = "setup" | "planning" | "session" | "analyzing" | "results";

const LS_SESSION_KEY = "it:question-interview";
const LS_PLAN_JOB_KEY = "it:question-interview-plan-job";

interface PlanJobState {
  jobId: string;
  directionId: string;
}

export interface ResultItem {
  question: PlanQuestion;
  userAnswer: string;
  ok: boolean;
  feedback: string;
}

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function QuestionInterviewPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [index, setIndex] = useState<QuestionsIndex | null>(null);
  const [savedSession, setSavedSession] = useState<StoredInterviewSession | null>(null);

  const [direction, setDirection] = useState("");
  const [planQuestions, setPlanQuestions] = useState<PlanQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [startedAt, setStartedAt] = useState(0);

  const [planError, setPlanError] = useState("");
  const [analyzeError, setAnalyzeError] = useState("");
  const [results, setResults] = useState<ResultItem[] | null>(null);
  const [summary, setSummary] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchQuestionsIndex().then(setIndex).catch(() => setIndex({ directions: [] }));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_SESSION_KEY);
      if (!raw) return;
      const s = JSON.parse(raw) as StoredInterviewSession;
      if (s?.version === 1 && Array.isArray(s.questions) && s.questions.length > 0) {
        setSavedSession(s);
      }
    } catch {}
  }, []);

  const applyPlan = (data: PlanInterviewResult, directionId: string) => {
    setDirection(directionId);
    setPlanQuestions(data.questions);
    setAnswers({});
    setCurrent(0);
    setStartedAt(Date.now());
    setSavedSession(null);
    setPhase("session");
  };

  const applyAnalyze = (
    verdicts: Map<string, AnalyzeVerdict>,
    verdictSummary: string,
    qs: PlanQuestion[],
    as: Record<string, string>
  ) => {
    const items = qs
      .map((q) => ({ question: q, userAnswer: (as[q.id] ?? "").trim() }))
      .filter((it) => it.userAnswer.length > 0);
    setResults(
      items.map((it) => ({
        question: it.question,
        userAnswer: it.userAnswer,
        ok: verdicts.get(it.question.id)?.ok ?? false,
        feedback: verdicts.get(it.question.id)?.feedback ?? "",
      }))
    );
    setSummary(verdictSummary);
    try {
      localStorage.removeItem(LS_SESSION_KEY);
    } catch {}
    setSavedSession(null);
    setPhase("results");
  };

  // Восстановление: незавершённый job плана (перезагрузка во время генерации)
  useEffect(() => {
    const planJob = readJSON<PlanJobState>(LS_PLAN_JOB_KEY);
    if (!planJob?.jobId) return;
    setPhase("planning");
    pollQuestionJob<PlanInterviewResult>(planJob.jobId)
      .then((data) => {
        localStorage.removeItem(LS_PLAN_JOB_KEY);
        applyPlan(data, planJob.directionId);
      })
      .catch((e) => {
        localStorage.removeItem(LS_PLAN_JOB_KEY);
        setPlanError((e as Error).message);
        setPhase("setup");
      });
  }, []);

  // Восстановление: незавершённый job разбора ответов (в сохранённой сессии)
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const s = readJSON<StoredInterviewSession>(LS_SESSION_KEY);
    if (!s?.analyzeJobId) return;
    if (s.version !== 1 || !Array.isArray(s.questions) || s.questions.length === 0) return;

    setDirection(s.direction);
    setPlanQuestions(s.questions);
    setAnswers(s.answers ?? {});
    setCurrent(s.currentIndex ?? 0);
    setStartedAt(s.startedAt);
    setPhase("analyzing");

    pollQuestionJob<{ results: AnalyzeVerdict[]; summary: string }>(s.analyzeJobId)
      .then((data) => {
        applyAnalyze(
          new Map<string, AnalyzeVerdict>((data.results ?? []).map((v) => [v.id, v])),
          data.summary ?? "",
          s.questions,
          s.answers ?? {}
        );
      })
      .catch((e) => {
        setAnalyzeError((e as Error).message);
        setPhase("session");
      });
  }, []);

  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [analyzeJobId, setAnalyzeJobId] = useState<string | null>(null);
  useEffect(() => {
    if (phase !== "session" || !planQuestions) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      const s: StoredInterviewSession = {
        version: 1,
        startedAt,
        direction,
        questions: planQuestions,
        answers,
        currentIndex: current,
        analyzeJobId: analyzeJobId ?? undefined,
      };
      try {
        localStorage.setItem(LS_SESSION_KEY, JSON.stringify(s));
      } catch {}
    }, 500);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [phase, planQuestions, answers, current, startedAt, direction, analyzeJobId]);

  const start = async (directionId: string, technologies: string[]) => {
    setPlanError("");
    setPhase("planning");
    try {
      const job = await startPlanJob(directionId, technologies);
      try {
        localStorage.setItem(LS_PLAN_JOB_KEY, JSON.stringify({ jobId: job.id, directionId } satisfies PlanJobState));
      } catch {}
      const data = await pollQuestionJob<PlanInterviewResult>(job.id);
      localStorage.removeItem(LS_PLAN_JOB_KEY);
      applyPlan(data, directionId);
    } catch (e) {
      localStorage.removeItem(LS_PLAN_JOB_KEY);
      setPlanError((e as Error).message);
      setPhase("setup");
    }
  };

  const resume = () => {
    if (!savedSession) return;
    setDirection(savedSession.direction);
    setPlanQuestions(savedSession.questions);
    setAnswers(savedSession.answers ?? {});
    setCurrent(savedSession.currentIndex ?? 0);
    setStartedAt(savedSession.startedAt);
    setPhase("session");
  };

  const discardSaved = () => {
    try {
      localStorage.removeItem(LS_SESSION_KEY);
    } catch {}
    setSavedSession(null);
  };

  const onAnswer = (qid: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: text }));
  };

  const goTo = (i: number) => {
    setCurrent(Math.max(0, Math.min(i, (planQuestions?.length ?? 1) - 1)));
  };

  const next = () => {
    if (!planQuestions) return;
    if (current < planQuestions.length - 1) goTo(current + 1);
    else finish();
  };

  const finishEarly = () => {
    if (!planQuestions) return;
    setConfirmOpen(true);
  };

  const confirmFinish = () => {
    setConfirmOpen(false);
    void finish();
  };

  const answeredCount = () =>
    (planQuestions ?? []).filter((q) => (answers[q.id] ?? "").trim().length > 0).length;

  const finish = async () => {
    const qs = planQuestions ?? [];
    const items = qs
      .map((q) => ({ question: q, userAnswer: (answers[q.id] ?? "").trim() }))
      .filter((it) => it.userAnswer.length > 0);

    if (items.length === 0) {
      setAnalyzeError("Нет ни одного ответа — ответьте хотя бы на один вопрос голосом или текстом");
      return;
    }

    setAnalyzeError("");
    setPhase("analyzing");
    try {
      const job = await startAnalyzeJob(
        items.map((it) => ({
          id: it.question.id,
          question: it.question.question,
          referenceAnswer: it.question.answer,
          userAnswer: it.userAnswer,
        }))
      );
      setAnalyzeJobId(job.id);
      try {
        const s: StoredInterviewSession = {
          version: 1,
          startedAt,
          direction,
          questions: qs,
          answers,
          currentIndex: current,
          analyzeJobId: job.id,
        };
        localStorage.setItem(LS_SESSION_KEY, JSON.stringify(s));
      } catch {}

      const data = await pollQuestionJob<{ results: AnalyzeVerdict[]; summary: string }>(job.id);
      setAnalyzeJobId(null);
      applyAnalyze(
        new Map<string, AnalyzeVerdict>((data.results ?? []).map((v) => [v.id, v])),
        data.summary ?? "",
        qs,
        answers
      );
    } catch (e) {
      setAnalyzeJobId(null);
      setAnalyzeError((e as Error).message);
      setPhase("session");
    }
  };

  const restart = () => {
    try {
      localStorage.removeItem(LS_SESSION_KEY);
      localStorage.removeItem(LS_PLAN_JOB_KEY);
    } catch {}
    setSavedSession(null);
    setPlanQuestions(null);
    setAnswers({});
    setResults(null);
    setSummary("");
    setCurrent(0);
    setPhase("setup");
  };

  if (phase === "setup" || phase === "planning") {
    return (
      <SetupPhase
        index={index}
        savedSession={savedSession}
        onResume={resume}
        onDiscard={discardSaved}
        onStart={start}
        busy={phase === "planning"}
        error={planError}
      />
    );
  }

  if ((phase === "session" || phase === "analyzing") && planQuestions) {
    return (
      <>
        <SessionPhase
          questions={planQuestions}
          current={current}
          answers={answers}
          onAnswer={onAnswer}
          onGoTo={goTo}
          onNext={next}
          onFinishEarly={finishEarly}
          startedAt={startedAt}
          analyzing={phase === "analyzing"}
          error={analyzeError}
        />
        <ConfirmFinishModal
          open={confirmOpen}
          answered={answeredCount()}
          total={planQuestions.length}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={confirmFinish}
        />
      </>
    );
  }

  if (phase === "results" && results) {
    return (
      <ResultsPhase
        items={results}
        summary={summary}
        totalQuestions={planQuestions?.length ?? results.length}
        onRestart={restart}
      />
    );
  }

  return null;
}
