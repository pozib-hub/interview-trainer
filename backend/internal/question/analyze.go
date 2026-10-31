package question

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/proposal"
)

type AnalyzeItem struct {
	ID              string `json:"id"`
	Question        string `json:"question"`
	ReferenceAnswer string `json:"referenceAnswer"`
	UserAnswer      string `json:"userAnswer"`
}

type AnalyzeResponse struct {
	Results []domain.AnalyzeVerdict `json:"results"`
	Summary string                  `json:"summary"`
}

type analyzeLLMResponse struct {
	Results []domain.AnalyzeVerdict `json:"results"`
	Summary string                  `json:"summary"`
}

func (s *Service) Analyze(ctx context.Context, req []AnalyzeItem) (AnalyzeResponse, error) {
	items := make([]AnalyzeItem, 0, len(req))
	for _, it := range req {
		if it.ID == "" || it.Question == "" || strings.TrimSpace(it.UserAnswer) == "" {
			continue
		}
		if len(it.UserAnswer) > maxAnswerChars {
			it.UserAnswer = it.UserAnswer[:maxAnswerChars]
		}
		if len(it.ReferenceAnswer) > maxAnswerChars {
			it.ReferenceAnswer = it.ReferenceAnswer[:maxAnswerChars]
		}
		items = append(items, it)
	}
	if len(items) > maxAnalyzeItems {
		items = items[:maxAnalyzeItems]
	}
	if len(items) == 0 {
		return AnalyzeResponse{}, fmt.Errorf("нет вопросов с ответами для разбора")
	}

	var parsed analyzeLLMResponse
	if s.Mock {
		for _, it := range items {
			parsed.Results = append(parsed.Results, domain.AnalyzeVerdict{
				ID: it.ID, OK: true, Feedback: "Мок-разбор: ответ принят без проверки.",
			})
		}
		parsed.Summary = "Мок-режим: ответы не проверялись реальной моделью."
		return AnalyzeResponse{Results: parsed.Results, Summary: parsed.Summary}, nil
	}
	if s.LLM == nil {
		return AnalyzeResponse{}, fmt.Errorf("LLM не настроен: задайте LLM_API_KEY и перезапустите backend")
	}

	system := strings.Join([]string{
		"Ты — технический интервьюер. Кандидат прошёл устное собеседование:",
		"вопросы задавались по очереди, ответы давались голосом и распознаны в текст",
		"(могут быть ошибки распознавания — не суди строго за опечатки и отсутствие пунктуации).",
		"",
		"Разбери каждый ответ:",
		"- ok=true — если ответ по сути корректен (мелкие неточности допустимы);",
		"  false — если ответ неверный, существенно неполный или мимо вопроса.",
		"- feedback — 1–3 предложения: что верно, что нет, что стоит повторить.",
		"  Кратко и по делу, без воды.",
		"",
		"Верни строго JSON без пояснений:",
		`{"results": [{"id": "...", "ok": true, "feedback": "..."}], "summary": "общий итог 2–3 предложения и главный совет"}`,
		"",
		"В results — по одному объекту на каждый вопрос с тем же id.",
	}, "\n")

	payload, err := json.Marshal(items)
	if err != nil {
		return AnalyzeResponse{}, err
	}
	user := fmt.Sprintf("Ответы кандидата (%d вопросов):\n\n%s", len(items), payload)

	raw, err := s.LLM.ChatRaw(ctx, system, user)
	if err != nil {
		return AnalyzeResponse{}, proposal.ClassifyLLMError(err)
	}
	data, err := proposal.ParseJSONContent(raw)
	if err != nil {
		return AnalyzeResponse{}, err
	}
	if err := json.Unmarshal(data, &parsed); err != nil {
		return AnalyzeResponse{}, fmt.Errorf("разбор ответа LLM: %w", err)
	}

	byID := map[string]domain.AnalyzeVerdict{}
	for _, r := range parsed.Results {
		if r.ID != "" {
			byID[r.ID] = r
		}
	}
	results := make([]domain.AnalyzeVerdict, 0, len(items))
	for _, it := range items {
		if r, ok := byID[it.ID]; ok {
			results = append(results, r)
		} else {
			results = append(results, domain.AnalyzeVerdict{
				ID:       it.ID,
				OK:       false,
				Feedback: "ИИ не оценил этот ответ — вердикт не получен.",
			})
		}
	}

	summary := parsed.Summary
	return AnalyzeResponse{Results: results, Summary: summary}, nil
}
