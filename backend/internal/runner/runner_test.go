package runner

import (
	"context"
	"testing"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

func TestCleanStderr(t *testing.T) {
	in := "(node:123) ExperimentalWarning: Type stripping is an experimental feature\nUse `node --trace-warnings ...` for details\nreal error here\n\n"
	want := "real error here"
	if got := cleanStderr(in); got != want {
		t.Fatalf("cleanStderr() = %q, want %q", got, want)
	}
}

func TestCleanStderrFiltersTypecheckNoise(t *testing.T) {
	in := "Testing types with tsc and vue-tsc is an experimental feature.\nBreaking changes might not follow SemVer, please pin Vitest's version when using it.\nactual error"
	want := "actual error"
	if got := cleanStderr(in); got != want {
		t.Fatalf("cleanStderr() = %q, want %q", got, want)
	}
}

func TestNeedsTypecheck(t *testing.T) {
	cases := []struct {
		name     string
		testFile string
		want     bool
	}{
		{"empty", "", false},
		{"runtime only", `expect(fn()).toBe(1)`, false},
		{"with expectTypeOf", `expectTypeOf<X>().toEqualTypeOf<string>()`, true},
		{"mixed", `expect(fn()).toBe(1);\nexpectTypeOf<X>()`, true},
	}
	for _, tc := range cases {
		if got := needsTypecheck(tc.testFile); got != tc.want {
			t.Errorf("needsTypecheck(%q) = %v, want %v", tc.name, got, tc.want)
		}
	}
}

func TestDedupeAssertions(t *testing.T) {
	suites := []vitestSuite{
		{
			Name: "typecheck",
			AssertionResults: []vitestAssertion{
				{FullName: "tests/test.ts a", Status: "failed", FailureMessages: []string{"Type 'number' does not satisfy the constraint 'never'."}},
				{FullName: "tests/test.ts b", Status: "passed"},
			},
		},
		{
			Name: "runtime",
			AssertionResults: []vitestAssertion{
				{FullName: "a", Status: "passed"},
				{FullName: "b", Status: "passed"},
			},
		},
	}
	got := dedupeAssertions(suites)
	if len(got) != 2 {
		t.Fatalf("dedupeAssertions() len = %d, want 2", len(got))
	}
	if got[0].Status != "failed" {
		t.Errorf("duplicate with diverged statuses must keep failed, got %q", got[0].Status)
	}
	if got[0].FullName != "tests/test.ts a" {
		t.Errorf("must keep the fullName with file prefix, got %q", got[0].FullName)
	}
	if got[0].FailureMessages == nil {
		t.Error("failureMessages must be preserved for typecheck failures")
	}
}

func TestDedupeAssertionsNoDuplicates(t *testing.T) {
	suites := []vitestSuite{
		{
			Name: "runtime",
			AssertionResults: []vitestAssertion{
				{FullName: "tests/test.ts a", Status: "passed"},
				{FullName: "tests/test.ts b", Status: "failed", Errors: []vitestError{{Message: "boom"}}},
			},
		},
	}
	got := dedupeAssertions(suites)
	if len(got) != 2 || got[0].Status != "passed" || got[1].Status != "failed" {
		t.Fatalf("dedupeAssertions() = %+v", got)
	}
}

func TestRunTaskNotFoundInScanner(t *testing.T) {
	r, err := NewVitestRunner("node", t.TempDir(), 0)
	if err != nil {
		t.Fatalf("NewVitestRunner: %v", err)
	}
	result := r.Run(context.Background(), domain.TaskFull{TaskSummary: domain.TaskSummary{ID: "x"}}, "code")
	if result.Passed {
		t.Fatal("empty task must not pass")
	}
	if result.Stderr == "" {
		t.Fatal("expected stderr for failed run")
	}
}
