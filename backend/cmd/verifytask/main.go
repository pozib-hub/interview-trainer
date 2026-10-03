// verifytask — CLI для проверки задач из PR.
// Используется в CI (GitHub Actions) для валидации pull request'ов
// с задачами: структура + прогон решения и шаблона через vitest +
// семантическое ИИ-ревью (условие ↔ тесты ↔ решение).
//
//	./verifytask -tasks ./backend/tasks -runtime ./backend/runtime -ids algorithms/220-foo
//
// ИИ-ревью включается автоматически, если задан LLM_API_KEY (или -llm-mock).
// Переменные окружения (как в прошлом проекте):
// LLM_API_KEY || DEEPSEEK_API_KEY || OPENAI_API_KEY, LLM_BASE_URL,
// LLM_MODEL, LLM_TIMEOUT_MS, LLM_MAX_RETRIES, LLM_MOCK.
package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/proposal"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/runner"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/scanner"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/verify")

func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func envInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return def
}

// envAPIKey — цепочка как в прошлом проекте: LLM_API_KEY || DEEPSEEK_API_KEY || OPENAI_API_KEY.
func envAPIKey() string {
	for _, key := range []string{"LLM_API_KEY", "DEEPSEEK_API_KEY", "OPENAI_API_KEY"} {
		if v := os.Getenv(key); v != "" {
			return v
		}
	}
	return ""
}

func main() {
	var (
		tasksDir   = flag.String("tasks", "./backend/tasks", "корневой каталог задач")
		runtimeDir = flag.String("runtime", "./backend/runtime", "каталог node-окружения (с node_modules)")
		nodeBin    = flag.String("node", "node", "бинарь node")
		idsFlag    = flag.String("ids", "", "список ID задач через запятую (тема/NNN-slug)")
		timeout    = flag.Duration("timeout", 30*time.Second, "таймаут одного прогона")

		llmAPIKey    = flag.String("llm-api-key", envAPIKey(), "API-ключ LLM (env LLM_API_KEY/DEEPSEEK_API_KEY/OPENAI_API_KEY)")
		llmBaseURL   = flag.String("llm-base-url", env("LLM_BASE_URL", "https://api.deepseek.com/v1"), "base URL LLM (env LLM_BASE_URL)")
		llmModel     = flag.String("llm-model", env("LLM_MODEL", "deepseek-chat"), "модель LLM (env LLM_MODEL)")
		llmTimeoutMS = flag.Int("llm-timeout-ms", envInt("LLM_TIMEOUT_MS", 90000), "таймаут LLM, мс (env LLM_TIMEOUT_MS)")
		llmRetries   = flag.Int("llm-max-retries", envInt("LLM_MAX_RETRIES", 2), "ретраи LLM (env LLM_MAX_RETRIES)")
		llmMock      = flag.Bool("llm-mock", env("LLM_MOCK", "") == "true", "мок ИИ-ревью без реального LLM")
		noAI         = flag.Bool("no-ai", false, "отключить ИИ-ревью задач")
	)
	flag.Parse()

	taskIDs := splitIDs(*idsFlag)
	if len(taskIDs) == 0 {
		fmt.Fprintln(os.Stderr, "не заданы ID задач для проверки (-ids)")
		os.Exit(2)
	}

	codeRunner, err := runner.NewVitestRunner(*nodeBin, *runtimeDir, *timeout)
	if err != nil {
		fmt.Fprintln(os.Stderr, "раннер:", err)
		os.Exit(2)
	}

	checker := verify.NewChecker(scanner.New(*tasksDir), codeRunner, *timeout)

	if !*noAI && (*llmMock || *llmAPIKey != "") {
		if *llmMock {
			checker.LLMMock = true
			fmt.Fprintln(os.Stderr, "ИИ-ревью: мок")
		} else {
			checker.LLM = proposal.NewLLMClient(*llmBaseURL, *llmModel, *llmAPIKey,
				time.Duration(*llmTimeoutMS)*time.Millisecond, *llmRetries)
			fmt.Fprintf(os.Stderr, "ИИ-ревью: %s (%s)\n", *llmModel, *llmBaseURL)
		}
	} else {
		fmt.Fprintln(os.Stderr, "ИИ-ревью пропущено (LLM_API_KEY не задан или -no-ai)")
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(len(taskIDs))*(*timeout)*3+3*time.Minute)
	defer cancel()

	results := checker.CheckAll(ctx, taskIDs)

	report := verify.Report(results)
	fmt.Print(report)

	for _, r := range results {
		if !r.OK {
			os.Exit(1)
		}
	}
}

func splitIDs(s string) []string {
	var ids []string
	for _, part := range strings.Split(s, ",") {
		if id := strings.TrimSpace(part); id != "" {
			ids = append(ids, id)
		}
	}
	return ids
}
