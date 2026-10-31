package domain

import "encoding/json"

type JobKind string

const (
	JobKindPlan             JobKind = "plan"
	JobKindAnalyze          JobKind = "analyze"
	JobKindTaskProposal     JobKind = "task_proposal"
	JobKindHint             JobKind = "hint"
	JobKindReview           JobKind = "review"
	JobKindQuestionProposal JobKind = "question_proposal"
)

type JobStatus string

const (
	JobPending JobStatus = "pending"
	JobRunning JobStatus = "running"
	JobDone    JobStatus = "done"
	JobFailed  JobStatus = "failed"
)

type Job struct {
	ID        string          `json:"id"`
	UserID    string          `json:"-"`
	Kind      JobKind         `json:"kind"`
	Status    JobStatus       `json:"status"`
	Result    json.RawMessage `json:"result,omitempty"`
	Error     string          `json:"error,omitempty"`
	ErrorCode string          `json:"errorCode,omitempty"`
	CreatedAt int64           `json:"createdAt"`
	UpdatedAt int64           `json:"updatedAt"`
}
