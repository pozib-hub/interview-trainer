package domain

import "errors"

var ErrInvalidPatch = errors.New("invalid patch payload")

type InterviewSession struct {
	ID      string          `json:"id"`
	Date    int64           `json:"date"`
	TaskIDs []string        `json:"taskIds"`
	Results map[string]bool `json:"results"`
}

type Layout struct {
	Sidebar  int `json:"sidebar"`
	LeftPane int `json:"leftPane"`
}

type AppData struct {
	Solved   []string           `json:"solved"`
	Sessions []InterviewSession `json:"sessions"`
	Code     map[string]string  `json:"code"`
	Layout   Layout             `json:"layout"`
}

func EmptyAppData() AppData {
	return AppData{
		Solved:   []string{},
		Sessions: []InterviewSession{},
		Code:     map[string]string{},
		Layout:   Layout{Sidebar: 280, LeftPane: 420},
	}
}
