#!/usr/bin/env node
// Проверяет контракт «шаблон ↔ тесты»: все имена, импортируемые тестами
// из ../solution, должны экспортироваться template.ts.
// Плюс: template.ts обязан быть синтаксически валидным.
const fs = require("fs");
const path = require("path");
const ts = require(path.join(__dirname, "..", "..", "backend", "runtime", "node_modules", "typescript"));

const TASKS_ROOT = path.join(__dirname, "..", "..", "backend", "tasks");
const problems = [];

for (const topic of fs.readdirSync(TASKS_ROOT).sort()) {
  const topicDir = path.join(TASKS_ROOT, topic);
  if (!fs.statSync(topicDir).isDirectory()) continue;
  for (const slug of fs.readdirSync(topicDir).sort()) {
    const dir = path.join(topicDir, slug);
    if (!fs.statSync(dir).isDirectory()) continue;
    const id = `${topic}/${slug}`;
    const metaPath = path.join(dir, "meta.json");
    let language = "typescript";
    try {
      language = JSON.parse(fs.readFileSync(metaPath, "utf8")).language || "typescript";
    } catch {}
    const testFile = path.join(dir, "tests", language === "tsx" ? "test.tsx" : "test.ts");
    const templateFile = path.join(dir, "template.ts");
    if (!fs.existsSync(testFile) || !fs.existsSync(templateFile)) continue;

    const testSrc = fs.readFileSync(testFile, "utf8");
    const tmplSrc = fs.readFileSync(templateFile, "utf8");

    // имена, импортируемые из ../solution (значения и типы)
    const imported = new Set();
    const re = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+["']\.\.\/solution["']/g;
    let m;
    while ((m = re.exec(testSrc))) {
      m[1].split(",").forEach((part) => {
        const name = part.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0].trim();
        if (name) imported.add(name);
      });
    }
    const sideEffectOnly = /import\s+["']\.\.\/solution["']/.test(testSrc);
    if (imported.size === 0 && !sideEffectOnly) continue;

    // экспорты шаблона
    const exported = new Set();
    const exportRe =
      /export\s+(?:async\s+)?(?:function\*?|class|const|let|var|type|interface|enum)\s+([A-Za-z0-9_$]+)/g;
    while ((m = exportRe.exec(tmplSrc))) exported.add(m[1]);
    // export { a, b }
    const bracesRe = /export\s*\{([^}]+)\}/g;
    while ((m = bracesRe.exec(tmplSrc))) {
      m[1].split(",").forEach((part) => {
        const name = (part.trim().split(/\s+as\s+/).pop() || "").trim();
        if (name) exported.add(name);
      });
    }
    if (/\bexport\s+default\b/.test(tmplSrc)) exported.add("default");

    const missing = [...imported].filter((n) => !exported.has(n));
    if (missing.length > 0) {
      problems.push({ id, missing, kind: "missing-exports" });
    }

    // синтаксис шаблона (TS-парсер: declare global валиден; для tsx — JSX-режим)
    const sf = ts.createSourceFile("template.ts", tmplSrc, ts.ScriptTarget.ES2022, true, language === "tsx" ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const parseDiags = sf.parseDiagnostics || [];
    if (parseDiags.length > 0) {
      const first = parseDiags[0];
      const pos = sf.getLineAndCharacterOfPosition(first.start);
      problems.push({
        id,
        missing: [],
        kind: "syntax",
        error: `line ${pos.line + 1}: ${ts.flattenDiagnosticMessageText(first.messageText, " ")}`.slice(0, 120),
      });
    }
  }
}

for (const p of problems) {
  if (p.kind === "syntax") console.log(`SYNTAX  ${p.id}: ${p.error}`);
  else console.log(`MISSING ${p.id}: ${p.missing.join(", ")}`);
}
console.log(`\ntotal problems: ${problems.length}`);
