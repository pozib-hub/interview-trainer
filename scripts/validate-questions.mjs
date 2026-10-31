#!/usr/bin/env node
/**
 * Валидация структуры сборника вопросов:
 * - у каждого направления есть meta.json с title
 * - у каждой технологии есть meta.json с title и хотя бы одна глава
 * - каждый файл главы: `# Название`, >=1 вопрос `## ...` с непустым ответом
 * - в ответах нет заголовков `#`/`##` (ломают парсер)
 * - имена папок — kebab-case
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QUESTIONS_ROOT = path.resolve(__dirname, "../backend/questions");

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const errors = [];
const warnings = [];
let directions = 0;
let technologies = 0;
let chapters = 0;
let questions = 0;

function readSafe(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

/** Убирает блоки кода ``` — для проверки заголовков вне кода. */
function stripCodeBlocks(text) {
  return text.replace(/```[\s\S]*?```/g, "");
}

function validateChapter(file, relDir, fileName) {
  chapters++;
  const rel = `${relDir}/chapters/${fileName}`;
  const raw = readSafe(file);
  if (raw == null) {
    errors.push(`${rel}: не читается`);
    return;
  }

  if (!/^#\s+.+$/m.test(raw)) {
    errors.push(`${rel}: нет заголовка главы "# Название"`);
  }

  const segments = splitByQuestionHeadings(raw);
  if (segments.length < 1) {
    errors.push(`${rel}: нет ни одного вопроса "## ..."`);
    return;
  }

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    const nl = trimmed.indexOf("\n");
    const question = (nl === -1 ? trimmed : trimmed.slice(0, nl)).trim();
    const answer = (nl === -1 ? "" : trimmed.slice(nl + 1)).trim();

    questions++;
    if (!question) errors.push(`${rel}: пустой заголовок вопроса`);
    if (!answer || answer.length < 20) {
      errors.push(`${rel}: пустой или слишком короткий ответ у вопроса "${question.slice(0, 60)}"`);
    }
    const answerOutsideCode = stripCodeBlocks(answer);
    if (/^##\s/m.test(answerOutsideCode)) {
      errors.push(`${rel}: в ответе есть "##" (зарезервировано для вопросов)`);
    }
    if (/^#\s/m.test(answerOutsideCode)) {
      errors.push(`${rel}: в ответе есть "#" (зарезервировано для названия главы)`);
    }
  }
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

function validateChaptersDir(dir, relDir) {
  const chaptersDir = path.join(dir, "chapters");
  let entries;
  try {
    entries = fs.readdirSync(chaptersDir, { withFileTypes: true });
  } catch {
    return 0;
  }
  let count = 0;
  for (const f of entries.filter((e) => e.isFile() && e.name.endsWith(".md")).sort((a, b) => a.name.localeCompare(b.name))) {
    validateChapter(path.join(chaptersDir, f.name), relDir, f.name);
    count++;
  }
  return count;
}

const dirEntries = fs.readdirSync(QUESTIONS_ROOT, { withFileTypes: true });

for (const entry of dirEntries) {
  if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name === "node_modules") continue;
  const dir = path.join(QUESTIONS_ROOT, entry.name);

  if (!SLUG_RE.test(entry.name)) {
    errors.push(`${entry.name}: имя направления не kebab-case`);
  }

  const metaRaw = readSafe(path.join(dir, "meta.json"));
  if (!metaRaw) {
    errors.push(`${entry.name}: отсутствует meta.json`);
    continue;
  }
  let meta;
  try {
    meta = JSON.parse(metaRaw);
  } catch (e) {
    errors.push(`${entry.name}: некорректный meta.json (${e.message})`);
    continue;
  }
  directions++;
  if (!meta.title) errors.push(`${entry.name}: meta.json без title`);

  const techCount = { value: 0 };
  for (const sub of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!sub.isDirectory() || sub.name.startsWith(".") || sub.name === "node_modules") continue;
    if (sub.name === "chapters") continue;
    const techDir = path.join(dir, sub.name);
    const relDir = `${entry.name}/${sub.name}`;

    if (!SLUG_RE.test(sub.name)) {
      errors.push(`${relDir}: имя технологии не kebab-case`);
    }

    const techMetaRaw = readSafe(path.join(techDir, "meta.json"));
    if (!techMetaRaw) {
      errors.push(`${relDir}: отсутствует meta.json (не технология и не глава)`);
      continue;
    }
    let techMeta;
    try {
      techMeta = JSON.parse(techMetaRaw);
    } catch (e) {
      errors.push(`${relDir}: некорректный meta.json (${e.message})`);
      continue;
    }
    technologies++;
    techCount.value++;
    if (!techMeta.title) errors.push(`${relDir}: meta.json без title`);

    const chapterCount = validateChaptersDir(techDir, relDir);
    if (chapterCount === 0) {
      errors.push(`${relDir}: нет ни одной главы в chapters/`);
    }
  }

  // Направление с главами напрямую (hr) должно иметь хотя бы одну главу
  const hasOwnChapters = fs.existsSync(path.join(dir, "chapters"));
  if (hasOwnChapters) {
    const count = validateChaptersDir(dir, entry.name);
    if (techCount.value > 0) {
      warnings.push(`${entry.name}: есть и технологии, и собственные главы — главы направления не показываются в UI`);
    }
    if (count === 0 && techCount.value === 0) {
      errors.push(`${entry.name}: папка chapters/ пуста`);
    }
  } else if (techCount.value === 0) {
    errors.push(`${entry.name}: нет ни технологий, ни собственной папки chapters/`);
  }
}

console.log(`Checked: ${directions} directions, ${technologies} technologies, ${chapters} chapters, ${questions} questions`);
if (warnings.length > 0) {
  console.log(`\nWarnings (${warnings.length}):`);
  warnings.forEach((w) => console.log("  ⚠ " + w));
}
if (errors.length > 0) {
  console.log(`\nErrors (${errors.length}):`);
  errors.forEach((e) => console.log("  ✗ " + e));
  process.exit(1);
} else {
  console.log("All questions valid ✓");
}
