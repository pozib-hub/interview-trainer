package question

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"strings"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/proposal"
)

// LLMChat — минимальный интерфейс LLM (реализация *proposal.LLMClient).
type LLMChat interface {
	ChatRaw(ctx context.Context, system, user string) (string, error)
}

// Service — устное собеседование по вопросам: план и разбор ответов.
type Service struct {
	Scanner *Scanner
	LLM     LLMChat
	Mock    bool
}

const (
	durationMinutes = 30
	initialCount    = 12
	minQuestions    = 3
	maxQuestions    = 20
	maxIterations   = 4
	maxAnalyzeItems = 30
	maxAnswerChars  = 8000
)

type PlanRequest struct {
	Direction    string   `json:"direction"`
	Technologies []string `json:"technologies"`
}

type PlanResponse struct {
	Questions       []domain.PlanQuestion `json:"questions"`
	DurationMinutes int                   `json:"durationMinutes"`
	Iterations      int                   `json:"iterations"`
	LastAdjustment  string                `json:"lastAdjustment"`
}

type planLLMResponse struct {
	OK       bool     `json:"ok"`
	Reason   string   `json:"reason"`
	FinalIDs []string `json:"finalIds"`
}

func (s *Service) Plan(ctx context.Context, req PlanRequest) (PlanResponse, error) {
	index := s.Scanner.Index()
	var direction *domain.QuestionsDirection
	for i := range index.Directions {
		if index.Directions[i].ID == req.Direction {
			direction = &index.Directions[i]
			break
		}
	}
	if direction == nil {
		return PlanResponse{}, fmt.Errorf("направление «%s» не найдено", req.Direction)
	}

	selected := direction.Technologies
	if len(req.Technologies) > 0 {
		wanted := map[string]bool{}
		for _, id := range req.Technologies {
			wanted[id] = true
		}
		selected = nil
		for _, t := range direction.Technologies {
			if wanted[t.ID] {
				selected = append(selected, t)
			}
		}
	}

	pool := []domain.PlanQuestion{}
	if len(selected) > 0 {
		for _, tech := range selected {
			for _, chapter := range tech.Chapters {
				for _, q := range chapter.Questions {
					pool = append(pool, domain.PlanQuestion{
						ID: q.ID, Question: q.Question, Answer: q.Answer,
						TechTitle: tech.Title, ChapterTitle: chapter.Title,
					})
				}
			}
		}
	} else {
		for _, chapter := range direction.Chapters {
			for _, q := range chapter.Questions {
				pool = append(pool, domain.PlanQuestion{
					ID: q.ID, Question: q.Question, Answer: q.Answer,
					TechTitle: direction.Title, ChapterTitle: chapter.Title,
				})
			}
		}
	}

	if len(pool) < minQuestions {
		return PlanResponse{}, fmt.Errorf("слишком мало вопросов в выбранной комбинации — выберите больше технологий")
	}

	current := shuffled(pool)
	if len(current) > initialCount {
		current = current[:initialCount]
	}
	poolIndex := map[string]domain.PlanQuestion{}
	for _, q := range pool {
		poolIndex[q.ID] = q
	}

	techTitles := []string{direction.Title}
	if len(selected) > 0 {
		techTitles = nil
		for _, t := range selected {
			techTitles = append(techTitles, t.Title)
		}
	}

	iterations := 0
	lastReason := ""
	for iterations < maxIterations {
		iterations++
		resp, err := s.planLLM(ctx, current, pool, techTitles)
		if err != nil {
			return PlanResponse{}, err
		}
		if valid := validPlanIDs(resp.FinalIDs, poolIndex); valid != nil {
			current = valid
		}
		if resp.OK {
			break
		}
		lastReason = resp.Reason
	}

	return PlanResponse{
		Questions:       current,
		DurationMinutes: durationMinutes,
		Iterations:      iterations,
		LastAdjustment:  lastReason,
	}, nil
}

func validPlanIDs(ids []string, pool map[string]domain.PlanQuestion) []domain.PlanQuestion {
	if len(ids) < minQuestions || len(ids) > maxQuestions {
		return nil
	}
	seen := map[string]bool{}
	result := make([]domain.PlanQuestion, 0, len(ids))
	for _, id := range ids {
		q, ok := pool[id]
		if !ok || seen[id] {
			continue
		}
		seen[id] = true
		result = append(result, q)
	}
	if len(result) != len(ids) || len(result) < minQuestions {
		return nil
	}
	return result
}

func (s *Service) planLLM(ctx context.Context, sample, pool []domain.PlanQuestion, techTitles []string) (planLLMResponse, error) {
	var resp planLLMResponse
	if s.Mock {
		return planLLMResponse{OK: true, FinalIDs: idsOf(sample)}, nil
	}
	if s.LLM == nil {
		return resp, fmt.Errorf("LLM не настроен: задайте LLM_API_KEY и перезапустите backend")
	}

	system := strings.Join([]string{
		fmt.Sprintf("Ты — опытный технический интервьюер. Формируешь план устного собеседования на %d минут.", durationMinutes),
		"",
		"Правила:",
		"- Устный ответ на вопрос занимает в среднем 2–3 минуты (краткий ответ кандидата + уточняющие вопросы).",
		fmt.Sprintf("- Итоговый список должен укладываться в %d минут и сбалансированно покрывать выбранные темы, без однотипных вопросов подряд.", durationMinutes),
		"- Меняй состав выборки только при необходимости: лишнее убирай, недостающее добавляй из пула.",
		"",
		"Верни строго JSON без пояснений:",
		`{"ok": true|false, "reason": "краткое пояснение", "finalIds": ["id1", "id2", ...]}`,
		"",
		"ok=true — итоговый список из finalIds укладывается в лимит времени.",
		"finalIds — финальный список id вопросов в порядке проведения. Если выборка уже подходит — верни её же id с ok=true.",
	}, "\n")

	sampleLines := make([]string, len(sample))
	for i, q := range sample {
		sampleLines[i] = fmt.Sprintf("- %s: %s (глава: %s)", q.ID, q.Question, q.ChapterTitle)
	}
	sampleSet := map[string]bool{}
	for _, q := range sample {
		sampleSet[q.ID] = true
	}
	poolLines := []string{}
	for _, q := range pool {
		if !sampleSet[q.ID] {
			poolLines = append(poolLines, fmt.Sprintf("- %s: %s", q.ID, q.Question))
		}
	}
	poolBlock := "- (пул исчерпан — только убирай)"
	if len(poolLines) > 0 {
		poolBlock = strings.Join(poolLines, "\n")
	}

	user := strings.Join([]string{
		fmt.Sprintf("Длительность собеседования: %d минут.", durationMinutes),
		fmt.Sprintf("Технологии: %s.", strings.Join(techTitles, ", ")),
		"",
		"Текущая выборка вопросов:",
		strings.Join(sampleLines, "\n"),
		"",
		"Пул доступных вопросов (для добавления, только отсюда):",
		poolBlock,
		"",
		"Оцени выборку и верни JSON.",
	}, "\n")

	raw, err := s.LLM.ChatRaw(ctx, system, user)
	if err != nil {
		return resp, fmt.Errorf("%s", proposal.FriendlyLLMError(err))
	}
	data, err := proposal.ParseJSONContent(raw)
	if err != nil {
		return resp, err
	}
	if err := json.Unmarshal(data, &resp); err != nil {
		return resp, fmt.Errorf("ИИ вернул неожиданный формат ответа — попробуйте ещё раз")
	}
	return resp, nil
}

func idsOf(qs []domain.PlanQuestion) []string {
	ids := make([]string, len(qs))
	for i, q := range qs {
		ids[i] = q.ID
	}
	return ids
}

func shuffled(qs []domain.PlanQuestion) []domain.PlanQuestion {
	a := make([]domain.PlanQuestion, len(qs))
	copy(a, qs)
	rand.Shuffle(len(a), func(i, j int) { a[i], a[j] = a[j], a[i] })
	return a
}
