package service

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/storage"
)

type StateService struct {
	repo storage.StateRepository
}

func NewStateService(repo storage.StateRepository) *StateService {
	return &StateService{repo: repo}
}

func (s *StateService) GetData(ctx context.Context, userID string) (domain.AppData, error) {
	return s.repo.Get(ctx, userID)
}

func (s *StateService) PatchData(ctx context.Context, userID string, patch json.RawMessage) (domain.AppData, error) {
	var fields map[string]json.RawMessage
	if err := json.Unmarshal(patch, &fields); err != nil {
		return domain.AppData{}, errors.Join(domain.ErrInvalidPatch, err)
	}
	applyField := func(raw json.RawMessage, target any) error {
		if err := json.Unmarshal(raw, target); err != nil {
			return errors.Join(domain.ErrInvalidPatch, err)
		}
		return nil
	}
	return s.repo.Patch(ctx, userID, func(current domain.AppData) domain.AppData {
		next := current
		for key, raw := range fields {
			if raw == nil || string(raw) == "null" {
				continue
			}
			switch key {
			case "solved":
				_ = applyField(raw, &next.Solved)
			case "sessions":
				_ = applyField(raw, &next.Sessions)
			case "code":
				_ = applyField(raw, &next.Code)
			case "layout":
				_ = applyField(raw, &next.Layout)
			case "solvedDates":
				_ = applyField(raw, &next.SolvedDates)
			case "reviews":
				_ = applyField(raw, &next.Reviews)
			}
		}
		return next
	})
}
