#!/usr/bin/env node
// Оркестратор вопросов: парсинг issue → промпт → LLM → валидация →
// добавление в главу → typecheck → PR preview.
//
// Входные env-переменные:
//   ISSUE_TITLE, ISSUE_BODY     — данные issue
//   QUESTIONS_ROOT              — путь к questions/ (по умолчанию <repo>/questions)
//   LLM_API_KEY / DEEPSEEK_API_KEY / OPENAI_API_KEY
//   LLM_BASE_URL, LLM_MODEL
//   SKIP_BUILD                  — "true" чтобы пропустить typecheck
//
// Логи пишутся в stdout И в файл .github/_pipeline-log.md (для artifact).
// При ошибке: exit 1 + ::error:: + .github/_error.md

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { callLLM } from "./lib/llm.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const QUESTIONS_ROOT = process.env.QUESTIONS_ROOT || path.join(REPO_ROOT, "questions");
const LOG_FILE = path.join(REPO_ROOT, ".github", "_pipeline-log.md");

const VALIDATION_RETRIES = Number(process.env.VALIDATION_RETRIES || "2");

const logLines = [];
let stepNum = 0;

function log(msg) {
  const ts = new Date().toISOString().slice(11, 23);
  const line = `[${ts}] ${msg}`;
  console.log(line);
  logLines.push(line);
}

function step(name) {
  stepNum++;
  log(`\n━━━ Шаг ${stepNum}: ${name} ━━━`);
}

function flushLog() {
  try {
    fs.writeFileSync(LOG_FILE, logLines.join("\n") + "\n", "utf8");
  } catch {}
}

function fail(msg) {
  log(`❌ ОШИБКА: ${msg}`);
  console.log(`::error::${msg}`);
  try {
    fs.writeFileSync(path.join(REPO_ROOT, ".github", "_error.md"), msg, "utf8");
  } catch {}
  flushLog();
  process.exit(1);
}

// ─── Парсинг issue ─────────────────────────────────────────────────────

function parseSection(body, title) {
  const re = new RegExp(`^##\\s+${title}\\s*$`, "mi");
  const match = body.match(re);
  if (!match) return "";
  const start = match.index + match[0].length;
  const rest = body.slice(start);
  const next = rest.match(/^##\s+/m);
  const content = next ? rest.slice(0, next.index) : rest;
  return content.replace(/<!--[\s\S]*?-->/g, "").trim();
}

function parseIssueBody(body) {
  return {
    direction: parseSection(body, "Направление"),
    technology: parseSection(body, "Технология"),
    chapter: parseSection(body, "Глава \\(необязательно\\)"),
    question: parseSection(body, "Вопрос"),
    answer: parseSection(body, "Ответ \\(необязательно\\)"),
    notes: parseSection(body, "Дополнительные заметки"),
  };
}

// ─── Сканирование questions/ ────────────────────────────────────────────

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function parseChapterFile(relDir, fileName, raw) {
  const titleMatch = raw.match(/^#\s+(.+)$/m);
  const title = (titleMatch?.[1] ?? fileName).trim();
  const questions = [];
  for (const segment of splitByQuestionHeadings(raw)) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    const nl = trimmed.indexOf("\n");
    const question = (nl === -1 ? trimmed : trimmed.slice(0, nl)).trim();
    if (question) questions.push(question);
  }
  return { fileName, title, questions };
}

/**
 * Делит markdown на сегменты по заголовкам `## ...` вне блоков кода.
 * Первый сегмент (до первого вопроса) отбрасывается.
 */
function splitByQuestionHeadings(raw) {
  const segments = [];
  let current = "";
  let inCode = false;
  for (const line of raw.split("\n")) {
    if (/^\s*```/.test(line)) {
      inCode = !inCode;
    } else if (!inCode && /^##\s+/.test(line)) {
      segments.push(current);
      current = line.replace(/^##\s+/, "") + "\n";
      continue;
    }
    current += line + "\n";
  }
  segments.push(current);
  return segments.slice(1);
}

function scanQuestionsTree() {
  const directions = [];
  for (const entry of fs.readdirSync(QUESTIONS_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    const dirPath = path.join(QUESTIONS_ROOT, entry.name);
    const meta = readJson(path.join(dirPath, "meta.json"));
    if (!meta) continue;

    const direction = {
      id: entry.name,
      title: String(meta.title ?? entry.name),
      technologies: [],
      chapters: [],
    };

    for (const sub of fs.readdirSync(dirPath, { withFileTypes: true })) {
      if (!sub.isDirectory() || sub.name.startsWith(".") || sub.name === "chapters") continue;
      const techDir = path.join(dirPath, sub.name);
      const techMeta = readJson(path.join(techDir, "meta.json"));
      if (!techMeta) continue;

      const chapters = scanChaptersDir(path.join(dirPath, sub.name), `${entry.name}/${sub.name}`);
      direction.technologies.push({
        id: sub.name,
        title: String(techMeta.title ?? sub.name),
        chapters,
      });
    }

    direction.chapters = scanChaptersDir(dirPath, entry.name);
    directions.push(direction);
  }
  return directions;
}

function scanChaptersDir(absDir, relDir) {
  const chaptersDir = path.join(absDir, "chapters");
  const out = [];
  try {
    for (const f of fs.readdirSync(chaptersDir, { withFileTypes: true })) {
      if (!f.isFile() || !f.name.endsWith(".md")) continue;
      const raw = fs.readFileSync(path.join(chaptersDir, f.name), "utf8");
      out.push(parseChapterFile(relDir, f.name, raw));
    }
  } catch {}
  return out.sort((a, b) => a.fileName.localeCompare(b.fileName));
}

// ─── Валидация и нормализация ───────────────────────────────────────────

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizeQuestion(q) {
  return q.toLowerCase().replace(/ё/g, "е").replace(/[?!.,;:«»"'`()\s]+/g, " ").trim();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function validateQuestionPayload(q, tree) {
  const errors = [];
  const direction = tree.find((d) => d.id === q.direction);

  if (!q.direction || !direction) {
    errors.push(`Направление "${q.direction}" не найдено. Доступны: ${tree.map((d) => d.id).join(", ")}.`);
    return errors;
  }

  if (q.direction === "hr") {
    if (q.technology) errors.push('Для раздела hr технология не указывается — главы лежат напрямую в questions/hr/chapters/.');
    return [...errors, ...validateChapterPart(q, direction, null)];
  }

  if (!q.technology || !SLUG_RE.test(q.technology)) {
    errors.push(`Технология "${q.technology}" должна быть kebab-case (например: javascript, html-css).`);
    return errors;
  }

  const existingTech = direction.technologies.find((t) => t.id === q.technology);
  if (!existingTech) {
    if (!q.technologyTitle || q.technologyTitle.length < 2) {
      errors.push(`Технология "${q.technology}" новая — нужен technologyTitle (человекочитаемое название).`);
    }
    return [...errors, ...validateChapterPart(q, null, null)];
  }

  return [...errors, ...validateChapterPart(q, direction, existingTech)];
}

function validateChapterPart(q, direction, technology) {
  const errors = [];
  if (!q.question || q.question.length < 5) {
    errors.push("Вопрос пустой или слишком короткий.");
  }
  if (!q.answer || q.answer.length < 20) {
    errors.push("Ответ пустой или слишком короткий (минимум 20 символов).");
  }
  // Заголовки проверяем вне блоков кода (```): # внутри кода — комментарий
  const answerOutsideCode = String(q.answer || "").replace(/```[\s\S]*?```/g, "");
  if (/^##\s/m.test(answerOutsideCode)) {
    errors.push("В ответе есть заголовки '## ' — они зарезервированы для вопросов. Используй ### или жирный текст.");
  }
  if (/^#\s/m.test(answerOutsideCode)) {
    errors.push("В ответе есть заголовок '# ' — он зарезервирован для названия главы.");
  }

  const chapters = technology ? technology.chapters : direction ? direction.chapters : [];
  if (!chapters || chapters.length === 0) return errors;

  // Дедупликация: такой вопрос уже есть в технологии/направлении
  const target = technology ?? direction;
  const normalized = normalizeQuestion(q.question || "");
  for (const ch of target.chapters) {
    for (const existing of ch.questions) {
      if (normalizeQuestion(existing) === normalized) {
        errors.push(`Вопрос уже существует в главе "${ch.title}": "${existing}"`);
      }
    }
  }

  if (q.chapter && !SLUG_RE.test(q.chapter)) {
    errors.push(`Глава "${q.chapter}" должна быть kebab-case (например: 003-async-event-loop).`);
  }

  return errors;
}

// ─── Генерация промпта ──────────────────────────────────────────────────

function buildContext(tree) {
  const lines = ["Текущая структура сборника вопросов:"];
  for (const d of tree) {
    lines.push(`- Направление: ${d.id} (${d.title})`);
    if (d.technologies.length > 0) {
      for (const t of d.technologies) {
        lines.push(`  - Технология: ${t.id} (${t.title})`);
        for (const c of t.chapters) {
          lines.push(`    - Глава: ${c.fileName.replace(/\.md$/, "")} — "${c.title}" (${c.questions.length} вопросов)`);
        }
      }
    } else {
      for (const c of d.chapters) {
        lines.push(`  - Глава: ${c.fileName.replace(/\.md$/, "")} — "${c.title}" (${c.questions.length} вопросов)`);
      }
    }
  }
  return lines.join("\n");
}

function buildSystemMessage(tree) {
  return [
    "Ты — технический редактор сборника вопросов для подготовки к собеседованиям.",
    "Твоя задача — оформить один вопрос с ответом по данным issue.",
    "",
    "## Правила формата сборника:",
    "- Структура: направление → технология → главы (markdown-файлы) → вопросы.",
    "- Каждый вопрос — заголовок `## <текст вопроса>` внутри файла главы.",
    "- Название главы — заголовок `# <название>` первой строкой файла.",
    "- В ответах ЗАПРЕЩЕНЫ заголовки `#` и `##` (ломают парсер). Разрешены: ```блоки кода```, `инлайн-код`, **жирный**, списки.",
    "- Язык — русский. Стиль ответа: сначала суть в 1-2 предложениях, потом детали, код-примеры где уместно. 3-7 предложений.",
    "",
    "## Структура ответа (только валидный JSON):",
    "{",
    '  "direction": "frontend|backend|devops|hr",',
    '  "technology": "kebab-case slug или пустая строка для hr",',
    '  "technologyTitle": "человекочитаемое название — только если создаёшь НОВУЮ технологию, иначе пусто",',
    '  "chapter": "существующий slug главы или kebab-case slug новой (например 005-memory)",',
    '  "chapterTitle": "название главы — нужно только если главы нет или создаётся новая, иначе пусто",',
    '  "question": "текст вопроса (обычно заканчивается на ?)",',
    '  "answer": "ответ в markdown без заголовков #/##"',
    "}",
    "",
    "## Правила выбора:",
    "- Направление — только из существующих в контексте ниже.",
    "- Технология — существующая или новая (для новой обязателен technologyTitle). Для hr — пустая строка.",
    "- Глава — существующая по смыслу или новая (для новой: chapter = NNN-slug, chapterTitle обязателен).",
    "- НЕ дублируй существующие вопросы — изучи контекст.",
    "",
    "## Контекст:",
    buildContext(tree),
  ].join("\n");
}

function buildUserMessage(parsed) {
  const lines = ["## Данные из issue:", ""];
  if (parsed.direction) lines.push(`Направление (пожелание пользователя): ${parsed.direction}`);
  if (parsed.technology) lines.push(`Технология (пожелание пользователя): ${parsed.technology}`);
  if (parsed.chapter) lines.push(`Глава (пожелание пользователя): ${parsed.chapter}`);
  lines.push(`Вопрос: ${parsed.question}`);
  if (parsed.answer) lines.push(`Ответ пользователя (используй как основу, дополни и оформи): ${parsed.answer}`);
  if (parsed.notes) lines.push(`Заметки: ${parsed.notes}`);
  lines.push("", "Верни JSON по схеме. Только JSON, без пояснений.");
  return lines.join("\n");
}

// ─── Запись файлов ──────────────────────────────────────────────────────

function findChapterFile(directionId, technologyId, chapterSlug) {
  const dir = technologyId
    ? path.join(QUESTIONS_ROOT, directionId, technologyId, "chapters")
    : path.join(QUESTIONS_ROOT, directionId, "chapters");
  const candidates = [`${chapterSlug}.md`];
  for (const f of candidates) {
    if (fs.existsSync(path.join(dir, f))) return path.join(dir, f);
  }
  return null;
}

function nextChapterNumber(dir) {
  let max = 0;
  try {
    for (const f of fs.readdirSync(dir)) {
      const m = f.match(/^(\d{3})-/);
      if (m) max = Math.max(max, Number(m[1]));
    }
  } catch {}
  return max + 1;
}

function applyQuestion(q) {
  const techDir = q.technology ? path.join(QUESTIONS_ROOT, q.direction, q.technology) : path.join(QUESTIONS_ROOT, q.direction);
  const chaptersDir = path.join(techDir, "chapters");

  // Новая технология
  if (q.technology && !fs.existsSync(path.join(techDir, "meta.json"))) {
    fs.mkdirSync(chaptersDir, { recursive: true });
    fs.writeFileSync(
      path.join(techDir, "meta.json"),
      JSON.stringify({ title: q.technologyTitle || q.technology, description: "", order: 99 }, null, 2) + "\n",
      "utf8"
    );
    log(`   Создана технология: ${q.direction}/${q.technology} (${q.technologyTitle})`);
  }

  // Определяем файл главы
  let chapterFile = findChapterFile(q.direction, q.technology, q.chapter);
  let chapterSlug = q.chapter;

  if (!chapterFile) {
    fs.mkdirSync(chaptersDir, { recursive: true });
    const num = String(nextChapterNumber(chaptersDir)).padStart(3, "0");
    const slug = q.chapter && /^\d{3}-/.test(q.chapter) ? q.chapter : `${num}-${slugify(q.chapterTitle || q.chapter || "chapter")}`;
    chapterSlug = slug;
    chapterFile = path.join(chaptersDir, `${slug}.md`);
    fs.writeFileSync(chapterFile, `# ${q.chapterTitle || q.chapter}\n`, "utf8");
    log(`   Создана глава: ${chapterFile}`);
  }

  // Дописываем вопрос
  const content = fs.readFileSync(chapterFile, "utf8").replace(/\s+$/, "");
  const entry = `\n\n## ${q.question}\n\n${q.answer.trim()}\n`;
  fs.writeFileSync(chapterFile, content + entry, "utf8");

  return {
    filePath: path.relative(REPO_ROOT, chapterFile),
    chapterSlug,
  };
}

// ─── main ───────────────────────────────────────────────────────────────

async function main() {
  log("🚀 Запуск AI-генерации вопроса");
  log(`   QUESTIONS_ROOT: ${QUESTIONS_ROOT}`);

  const title = process.env.ISSUE_TITLE || "";
  const body = process.env.ISSUE_BODY || "";
  if (!title && !body) {
    fail("Нет данных issue (ISSUE_TITLE / ISSUE_BODY не заданы).");
  }

  step("Парсинг issue");
  const parsed = parseIssueBody(body);
  log(`   direction:   ${parsed.direction || "(пусто)"}`);
  log(`   technology: ${parsed.technology || "(пусто)"}`);
  log(`   chapter:    ${parsed.chapter || "(пусто)"}`);
  log(`   question:   ${parsed.question ? parsed.question.length + " символов" : "(пусто)"}`);
  log(`   свой ответ: ${parsed.answer ? parsed.answer.length + " символов" : "(нет)"}`);

  if (!parsed.question && !parsed.answer) {
    fail("Секция «Вопрос» пуста — нечего оформлять.");
  }

  step("Сканирование questions/");
  const tree = scanQuestionsTree();
  if (tree.length === 0) {
    fail("В questions/ не найдено ни одного направления.");
  }
  log(`   Направлений: ${tree.length}`);

  step("Вызов LLM и валидация (с retry)");
  const messages = [
    { role: "system", content: buildSystemMessage(tree) },
    { role: "user", content: buildUserMessage({ ...parsed, question: parsed.question || title.replace(/^\[QUESTION\]\s*/i, "") }) },
  ];

  let q = null;
  let lastErrors = [];

  for (let attempt = 0; attempt <= VALIDATION_RETRIES; attempt++) {
    if (attempt > 0) {
      log(`\n   🔁 Попытка ${attempt + 1}/${VALIDATION_RETRIES + 1} (исправление по ошибкам)`);
      messages.push({ role: "assistant", content: JSON.stringify(q) });
      messages.push({
        role: "user",
        content: [
          "Твой предыдущий ответ содержит ошибки валидации. Исправь и верни обновлённый JSON.",
          "",
          "## Ошибки:",
          ...lastErrors.map((e) => `- ${e}`),
          "",
          "Верни ИСПРАВЛЕННЫЙ JSON по той же схеме. Только JSON.",
        ].join("\n"),
      });
    }

    try {
      const result = await callLLM({ messages });
      q = result.task;
    } catch (e) {
      fail(`Ошибка вызова LLM: ${e.message}${e.detail ? `\nДетали: ${e.detail}` : ""}`);
    }

    log(`   Получен ответ:`);
    log(`     direction:       ${q.direction}`);
    log(`     technology:      ${q.technology || "(hr, без технологии)"}`);
    log(`     technologyTitle: ${q.technologyTitle || "(существующая)"}`);
    log(`     chapter:         ${q.chapter}`);
    log(`     chapterTitle:    ${q.chapterTitle || "(существующая)"}`);
    log(`     question:        ${q.question}`);
    log(`     answer:          ${(q.answer || "").length} символов`);

    const errors = validateQuestionPayload(q, tree);
    if (errors.length === 0) {
      log("   ✓ Валидация пройдена");
      break;
    }

    lastErrors = errors;
    log(`   ⚠ Найдено ${errors.length} ошибок валидации:`);
    for (const e of errors) log(`     • ${e}`);

    if (attempt >= VALIDATION_RETRIES) {
      fail(
        `LLM вернул невалидный результат после ${attempt + 1} попыток:\n` +
          errors.map((e) => `  - ${e}`).join("\n") +
          "\n\nСырой ответ LLM:\n" +
          JSON.stringify(q, null, 2)
      );
    }
  }

  step("Добавление вопроса в главу");
  const { filePath } = applyQuestion(q);
  log(`   ✓ Вопрос добавлен в ${filePath}`);

  step("Проверка typecheck");
  if (process.env.SKIP_BUILD !== "true") {
    const { execSync } = await import("node:child_process");
    try {
      execSync("npm run typecheck", { cwd: REPO_ROOT, stdio: "pipe", env: process.env });
      log("   ✓ Typecheck прошёл успешно");
    } catch (e) {
      const out = (e.stdout?.toString() || "") + (e.stderr?.toString() || "");
      fail(`Typecheck упал после добавления вопроса:\n${out.slice(-3000)}`);
    }
  } else {
    log("   ⏭ Typecheck пропущен (SKIP_BUILD=true)");
  }

  step("Генерация PR preview");
  const preview = [
    `## Добавлен вопрос: \`${q.direction}/${q.technology || "-"}\``,
    "",
    `**Вопрос:** ${q.question}  `,
    `**Направление:** ${q.direction} · **Технология:** ${q.technology || "—"} · **Глава:** \`${q.chapter}\``,
    "",
    `<details><summary>Ответ</summary>`,
    "",
    q.answer,
    "",
    `</details>`,
    "",
    "Сгенерировано AI из соответствующего Issue. Проверьте корректность перед merge.",
  ].join("\n");
  fs.writeFileSync(path.join(REPO_ROOT, ".github", "_pr_preview.md"), preview, "utf8");
  log("   ✓ PR preview записан");

  const branchId = `${q.direction}-${q.technology || q.direction}`;
  console.log(`::branch::question/${branchId}`);
  console.log(`::title::${q.question}`);

  log("\n✅ Генерация завершена успешно!");
  flushLog();
}

main().catch((e) => fail(e?.stack || String(e)));
