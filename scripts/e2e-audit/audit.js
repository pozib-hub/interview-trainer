// Playwright E2E audit driver.
// Usage: node audit.js <plan.json> [outPrefix]
// plan.json: [{ id, solution (path to my solution file) }]
// For each task: open via UI, verify condition renders, paste solution, run, record;
// then paste the original template (broken check), run, record.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.AUDIT_BASE_URL || 'http://localhost:3000';
const TASKS_ROOT = path.join(__dirname, '..', '..', 'backend', 'tasks');
const OUT_DIR = path.join(__dirname, 'results');
const SHOTS = path.join(__dirname, 'shots');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(SHOTS, { recursive: true });

const planFile = process.argv[2];
const outPrefix = process.argv[3] || 'run';
const plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));
const resultsFile = path.join(OUT_DIR, `${outPrefix}.jsonl`);

function safe(id) { return id.replace(/[^A-Za-z0-9._-]/g, '_'); }

async function runTask(page, task, code, phase, rec) {
  const url = `${BASE}/tasks/${task.id}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  // wait for editor to be ready
  const editor = page.locator('.monaco-editor textarea').first();
  await editor.waitFor({ state: 'visible', timeout: 30000 });
  await page.waitForTimeout(300);

  // condition panel sanity (only for phase 'mine')
  if (phase === 'mine') {
    const cond = await page.textContent('.LeftPane').catch(() => '');
    rec.conditionLength = (cond || '').trim().length;
  }

  // put code into monaco: click editor area, select all, paste via clipboard
  const editorBox = page.locator('.monaco-editor').first();
  await editorBox.click({ position: { x: 200, y: 200 } });
  await page.keyboard.press('Meta+a');
  await page.evaluate(t => navigator.clipboard.writeText(t), code);
  await page.keyboard.press('Meta+v');
  await page.waitForTimeout(400);

  // verify the code actually got into the editor
  const editorText = await page.evaluate(() => {
    const lines = Array.from(document.querySelectorAll('.view-lines .view-line'));
    return lines.map(l => l.textContent).join('\n');
  });
  const codeHead = code.split('\n')[0].trim().slice(0, 25);
  rec.editorGotCode = editorText.includes(codeHead.slice(0, 12)) || editorText.length > 5;

  // run tests
  const runBtn = page.getByRole('button', { name: /Запустить тесты/ });
  await runBtn.click();

  // wait for result summary
  let summaryText = null;
  try {
    await page.waitForFunction(
      () => /Все тесты пройдены|Провалено/.test(document.body.innerText),
      { timeout: 90000 }
    );
    const info = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('[class*="esultsSummary"]')).pop();
      return el ? el.innerText : null;
    });
    summaryText = info ? info.replace(/\s+/g, ' ').trim() : null;
  } catch (e) {
    rec.error = 'timeout waiting for result';
    await page.screenshot({ path: path.join(SHOTS, `${safe(task.id)}_${phase}_timeout.png`) });
    return;
  }
  rec.summary = summaryText;
  rec.passed = summaryText ? summaryText.includes('Все тесты пройдены') : false;

  // assertions detail
  const items = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[class*="esultItem"]')).map(e => ({
      name: (e.textContent || '').slice(0, 250),
      failed: /Failed/.test(e.className),
    }));
  });
  rec.assertions = items.map(i => ({ name: i.name, failed: i.failed }));
  rec.failedCount = items.filter(i => i.failed).length;
  await page.waitForTimeout(200);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  const page = await context.newPage();

  for (const task of plan) {
    const solPath = task.solution;
    if (!fs.existsSync(solPath)) {
      fs.appendFileSync(resultsFile, JSON.stringify({ id: task.id, error: 'solution file missing: ' + solPath }) + '\n');
      console.log(`SKIP ${task.id} — no solution file`);
      continue;
    }
    const myCode = fs.readFileSync(solPath, 'utf8');
    const tmplPath = path.join(TASKS_ROOT, task.id, 'template.ts');
    const tmplCode = fs.existsSync(tmplPath) ? fs.readFileSync(tmplPath, 'utf8') : '';

    const rec = { id: task.id, ts: new Date().toISOString() };
    try {
      await runTask(page, task, myCode, 'mine', rec);
      if (tmplCode && !rec.error) {
        const rec2 = { id: task.id, phase: 'template', ts: new Date().toISOString() };
        await runTask(page, task, tmplCode, 'template', rec2);
        rec.templatePassed = rec2.passed;
        rec.templateSummary = rec2.summary;
        if (rec2.passed) {
          await page.screenshot({ path: path.join(SHOTS, `${safe(task.id)}_template_pass.png`) });
        }
      } else if (!tmplCode) {
        rec.templateMissing = true;
      }
    } catch (e) {
      rec.error = String(e && e.message || e).slice(0, 500);
      try { await page.screenshot({ path: path.join(SHOTS, `${safe(task.id)}_error.png`) }); } catch {}
    }
    fs.appendFileSync(resultsFile, JSON.stringify(rec) + '\n');
    console.log(`${rec.passed ? 'PASS' : (rec.error ? 'ERR ' : 'FAIL')} ${task.id} ${rec.summary || ''} ${rec.templatePassed ? '| TEMPLATE-PASSES(!)' : ''}`);
  }

  await browser.close();
  console.log('DONE');
})().catch(e => { console.error(e); process.exit(1); });
