package config

import (
	"fmt"
	"os"
	"time"

	"github.com/ilyakaznacheev/cleanenv"
)

type Config struct {
	Env          string        `env:"APP_ENV" env-default:"dev"`
	HTTPAddr     string        `env:"HTTP_ADDR" env-default:":8080"`
	DatabaseURL  string        `env:"DATABASE_URL" env-default:"postgres://trainer:trainer@localhost:5432/trainer?sslmode=disable"`
	TasksDir     string        `env:"TASKS_DIR" env-default:"./tasks"`
	QuestionsDir string        `env:"QUESTIONS_DIR" env-default:"./questions"`
	RuntimeDir   string        `env:"RUNTIME_DIR" env-default:"./runtime"`
	NodeBin      string        `env:"NODE_BIN" env-default:"node"`
	RunTimeout   time.Duration `env:"RUN_TIMEOUT" env-default:"20s"`
	CookieSecure bool          `env:"COOKIE_SECURE" env-default:"false"`

	// Генерация задач через LLM (OpenAI-совместимый API) + PR на GitHub.
	// Совместимо с прошлой версией проекта: те же имена переменных и фолбэки
	// (LLM_API_KEY → DEEPSEEK_API_KEY → OPENAI_API_KEY).
	// LLMModel пустой = не слать поле model в запросе (роутер выбирает сам).
	LLMBaseURL    string `env:"LLM_BASE_URL" env-default:"https://api.deepseek.com/v1"`
	LLMModel      string `env:"LLM_MODEL"`
	LLMAPIKey     string `env:"LLM_API_KEY"`
	LLMTimeoutMS  int    `env:"LLM_TIMEOUT_MS" env-default:"90000"`
	LLMMaxRetries int    `env:"LLM_MAX_RETRIES" env-default:"2"`
	LLMMock       bool   `env:"LLM_MOCK" env-default:"false"`

	GitHubToken        string `env:"GITHUB_TOKEN"`
	GitHubRepo         string `env:"GITHUB_REPO" env-default:"pozib-hub/interview-trainer-v2"`
	GitHubAPIBase      string `env:"GITHUB_API_BASE" env-default:"https://api.github.com"`
	ProposalBaseBranch string `env:"PROPOSAL_BASE_BRANCH" env-default:"main"`
	ProposalDryRun     bool   `env:"PROPOSAL_DRY_RUN" env-default:"false"`
}

func Load() (*Config, error) {
	var cfg Config
	if err := cleanenv.ReadEnv(&cfg); err != nil {
		return nil, fmt.Errorf("read config: %w", err)
	}
	// Фолбэки как в прошлом проекте: LLM_API_KEY || DEEPSEEK_API_KEY || OPENAI_API_KEY.
	if cfg.LLMAPIKey == "" {
		cfg.LLMAPIKey = os.Getenv("DEEPSEEK_API_KEY")
	}
	if cfg.LLMAPIKey == "" {
		cfg.LLMAPIKey = os.Getenv("OPENAI_API_KEY")
	}
	return &cfg, nil
}
