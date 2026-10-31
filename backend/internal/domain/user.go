package domain

import "errors"

var ErrNotFound = errors.New("not found")

type User struct {
	ID           string
	Login        string
	PasswordHash string
	IsAnonymous  bool
}
