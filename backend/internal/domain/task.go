package domain

type Difficulty string

const (
	DifficultyEasy   Difficulty = "easy"
	DifficultyMedium Difficulty = "medium"
	DifficultyHard   Difficulty = "hard"
)

type TaskLanguage string

const (
	LanguageTypeScript      TaskLanguage = "typescript"
	LanguageTypeScriptReact TaskLanguage = "tsx"
	LanguageJavaScript      TaskLanguage = "javascript"
)

type TaskMeta struct {
	Title      string       `json:"title"`
	Difficulty Difficulty   `json:"difficulty"`
	Tags       []string     `json:"tags"`
	Language   TaskLanguage `json:"language"`
	Exports    []string     `json:"exports,omitempty"`
}

type TaskSummary struct {
	ID         string       `json:"id"`
	Topic      string       `json:"topic"`
	Slug       string       `json:"slug"`
	Title      string       `json:"title"`
	Difficulty Difficulty   `json:"difficulty"`
	Tags       []string     `json:"tags"`
	Language   TaskLanguage `json:"language"`
}

type TaskFull struct {
	TaskSummary
	Condition string   `json:"condition"`
	Template  string   `json:"template"`
	Hints     []string `json:"hints"`
	Solution  string   `json:"solution"`
	TestFile  string   `json:"testFile"`
}
