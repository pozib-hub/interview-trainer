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

	// Генерация задач через LLM (OpenAI-совместимый API) + PR на GitHub.
	LLMBaseURL string        `env:"LLM_BASE_URL" env-default:"https://api.deepseek.com/v1"`
	LLMModel   string        `env:"LLM_MODEL" env-default:"deepseek-chat"`
	LLMAPIKey  string        `env:"LLM_API_KEY"`
	LLMTimeout time.Duration `env:"LLM_TIMEOUT" env-default:"90s"`
	LLMMock    bool          `env:"LLM_MOCK" env-default:"false"`

	GitHubToken      string `env:"GITHUB_TOKEN"`
	GitHubRepo       string `env:"GITHUB_REPO" env-default:"pozib-hub/interview-trainer-v2"`
	GitHubAPIBase    string `env:"GITHUB_API_BASE" env-default:"https://api.github.com"`
	ProposalBaseBranch string `env:"PROPOSAL_BASE_BRANCH" env-default:"main"`
	ProposalDryRun   bool   `env:"PROPOSAL_DRY_RUN" env-default:"false"`
}

func Load() (*Config, error) {
	var cfg Config
	if err := cleanenv.ReadEnv(&cfg); err != nil {
		return nil, fmt.Errorf("read config: %w", err)
	}
	return &cfg, nil
}
