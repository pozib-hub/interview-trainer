package runner

import (
	"bytes"
	"context"
	_ "embed"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

//go:embed worker.mjs
var workerSrc string

const maxParallelRuns = 4

type VitestRunner struct {
	nodeBin    string
	runtimeDir string
	timeout    time.Duration
	workerPath string
	sem        chan struct{}
}

func NewVitestRunner(nodeBin, runtimeDir string, timeout time.Duration) (*VitestRunner, error) {
	absRuntimeDir, err := filepath.Abs(runtimeDir)
	if err != nil {
		return nil, fmt.Errorf("resolve runtime dir: %w", err)
	}
	if err := os.MkdirAll(absRuntimeDir, 0o755); err != nil {
		return nil, fmt.Errorf("create runtime dir: %w", err)
	}
	workerPath := filepath.Join(absRuntimeDir, "worker.mjs")
	if err := os.WriteFile(workerPath, []byte(workerSrc), 0o644); err != nil {
		return nil, fmt.Errorf("write vitest worker: %w", err)
	}
	return &VitestRunner{
		nodeBin:    nodeBin,
		runtimeDir: absRuntimeDir,
		timeout:    timeout,
		workerPath: workerPath,
		sem:        make(chan struct{}, maxParallelRuns),
	}, nil
}

type vitestError struct {
	Message string `json:"message"`
}

type vitestAssertion struct {
	FullName        string        `json:"fullName"`
	Status          string        `json:"status"`
	Errors          []vitestError `json:"errors"`
	FailureMessages []string      `json:"failureMessages"`
}

type vitestSuite struct {
	Name             string            `json:"name"`
	Status           string            `json:"status"`
	Message          string            `json:"message"`
	AssertionResults []vitestAssertion `json:"assertionResults"`
}

type vitestJSON struct {
	NumTotalTests  int           `json:"numTotalTests"`
	NumPassedTests int           `json:"numPassedTests"`
	NumFailedTests int           `json:"numFailedTests"`
	TestResults    []vitestSuite `json:"testResults"`
}

var stderrNoise = regexp.MustCompile("ExperimentalWarning|Use `node --trace-warnings|^\\s*\\(node:\\d+\\)\\s*$|Testing types with tsc|Breaking changes might not follow SemVer")

func cleanStderr(stderr string) string {
	lines := strings.Split(stderr, "\n")
	kept := make([]string, 0, len(lines))
	for _, l := range lines {
		if !stderrNoise.MatchString(l) {
			kept = append(kept, l)
		}
	}
	return strings.TrimSpace(strings.Join(kept, "\n"))
}

func (r *VitestRunner) Run(ctx context.Context, task domain.TaskFull, userCode string) domain.RunResult {
	start := time.Now()
	r.sem <- struct{}{}
	defer func() { <-r.sem }()

	tmpDir, err := os.MkdirTemp("", "it-run-")
	if err != nil {
		return domain.RunResult{
			TaskID:     task.ID,
			Passed:     false,
			Assertions: []domain.TestAssertion{},
			Stderr:     "Не удалось создать временную директорию: " + err.Error(),
			DurationMs: time.Since(start).Milliseconds(),
		}
	}
	defer os.RemoveAll(tmpDir)

	ext := ".ts"
	testFileName := "test.ts"
	switch task.Language {
	case domain.LanguageJavaScript:
		ext = ".js"
	case domain.LanguageTypeScriptReact:
		ext = ".tsx"
		testFileName = "test.tsx"
	}

	testsDir := filepath.Join(tmpDir, "tests")
	if err := os.MkdirAll(testsDir, 0o755); err != nil {
		return domain.RunResult{
			TaskID:     task.ID,
			Passed:     false,
			Assertions: []domain.TestAssertion{},
			Stderr:     "Не удалось создать директорию тестов: " + err.Error(),
			DurationMs: time.Since(start).Milliseconds(),
		}
	}
	if err := os.WriteFile(filepath.Join(tmpDir, "solution"+ext), []byte(userCode), 0o644); err != nil {
		return domain.RunResult{
			TaskID:     task.ID,
			Passed:     false,
			Assertions: []domain.TestAssertion{},
			Stderr:     "Не удалось записать решение: " + err.Error(),
			DurationMs: time.Since(start).Milliseconds(),
		}
	}
	if err := os.WriteFile(filepath.Join(testsDir, testFileName), []byte(task.TestFile), 0o644); err != nil {
		return domain.RunResult{
			TaskID:     task.ID,
			Passed:     false,
			Assertions: []domain.TestAssertion{},
			Stderr:     "Не удалось записать тесты: " + err.Error(),
			DurationMs: time.Since(start).Milliseconds(),
		}
	}

	mode := "run"
	if needsTypecheck(task.TestFile) {
		mode = "typecheck"
	}
	if err := r.linkRuntimeModules(tmpDir); err != nil {
		return domain.RunResult{
			TaskID:     task.ID,
			Passed:     false,
			Assertions: []domain.TestAssertion{},
			Stderr:     "Не удалось подключить модули runtime: " + err.Error(),
			DurationMs: time.Since(start).Milliseconds(),
		}
	}
	if mode == "typecheck" {
		if err := r.writeTypecheckTsconfig(tmpDir); err != nil {
			return domain.RunResult{
				TaskID:     task.ID,
				Passed:     false,
				Assertions: []domain.TestAssertion{},
				Stderr:     "Не удалось подготовить typecheck-окружение: " + err.Error(),
				DurationMs: time.Since(start).Milliseconds(),
			}
		}
	}

	runCtx, cancel := context.WithTimeout(ctx, r.timeout)
	defer cancel()

	cmd := exec.CommandContext(runCtx, r.nodeBin,
		"--experimental-strip-types",
		"--disable-warning=ExperimentalWarning",
		r.workerPath,
		tmpDir,
		mode,
		filepath.ToSlash(filepath.Join("tests", testFileName)),
	)
	cmd.Dir = r.runtimeDir
	cmd.Env = sandboxEnv()

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	runErr := cmd.Run()

	result := domain.RunResult{
		TaskID:     task.ID,
		Assertions: []domain.TestAssertion{},
		Stdout:     "",
		DurationMs: time.Since(start).Milliseconds(),
	}

	if runErr != nil && runCtx.Err() == context.DeadlineExceeded {
		result.Stderr = fmt.Sprintf("Превышен лимит времени исполнения (%s)", r.timeout)
		return result
	}

	parsed, parseErr := parseVitestResult(tmpDir, stdout.String())
	var suiteDiagnostics []string
	if parseErr == nil {
		for _, a := range dedupeAssertions(parsed.TestResults) {
			result.Total++
			passed := a.Status == "passed"
			if !passed {
				result.Failed++
			}
			assertion := domain.TestAssertion{Name: a.FullName, Passed: passed}
			if !passed {
				if len(a.Errors) > 0 && a.Errors[0].Message != "" {
					assertion.Message = strings.SplitN(a.Errors[0].Message, "\n", 2)[0]
				} else if len(a.FailureMessages) > 0 {
					assertion.Message = strings.SplitN(a.FailureMessages[0], "\n", 2)[0]
				}
			}
			result.Assertions = append(result.Assertions, assertion)
		}
		suiteDiagnostics = collectSuiteDiagnostics(tmpDir, parsed.TestResults)
	}

	clean := cleanStderr(stderr.String())
	var launchErr string
	if runErr != nil {
		launchErr = "Ошибка запуска: " + runErr.Error()
	}
	switch {
	case parseErr == nil && result.Total > 0:
		// Тесты реально прогнались: exit code 1 означает просто упавшие тесты,
		// это не ошибка запуска — показываем только stderr процесса, если он есть.
		result.Stderr = clean
	case parseErr == nil && len(suiteDiagnostics) > 0:
		// Тесты не смогли запуститься (например, синтаксическая ошибка в решении):
		// vitest кладёт диагностику в message suite-а с нулём ассертов.
		result.Stderr = strings.Join(suiteDiagnostics, "\n")
	case parseErr == nil:
		if clean != "" {
			result.Stderr = clean
		} else {
			result.Stderr = launchErr
		}
	case clean != "":
		result.Stderr = clean
	case launchErr != "":
		result.Stderr = launchErr
	default:
		result.Stderr = strings.TrimSpace(stdout.String())
		if len(result.Stderr) > 500 {
			result.Stderr = result.Stderr[:500]
		}
	}
	result.Passed = result.Failed == 0 && result.Total > 0
	return result
}

func needsTypecheck(testFile string) bool {
	return strings.Contains(testFile, "expectTypeOf")
}

// sandboxEnv — минимальное окружение node-раннера. Пользовательский код
// исполняется в этом процессе, поэтому окружение сервера (DATABASE_URL,
// LLM_API_KEY, GITHUB_TOKEN и прочие переменные os.Environ()) ему недоступно.
func sandboxEnv() []string {
	keep := map[string]bool{
		"PATH":   true,
		"HOME":   true,
		"TMPDIR": true,
		"LANG":   true,
		"LC_ALL": true,
		"TZ":     true,
	}
	env := make([]string, 0, len(keep)+1)
	for _, kv := range os.Environ() {
		if i := strings.IndexByte(kv, '='); i > 0 && keep[kv[:i]] {
			env = append(env, kv)
		}
	}
	return append(env, "NODE_NO_WARNINGS=1")
}

// linkRuntimeModules создаёт симлинк node_modules в tmpDir, чтобы решение и тесты
// могли резолвить пакеты runtime (vitest, react, @testing-library и т.д.).
func (r *VitestRunner) linkRuntimeModules(tmpDir string) error {
	runtimeModules := filepath.Join(r.runtimeDir, "node_modules")
	link := filepath.Join(tmpDir, "node_modules")
	if _, err := os.Lstat(link); err == nil {
		return nil
	}
	if err := os.Symlink(runtimeModules, link); err != nil {
		return fmt.Errorf("symlink node_modules: %w", err)
	}
	return nil
}

// writeTypecheckTsconfig создаёт tsconfig.json в tmpDir,
// чтобы vitest typecheck-режим мог запустить tsc над solution + tests.
func (r *VitestRunner) writeTypecheckTsconfig(tmpDir string) error {
	tsconfig := `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["solution.ts", "solution.tsx", "solution.js", "tests/**/*.ts", "tests/**/*.tsx"]
}
`
	if err := os.WriteFile(filepath.Join(tmpDir, "tsconfig.json"), []byte(tsconfig), 0o644); err != nil {
		return fmt.Errorf("write tsconfig: %w", err)
	}
	return nil
}

// dedupeAssertions схлопывает дубли ассертов с одинаковым именем теста.
// В typecheck-режиме vitest прогоняет файл дважды (runtime + typecheck),
// при этом fullName одной из версий может не иметь префикса "tests/test.ts ":
// при расхождении статусов оставляем проваленный.
func dedupeAssertions(suites []vitestSuite) []vitestAssertion {
	byName := make(map[string]int)
	out := make([]vitestAssertion, 0, 16)
	for _, tr := range suites {
		for _, a := range tr.AssertionResults {
			key := assertionKey(a.FullName)
			if idx, ok := byName[key]; ok {
				if a.Status != "passed" {
					out[idx] = a
				}
				continue
			}
			byName[key] = len(out)
			out = append(out, a)
		}
	}
	return out
}

func assertionKey(fullName string) string {
	for _, prefix := range []string{"tests/test.ts ", "tests/test.tsx ", "tests/test.js "} {
		fullName = strings.TrimPrefix(fullName, prefix)
	}
	return fullName
}

// collectSuiteDiagnostics возвращает сообщения suite-ов без ассертов
// (например, "Transform failed" при синтаксической ошибке в решении),
// с заменой tmp-путей на короткие имена файлов.
func collectSuiteDiagnostics(tmpDir string, suites []vitestSuite) []string {
	var out []string
	for _, tr := range suites {
		if tr.Message == "" || len(tr.AssertionResults) > 0 {
			continue
		}
		msg := strings.ReplaceAll(tr.Message, tmpDir+string(filepath.Separator), "")
		msg = strings.TrimSpace(msg)
		if msg != "" {
			out = append(out, msg)
		}
	}
	return out
}

func parseVitestResult(tmpDir, stdout string) (vitestJSON, error) {
	var parsed vitestJSON
	if raw, err := os.ReadFile(filepath.Join(tmpDir, "result.json")); err == nil {
		if err := json.Unmarshal(raw, &parsed); err == nil {
			return parsed, nil
		}
	}
	jsonStart := strings.Index(stdout, "{")
	if jsonStart >= 0 {
		if err := json.Unmarshal([]byte(stdout[jsonStart:]), &parsed); err == nil {
			return parsed, nil
		}
	}
	return parsed, fmt.Errorf("vitest result not found")
}
