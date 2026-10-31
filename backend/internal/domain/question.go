package domain

type QuestionEntry struct {
	ID       string `json:"id"`
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

type QuestionChapter struct {
	ID        string          `json:"id"`
	Title     string          `json:"title"`
	Questions []QuestionEntry `json:"questions"`
}

type QuestionsTechnology struct {
	ID          string            `json:"id"`
	DirectionID string            `json:"directionId"`
	Title       string            `json:"title"`
	Description string            `json:"description"`
	Order       int               `json:"order,omitempty"`
	Chapters    []QuestionChapter `json:"chapters"`
}

type QuestionsDirection struct {
	ID           string                `json:"id"`
	Title        string                `json:"title"`
	Description  string                `json:"description"`
	Order        int                   `json:"order,omitempty"`
	Technologies []QuestionsTechnology `json:"technologies"`
	Chapters     []QuestionChapter     `json:"chapters"`
}

type QuestionsIndex struct {
	Directions []QuestionsDirection `json:"directions"`
}

type PlanQuestion struct {
	ID           string `json:"id"`
	Question     string `json:"question"`
	Answer       string `json:"answer"`
	TechTitle    string `json:"techTitle"`
	ChapterTitle string `json:"chapterTitle"`
}

type AnalyzeVerdict struct {
	ID       string `json:"id"`
	OK       bool   `json:"ok"`
	Feedback string `json:"feedback"`
}
