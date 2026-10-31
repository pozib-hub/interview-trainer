// Package hint — интерактивные подсказки от ИИ в ходе решения задачи.
// Пользователь нажимает «Подсказка» столько раз, сколько нужно: каждая
// следующая подсказка опирается на текущий код, результаты тестов и
// все предыдущие подсказки и подталкивает к самостоятельному решению.
package hint

import (
	"context"
	"fmt"
	"strings"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/proposal"
)

// LLMChat — минимальный интерфейс LLM (реализация *proposal.LLMClient).
type LLMChat interface {
	ChatRaw(ctx context.Context, system, user string) (string, error)
}

// TaskSource — источник задач (реализация *scanner.Scanner).
type TaskSource interface {
	GetTask(id string) (domain.TaskFull, bool)
}

// TaskRunner — витес-раннер (реализация *runner.VitestRunner).
type TaskRunner interface {
	Run(ctx context.Context, task domain.TaskFull, userCode string) domain.RunResult
}

// Service выдаёт подсказки по ходу решения.
type Service struct {
	LLM   LLMChat
	Tasks TaskSource
	Run   TaskRunner
	Mock  bool
}

// Request — запрос подсказки из UI.
type Request struct {
	TaskID        string   `json:"taskId"`
	Code          string   `json:"code"`
	PreviousHints []string `json:"previousHints"`
}

// Response — подсказка для UI.
type Response struct {
	Hint string `json:"hint"`
}

const systemPrompt = `Ты — наставник на техническом собеседовании. Пользователь решает задачу в тренажёре и попросил подсказку.

Главные правила:
1. НИКОГДА не выдавай полное или почти полное рабочее решение. Не пиши код задачи за пользователя.
2. Подталкивай к самостоятельному решению: направление мысли, что проверить, какая идея или подход поможет, на что обратить внимание.
3. Опирайся на текущий код пользователя: отметь, что уже сделано правильно, и где именно (какая строка/место/функция) проблема или чего не хватает.
4. Нарастающая конкретность: чем больше подсказок уже получено, тем конкретнее можно быть. Разрешён маленький фрагмент-намёк (1–3 строки ключевой идеи, псевдокод), но не готовое решение.
5. Никогда не повторяй уже выданные подсказки — иди дальше по пути к решению.
6. Если судя по результатам тестов задача уже решена — поздравь и скажи, что подсказка не нужна.
7. Отвечай кратко: 3–6 предложений, на русском, без заголовков и списков из одного пункта. Обращайся на «ты».`

// Ask возвращает следующую подсказку для задачи и текущего кода пользователя.
func (s *Service) Ask(ctx context.Context, req Request) (*Response, error) {
	task, ok := s.Tasks.GetTask(req.TaskID)
	if !ok {
		return nil, fmt.Errorf("задача не найдена")
	}

	// Прогоняем код через тесты: ИИ видит, что именно проваливается.
	run := s.Run.Run(ctx, task, req.Code)

	if s.Mock {
		return &Response{Hint: mockHint(len(req.PreviousHints), run)}, nil
	}

	user := buildUserPrompt(task, req.Code, run, req.PreviousHints)
	text, err := s.LLM.ChatRaw(ctx, systemPrompt, user)
	if err != nil {
		return nil, fmt.Errorf("%s", proposal.FriendlyLLMError(err))
	}
	hint := strings.TrimSpace(text)
	if hint == "" {
		return nil, fmt.Errorf("ИИ вернул пустую подсказку")
	}
	return &Response{Hint: hint}, nil
}

func buildUserPrompt(task domain.TaskFull, code string, run domain.RunResult, previousHints []string) string {
	var sb strings.Builder
	fmt.Fprintf(&sb, "# Задача: %s\n\n%s\n\n", task.Title, task.Condition)

	fmt.Fprintf(&sb, "# Код пользователя (текущее состояние)\n```ts\n%s\n```\n\n", code)

	fmt.Fprintf(&sb, "# Результат запуска тестов\n%s\n\n", RunSummary(run))

	fmt.Fprintf(&sb, "# Эталонное решение (только для твоего понимания — НИКОГДА не выдавай его и не пересказывай близко к тексту)\n```ts\n%s\n```\n\n", task.Solution)

	if len(previousHints) > 0 {
		sb.WriteString("# Подсказки, которые уже выданы (не повторяй их — двигайся дальше)\n")
		for i, h := range previousHints {
			fmt.Fprintf(&sb, "%d. %s\n", i+1, h)
		}
		sb.WriteString("\n")
	}

	sb.WriteString("Дай следующую подсказку по правилам системы.")
	return sb.String()
}

// RunSummary — компактное описание результата прогона для промпта.
func RunSummary(run domain.RunResult) string {
	passed := run.Total - run.Failed
	if run.Total == 0 {
		return fmt.Sprintf("Тесты не запустились (вероятно, ошибка компиляции). stderr:\n%s", head(run.Stderr, 5))
	}
	if run.Failed == 0 {
		return fmt.Sprintf("Все тесты пройдены: %d из %d.", passed, run.Total)
	}
	var sb strings.Builder
	fmt.Fprintf(&sb, "Пройдено %d из %d. Провалены:", passed, run.Total)
	for _, a := range run.Assertions {
		if !a.Passed {
			msg := a.Message
			if i := strings.IndexByte(msg, '\n'); i > 0 {
				msg = msg[:i]
			}
			fmt.Fprintf(&sb, "\n- «%s»: %s", a.Name, strings.TrimSpace(msg))
		}
	}
	return sb.String()
}

func head(s string, n int) string {
	if s == "" {
		return "(пусто)"
	}
	lines := strings.Split(strings.TrimRight(s, "\n"), "\n")
	if len(lines) > n {
		lines = append(lines[:n], "…")
	}
	return strings.Join(lines, "\n")
}

// mockHint — заготовленные подсказки для dev-режима (LLM_MOCK=true).
func mockHint(n int, run domain.RunResult) string {
	hints := []string{
		"Начни с самого простого: выпиши, что дано и что нужно вернуть. Подумай, какой структурой удобно воспользоваться для быстрого поиска.",
		"Посмотри внимательно на цикл: ты обрабатываешь не все случаи. Проверь, что происходит на границах (первый и последний элемент).",
		"Ключевая идея: вместо вложенного перебора запоминай уже встреченные элементы в объекте — тогда проверка станет мгновенной.",
		"Ты почти у цели: проверь, что возвращаешь именно то, что требует условие (формат результата), и не забудь крайний случай пустого входа.",
	}
	return fmt.Sprintf("[мок-подсказка #%d] %s", n+1, hints[n%len(hints)])
}
