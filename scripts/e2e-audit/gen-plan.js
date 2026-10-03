// Генерирует plan.json — список всех задач с путями до эталонных решений аудит-корпуса.
// Решения лежат в solutions/<topic>/<slug>.ts и покрывают все задачи из backend/tasks.
const fs = require("fs");
const path = require("path");

const TASKS_ROOT = path.join(__dirname, "..", "..", "backend", "tasks");
const SOLUTIONS_ROOT = path.join(__dirname, "solutions");

const plan = [];
for (const topic of fs.readdirSync(TASKS_ROOT).sort()) {
  const topicDir = path.join(TASKS_ROOT, topic);
  if (!fs.statSync(topicDir).isDirectory()) continue;
  for (const slug of fs.readdirSync(topicDir).sort()) {
    if (!fs.statSync(path.join(topicDir, slug)).isDirectory()) continue;
    const solution = path.join(SOLUTIONS_ROOT, topic, `${slug}.ts`);
    plan.push({ id: `${topic}/${slug}`, solution });
  }
}
process.stdout.write(JSON.stringify(plan, null, 1));
