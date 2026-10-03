package service

import (
	"context"
	"errors"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/auth"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/storage"
)

var (
	ErrLoginTaken         = errors.New("login already taken")
	ErrAlreadyAuthorized  = errors.New("already authorized")
	ErrInvalidCredentials = errors.New("invalid login or password")
	ErrInvalidInput       = errors.New("invalid login or password format")
)

type AuthService struct {
	users    storage.UserRepository
	sessions storage.SessionRepository
	states   storage.StateRepository
}

func NewAuthService(users storage.UserRepository, sessions storage.SessionRepository, states storage.StateRepository) *AuthService {
	return &AuthService{users: users, sessions: sessions, states: states}
}

func (s *AuthService) Register(ctx context.Context, currentUser domain.User, login, password string) (domain.User, error) {
	if !currentUser.IsAnonymous {
		return domain.User{}, ErrAlreadyAuthorized
	}
	if !auth.ValidateLogin(login) || !auth.ValidatePassword(password) {
		return domain.User{}, ErrInvalidInput
	}
	if _, err := s.users.FindByLogin(ctx, login); err == nil {
		return domain.User{}, ErrLoginTaken
	}
	hash, err := auth.HashPassword(password)
	if err != nil {
		return domain.User{}, err
	}
	return s.users.Register(ctx, currentUser.ID, login, hash)
}

func (s *AuthService) Login(ctx context.Context, guest domain.User, login, password string) (domain.User, error) {
	account, err := s.users.FindByLogin(ctx, login)
	if err != nil {
		return domain.User{}, ErrInvalidCredentials
	}
	if account.PasswordHash == "" || !auth.CheckPassword(account.PasswordHash, password) {
		return domain.User{}, ErrInvalidCredentials
	}
	if guest.IsAnonymous {
		guestData, err := s.states.Get(ctx, guest.ID)
		if err != nil {
			return domain.User{}, err
		}
		accountData, err := s.states.Get(ctx, account.ID)
		if err != nil {
			return domain.User{}, err
		}
		merged := domain.MergeAppData(accountData, guestData)
		if err := s.states.Save(ctx, account.ID, merged); err != nil {
			return domain.User{}, err
		}
		_ = s.users.Delete(ctx, guest.ID)
	}
	return account, nil
}
