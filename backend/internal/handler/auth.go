package handler

import (
	"errors"
	"net/http"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/auth"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/service"
)

type authRequest struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

func currentUser(r *http.Request) domain.User {
	user, _ := auth.UserFromContext(r.Context())
	return user
}

func writeAuthJSON(w http.ResponseWriter, user domain.User) {
	writeJSON(w, http.StatusOK, map[string]any{
		"authenticated": !user.IsAnonymous,
		"login":         user.Login,
	})
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	writeAuthJSON(w, currentUser(r))
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req authRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Неверный JSON")
		return
	}
	user, err := h.auth.Register(r.Context(), currentUser(r), req.Login, req.Password)
	switch {
	case errors.Is(err, service.ErrInvalidInput):
		writeError(w, http.StatusBadRequest, "Логин: 3–40 символов (a-z, 0-9, _ - .), пароль: минимум 6 символов")
		return
	case errors.Is(err, service.ErrLoginTaken):
		writeError(w, http.StatusConflict, "Такой логин уже занят")
		return
	case errors.Is(err, service.ErrAlreadyAuthorized):
		writeError(w, http.StatusConflict, "Вы уже авторизованы")
		return
	case err != nil:
		writeError(w, http.StatusInternalServerError, "Не удалось зарегистрироваться")
		return
	}
	writeAuthJSON(w, user)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req authRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Неверный JSON")
		return
	}
	guest := currentUser(r)
	user, err := h.auth.Login(r.Context(), guest, req.Login, req.Password)
	if errors.Is(err, service.ErrInvalidCredentials) {
		writeError(w, http.StatusUnauthorized, "Неверный логин или пароль")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Не удалось войти")
		return
	}
	token, err := h.sessions.Create(r.Context(), user.ID, auth.SessionTTL)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Не удалось создать сессию")
		return
	}
	if cookie, err := r.Cookie(auth.CookieName); err == nil {
		_ = h.sessions.Delete(r.Context(), cookie.Value)
	}
	http.SetCookie(w, &http.Cookie{
		Name:     auth.CookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   h.secureCookies,
	})
	writeAuthJSON(w, user)
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	if cookie, err := r.Cookie(auth.CookieName); err == nil {
		_ = h.sessions.Delete(r.Context(), cookie.Value)
	}
	user, err := h.users.CreateAnonymous(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Не удалось выйти")
		return
	}
	token, err := h.sessions.Create(r.Context(), user.ID, auth.SessionTTL)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Не удалось выйти")
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     auth.CookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   h.secureCookies,
	})
	writeAuthJSON(w, user)
}
