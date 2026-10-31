export type Difficulty = "easy" | "medium" | "hard";

export type TaskLanguage = "typescript" | "tsx" | "javascript";

export interface TaskMeta {
  title: string;
  difficulty: Difficulty;
  tags: string[];
  language: TaskLanguage;
  /** Функция/символ, который пользователь должен реализовать и экспортировать */
  exports?: string[];
}

export interface TaskSummary {
  id: string;
  topic: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  language: TaskLanguage;
}

export interface TaskFull extends TaskSummary {
  condition: string;
  template: string;
  hints: string[];
  solution: string;
  testFile: string;
  exports?: string[];
}

export interface TestAssertion {
  name: string;
  passed: boolean;
  message?: string;
}

export interface RunResult {
  taskId: string;
  passed: boolean;
  total: number;
  failed: number;
  assertions: TestAssertion[];
  stdout: string;
  stderr: string;
  durationMs: number;
}

export interface TaskProposalInput {
  title: string;
  sourceUrl: string;
  description: string;
  userSolution: string;
  notes: string;
}

export interface TaskProposalSelfCheck {
  passed: boolean;
  total: number;
  failed: number;
  stderr: string;
}

export interface TaskProposalResult {
  taskId: string;
  topic: string;
  slug: string;
  title: string;
  prUrl: string;
  branch: string;
  dryRun: boolean;
  selfCheck: TaskProposalSelfCheck;
}

export interface HintResponse {
  hint: string;
}

export interface TaskReview {
  verdict: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  questions: string[];
  complexity: string;
  comparison: string;
}

// ─── Сборник вопросов с собеседований ──────────────────────────────────────

export interface QuestionEntry {
  id: string;
  question: string;
  answer: string;
}

export interface QuestionChapter {
  id: string;
  title: string;
  questions: QuestionEntry[];
}

export interface QuestionsTechnology {
  id: string;
  directionId: string;
  title: string;
  description: string;
  order?: number;
  chapters: QuestionChapter[];
}

export interface QuestionsDirection {
  id: string;
  title: string;
  description: string;
  order?: number;
  technologies: QuestionsTechnology[];
  chapters: QuestionChapter[];
}

export interface QuestionsIndex {
  directions: QuestionsDirection[];
}

export interface UserQuestion {
  id: string;
  question: string;
  answer: string;
  category?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PlanQuestion {
  id: string;
  question: string;
  answer: string;
  techTitle: string;
  chapterTitle: string;
}

export interface AnalyzeVerdict {
  id: string;
  ok: boolean;
  feedback: string;
}

export interface StoredInterviewSession {
  version: 1;
  startedAt: number;
  direction: string;
  questions: PlanQuestion[];
  answers: Record<string, string>;
  currentIndex: number;
  analyzeJobId?: string;
}

export type QuestionJobStatus = "pending" | "running" | "done" | "failed";

export interface QuestionJob {
  id: string;
  kind: "plan" | "analyze";
  status: QuestionJobStatus;
  result?: unknown;
  error?: string;
  createdAt: number;
  updatedAt: number;
}
