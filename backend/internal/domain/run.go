package domain

type TestAssertion struct {
	Name    string `json:"name"`
	Passed  bool   `json:"passed"`
	Message string `json:"message,omitempty"`
}

type RunResult struct {
	TaskID     string          `json:"taskId"`
	Passed     bool            `json:"passed"`
	Total      int             `json:"total"`
	Failed     int             `json:"failed"`
	Assertions []TestAssertion `json:"assertions"`
	Stdout     string          `json:"stdout"`
	Stderr     string          `json:"stderr"`
	DurationMs int64           `json:"durationMs"`
}
