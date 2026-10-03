package config

import (
	"fmt"
	"time"

	"github.com/ilyakaznacheev/cleanenv"
)

type Config struct {
	Env          string        `env:"APP_ENV" env-default:"dev"`
	HTTPAddr     string        `env:"HTTP_ADDR" env-default:":8080"`
	DatabaseURL  string        `env:"DATABASE_URL" env-default:"postgres://trainer:trainer@localhost:5432/trainer?sslmode=disable"`
	TasksDir     string        `env:"TASKS_DIR" env-default:"./tasks"`
	RuntimeDir   string        `env:"RUNTIME_DIR" env-default:"./runtime"`
	NodeBin      string        `env:"NODE_BIN" env-default:"node"`
	RunTimeout   time.Duration `env:"RUN_TIMEOUT" env-default:"20s"`
	CookieSecure bool          `env:"COOKIE_SECURE" env-default:"false"`
}

func Load() (*Config, error) {
	var cfg Config
	if err := cleanenv.ReadEnv(&cfg); err != nil {
		return nil, fmt.Errorf("read config: %w", err)
	}
	return &cfg, nil
}
