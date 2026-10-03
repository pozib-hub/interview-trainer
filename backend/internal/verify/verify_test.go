package verify

import (
	"strings"
	"testing"
)

func TestReport_AllOK(t *testing.T) {
	report := Report([]CheckResult{
		{TaskID: "algorithms/010-foo", OK: true, SolutionText: "2/2", TemplateText: "0/2"},
	})
	for _, want := range []string{"✅ Проверка задач пройдена", "`algorithms/010-foo`", "эталонное решение: 2/2 тестов"} {
		if !strings.Contains(report, want) {
			t.Errorf("отчёт не содержит %q:\n%s", want, report)
		}
	}
}

func TestReport_WithErrors(t *testing.T) {
	report := Report([]CheckResult{
		{TaskID: "algorithms/999-bar", OK: false, Errors: []string{"meta.json: пустой tags", "эталонное решение провалило 1 из 1 тестов"}},
		{TaskID: "algorithms/010-foo", OK: true, SolutionText: "2/2", TemplateText: "0/2"},
	})
	for _, want := range []string{"❌ Проверка задач не пройдена", "meta.json: пустой tags", "эталонное решение провалило", "### ✅ `algorithms/010-foo`"} {
		if !strings.Contains(report, want) {
			t.Errorf("отчёт не содержит %q:\n%s", want, report)
		}
	}
}

func TestReport_Empty(t *testing.T) {
	if report := Report(nil); !strings.Contains(report, "не найдены") {
		t.Errorf("пустой отчёт должен сообщать об отсутствии задач: %s", report)
	}
}

func TestFirstLines(t *testing.T) {
	got := firstLines("a\nb\nc\nd\ne\nf\ng", 3)
	if !strings.Contains(got, "a\nb\nc") || !strings.Contains(got, "…") {
		t.Errorf("firstLines обрезает неверно: %q", got)
	}
	if firstLines("", 3) != "" {
		t.Error("пустой stderr не должен давать блок кода")
	}
}
