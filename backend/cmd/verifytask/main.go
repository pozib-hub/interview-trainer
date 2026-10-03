// verifytask — CLI для проверки задач из PR.
// Используется в CI (GitHub Actions) для валидации pull request'ов
// с задачами: структура + прогон решения и шаблона через vitest.
//
//	./verifytask -tasks ./backend/tasks -runtime ./backend/runtime -ids algorithms/220-foo
package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/runner"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/scanner"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/verify"
)

func main() {
	var (
		tasksDir   = flag.String("tasks", "./backend/tasks", "корневой каталог задач")
		runtimeDir = flag.String("runtime", "./backend/runtime", "каталог node-окружения (с node_modules)")
		nodeBin    = flag.String("node", "node", "бинарь node")
		idsFlag    = flag.String("ids", "", "список ID задач через запятую (тема/NNN-slug); пусто = проверить все")
		timeout    = flag.Duration("timeout", 30*time.Second, "таймаут одного прогона")
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

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(len(taskIDs))*(*timeout)*2+time.Minute)
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
