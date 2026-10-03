package scanner

import "testing"

func TestSplitHints(t *testing.T) {
	tests := []struct {
		name string
		in   string
		want []string
	}{
		{"empty", "", []string{}},
		{"whitespace", "   \n  ", []string{}},
		{"single", "## Подсказка 1\nтекст", []string{"Подсказка 1\nтекст"}},
		{
			"multiple",
			"## Подсказка 1\nпервая\n\n## Подсказка 2\nвторая",
			[]string{"Подсказка 1\nпервая", "Подсказка 2\nвторая"},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := splitHints(tt.in)
			if len(got) != len(tt.want) {
				t.Fatalf("splitHints(%q) = %q, want %q", tt.in, got, tt.want)
			}
			for i := range got {
				if got[i] != tt.want[i] {
					t.Errorf("splitHints(%q)[%d] = %q, want %q", tt.in, i, got[i], tt.want[i])
				}
			}
		})
	}
}

func TestResolveTaskID(t *testing.T) {
	s := New(t.TempDir())
	tests := []struct {
		in   string
		want bool
	}{
		{"topic/slug", true},
		{"", false},
		{"../etc/passwd", false},
		{"/etc/passwd", false},
		{"topic/../../etc", false},
	}
	for _, tt := range tests {
		if _, ok := s.resolveTaskID(tt.in); ok != tt.want {
			t.Errorf("resolveTaskID(%q) ok = %v, want %v", tt.in, !tt.want, tt.want)
		}
	}
}
