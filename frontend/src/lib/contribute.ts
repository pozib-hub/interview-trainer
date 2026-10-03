const DEFAULT_REPO = "pozib-hub/js-interview-trainer";
const REPO = (import.meta.env.VITE_GITHUB_REPO as string | undefined) || DEFAULT_REPO;

export function repoUrl(): string {
  return `https://github.com/${REPO}`;
}

export function newTaskIssueUrl(opts: {
  title?: string;
  sourceUrl?: string;
  description?: string;
} = {}): string {
  const params = new URLSearchParams();
  params.set("template", "new-task.md");
  params.set("labels", "task");

  if (opts.title) params.set("title", `[TASK] ${opts.title}`);

  const body: string[] = [];
  body.push("## URL источника");
  body.push(opts.sourceUrl || "");
  body.push("");
  body.push("## Описание задачи");
  body.push(opts.description || "");
  body.push("");
  body.push("## Решение (необязательно)");
  body.push("");
  body.push("## Дополнительные заметки");
  body.push("");
  params.set("body", body.join("\n"));

  return `${repoUrl()}/issues/new?${params.toString()}`;
}
