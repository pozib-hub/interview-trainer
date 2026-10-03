#!/usr/bin/env node
// Полный валидатор задач (для CI и локальной проверки):
//   1) структура: у каждой задачи 6 обязательных файлов;
//   2) template.ts синтаксически валиден (TS-парсер);
//   3) контракт «шаблон ↔ тесты»: все имена, импортируемые тестами,
//      экспортируются шаблоном;
//   4) для задач с expectTypeOf: эталон проходит tsc, шаблон — нет
//      (типовые тесты действительно различают верное и неверное решение).
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ts = require(path.join(__dirname, "..", "..", "backend", "runtime", "node_modules", "typescript"));

const TASKS_ROOT = path.join(__dirname, "..", "..", "backend", "tasks");
let problems = 0;

const fail = (id, msg) => {
  console.error(`FAIL ${id}: ${msg}`);
  problems++;
};

function parseTemplate(id, tmplSrc, scriptKind) {
  const sf = ts.createSourceFile("template.ts", tmplSrc, ts.ScriptTarget.ES2022, true, scriptKind);
  const diags = sf.parseDiagnostics || [];
  if (diags.length > 0) {
    const first = diags[0];
    const pos = sf.getLineAndCharacterOfPosition(first.start);
    fail(id, `template.ts не парсится (строка ${pos.line + 1}): ${ts.flattenDiagnosticMessageText(first.messageText, " ")}`.slice(0, 160));
    return false;
  }
  return true;
}

function templateExports(tmplSrc) {
  const exported = new Set();
  const re = /export\s+(?:async\s+)?(?:function\*?|class|const|let|var|type|interface|enum)\s+([A-Za-z0-9_$]+)/g;
  let m;
  while ((m = re.exec(tmplSrc))) exported.add(m[1]);
  const bracesRe = /export\s*\{([^}]+)\}/g;
  while ((m = bracesRe.exec(tmplSrc))) {
    m[1].split(",").forEach((part) => {
      const name = (part.trim().split(/\s+as\s+/).pop() || "").trim();
      if (name) exported.add(name);
    });
  }
  if (/\bexport\s+default\b/.test(tmplSrc)) exported.add("default");
  return exported;
}

function testImports(testSrc) {
  const imported = new Set();
  const re = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+["']\.\.\/solution["']/g;
  let m;
  while ((m = re.exec(testSrc))) {
    m[1].split(",").forEach((part) => {
      const name = part.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0].trim();
      if (name) imported.add(name);
    });
  }
  return imported;
}

// tsc-проверка типовой задачи: эталон должен проходить, шаблон — падать
function typecheckTask(id, dir) {
  const TSC = path.join(__dirname, "..", "..", "backend", "runtime", "node_modules", ".bin", "tsc");
  const RUNTIME_MODULES = path.join(__dirname, "..", "..", "backend", "runtime", "node_modules");
  const out = fs.mkdtempSync(path.join(require("os").tmpdir(), "it-verify-"));
  try {
    fs.mkdirSync(path.join(out, "tests"), { recursive: true });
    fs.symlinkSync(RUNTIME_MODULES, path.join(out, "node_modules"));
    fs.writeFileSync(
      path.join(out, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "bundler",
          strict: true,
          noEmit: true,
          skipLibCheck: true,
        },
      })
    );
    const run = (solutionSrc) => {
      fs.writeFileSync(path.join(out, "solution.ts"), solutionSrc);
      fs.copyFileSync(path.join(dir, "tests", "test.ts"), path.join(out, "tests", "test.ts"));
      try {
        execFileSync(TSC, ["-p", path.join(out, "tsconfig.json")], { stdio: "pipe", cwd: out });
        return 0;
      } catch (e) {
        const m = String(e.stderr || e.stdout || "").match(/error TS/g);
        return m ? m.length : 1;
      }
    };
    const tmplErrors = run(fs.readFileSync(path.join(dir, "template.ts"), "utf8"));
    const refErrors = run(fs.readFileSync(path.join(dir, "solution.ts"), "utf8"));
    if (refErrors > 0) fail(id, `эталон не проходит tsc (${refErrors} ошибок)`);
    if (tmplErrors === 0) fail(id, "типовые тесты не отличают шаблон от верного решения (шаблон проходит tsc)");
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
}

let total = 0;
for (const topic of fs.readdirSync(TASKS_ROOT).sort()) {
  const topicDir = path.join(TASKS_ROOT, topic);
  if (!fs.statSync(topicDir).isDirectory()) continue;
  for (const slug of fs.readdirSync(topicDir).sort()) {
    const dir = path.join(topicDir, slug);
    if (!fs.statSync(dir).isDirectory()) continue;
    const id = `${topic}/${slug}`;
    total++;

    const metaPath = path.join(dir, "meta.json");
    let language = "typescript";
    try {
      language = JSON.parse(fs.readFileSync(metaPath, "utf8")).language || "typescript";
    } catch {}
    const isTsx = language === "tsx";
    const testFileName = isTsx ? "test.tsx" : "test.ts";

    // 1) структура
    for (const f of ["meta.json", "condition.md", "template.ts", "solution.ts", "hints.md", `tests/${testFileName}`]) {
      if (!fs.existsSync(path.join(dir, f))) fail(id, `отсутствует ${f}`);
    }
    const testPath = path.join(dir, "tests", testFileName);
    const tmplPath = path.join(dir, "template.ts");
    if (!fs.existsSync(testPath) || !fs.existsSync(tmplPath)) continue;

    const testSrc = fs.readFileSync(testPath, "utf8");
    const tmplSrc = fs.readFileSync(tmplPath, "utf8");

    // 2) синтаксис шаблона
    if (!parseTemplate(id, tmplSrc, isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS)) continue;

    // 3) контракт импортов
    const imported = testImports(testSrc);
    const exported = templateExports(tmplSrc);
    const missing = [...imported].filter((n) => !exported.has(n));
    if (missing.length > 0) fail(id, `шаблон не экспортирует: ${missing.join(", ")}`);

    // 4) типовые задачи
    if (testSrc.includes("expectTypeOf")) typecheckTask(id, dir);
  }
}

console.log(`\nпроверено задач: ${total}, проблем: ${problems}`);
process.exit(problems > 0 ? 1 : 0);
