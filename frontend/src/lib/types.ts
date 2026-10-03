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
