package auth

import (
	"context"
	"net/http"
	"time"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

type ctxKeyUser struct{}

const (
	CookieName     = "sid"
	SessionTTL     = 30 * 24 * time.Hour
	MinPasswordLen = 8
	MaxLoginLen    = 40
	MinLoginLen    = 3
)

func UserFromContext(ctx context.Context) (domain.User, bool) {
	user, ok := ctx.Value(ctxKeyUser{}).(domain.User)
	return user, ok
}

type Deps struct {
	Sessions SessionStore
	Users    UserStore
	Secure   bool
}

func Middleware(d Deps) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if cookie, err := r.Cookie(CookieName); err == nil {
				if user, err := d.Sessions.FindUser(r.Context(), cookie.Value); err == nil {
					next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ctxKeyUser{}, user)))
					return
				}
			}

			user, err := d.Users.CreateAnonymous(r.Context())
			if err != nil {
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			token, err := d.Sessions.Create(r.Context(), user.ID, SessionTTL)
			if err != nil {
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			http.SetCookie(w, &http.Cookie{
				Name:     CookieName,
				Value:    token,
				Path:     "/",
				HttpOnly: true,
				SameSite: http.SameSiteLaxMode,
				Secure:   d.Secure,
			})
			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ctxKeyUser{}, user)))
		})
	}
}
