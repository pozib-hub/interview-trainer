package proposal

// Input — данные формы предложения новой задачи из UI.
type Input struct {
	Title        string `json:"title"`
	SourceURL    string `json:"sourceUrl"`
	Description  string `json:"description"`
	UserSolution string `json:"userSolution"`
	Notes        string `json:"notes"`
}

// GeneratedTask — структура, которую должна вернуть LLM (см. prompts/task-schema.json).
type GeneratedTask struct {
	Title        string   `json:"title"`
	Topic        string   `json:"topic"`
	Slug         string   `json:"slug"`
	Difficulty   string   `json:"difficulty"`
	Tags         []string `json:"tags"`
	Language     string   `json:"language"`
	Exports      []string `json:"exports"`
	Condition    string   `json:"condition"`
	Examples     []string `json:"examples"`
	Constraints  []string `json:"constraints"`
	TemplateCode string   `json:"templateCode"`
	SolutionCode string   `json:"solutionCode"`
	TestCode     string   `json:"testCode"`
	Hints        []string `json:"hints"`
	Source       *Source  `json:"source"`
}

type Source struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

// TaskFiles — детерминированно собранные файлы задачи.
type TaskFiles struct {
	MetaJSON  string
	Condition string
	Template  string
	Solution  string
	Hints     string
	Test      string
}

// SelfCheck — результат самопроверки сгенерированной задачи через vitest-раннер.
type SelfCheck struct {
	Passed     bool   `json:"passed"`
	Total      int    `json:"total"`
	Failed     int    `json:"failed"`
	DurationMs int64  `json:"durationMs"`
	Stderr     string `json:"stderr,omitempty"`
}

// Result — ответ на POST /api/task-proposal.
type Result struct {
	TaskID    string     `json:"taskId"`
	Topic     string     `json:"topic"`
	Slug      string     `json:"slug"`
	Title     string     `json:"title"`
	PRURL     string     `json:"prUrl"`
	Branch    string     `json:"branch"`
	DryRun    bool       `json:"dryRun"`
	SelfCheck SelfCheck  `json:"selfCheck"`
	Files     TaskFiles  `json:"-"`
}
