package auth

import (
	"crypto/sha256"
	"encoding/hex"

	"golang.org/x/crypto/bcrypt"
)

func HashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func CheckPassword(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

// dummyHash — валидный bcrypt-хэш для фиктивной сверки: когда логин не найден,
// всё равно выполняем bcrypt-сравнение, чтобы время ответа не выдавало
// существование аккаунта (защита от enumeraции по таймингу).
var dummyHash = func() string {
	h, err := bcrypt.GenerateFromPassword([]byte("timing-equalization-dummy"), bcrypt.DefaultCost)
	if err != nil {
		// недостижимо для валидного cost, но перестрахуемся
		return "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
	}
	return string(h)
}()

// BurnPassword выполняет бесполезную bcrypt-сверку (выравнивание тайминга).
func BurnPassword(password string) {
	_ = CheckPassword(dummyHash, password)
}

func ValidateLogin(login string) bool {
	if len(login) < MinLoginLen || len(login) > MaxLoginLen {
		return false
	}
	for _, r := range login {
		switch {
		case r >= 'a' && r <= 'z':
		case r >= 'A' && r <= 'Z':
		case r >= '0' && r <= '9':
		case r == '_' || r == '-' || r == '.':
		default:
			return false
		}
	}
	return true
}

func ValidatePassword(password string) bool {
	return len(password) >= MinPasswordLen
}
