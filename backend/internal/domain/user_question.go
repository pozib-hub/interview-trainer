package domain

import "time"

type UserQuestion struct {
	ID        string `json:"id"`
	UserID    string `json:"-"`
	Question  string `json:"question"`
	Answer    string `json:"answer"`
	Category  string `json:"category"`
	CreatedAt int64  `json:"createdAt"`
	UpdatedAt int64  `json:"updatedAt"`
}

func (q UserQuestion) Touch(now time.Time) UserQuestion {
	q.UpdatedAt = now.UnixMilli()
	return q
}
