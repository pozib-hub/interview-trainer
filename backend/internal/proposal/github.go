package proposal

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// GitHubClient создаёт ветку с файлами задачи и draft-PR через Git Data API
// (без git-бинаря: blobs → tree → commit → ref → pull request).
type GitHubClient struct {
	APIBase    string
	Token      string
	Repo       string // owner/name
	HTTPClient *http.Client
}

func NewGitHubClient(apiBase, token, repo string, timeout time.Duration) *GitHubClient {
	if apiBase == "" {
		apiBase = "https://api.github.com"
	}
	return &GitHubClient{
		APIBase:    strings.TrimRight(apiBase, "/"),
		Token:      token,
		Repo:       repo,
		HTTPClient: &http.Client{Timeout: timeout},
	}
}

func (g *GitHubClient) call(ctx context.Context, method, path string, body any, out any) error {
	var payload io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return fmt.Errorf("marshal github request: %w", err)
		}
		payload = bytes.NewReader(b)
	}
	req, err := http.NewRequestWithContext(ctx, method, g.APIBase+path, payload)
	if err != nil {
		return fmt.Errorf("build github request: %w", err)
	}
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("X-GitHub-Api-Version", "2022-11-28")
	if g.Token != "" {
		req.Header.Set("Authorization", "Bearer "+g.Token)
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	res, err := g.HTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf("github request: %w", err)
	}
	defer res.Body.Close()
	raw, _ := io.ReadAll(io.LimitReader(res.Body, 4<<20))
	if res.StatusCode >= 300 {
		return fmt.Errorf("github api %s %s: %d %s: %s", method, path, res.StatusCode, res.Status, truncate(string(raw), 600))
	}
	if out != nil {
		if err := json.Unmarshal(raw, out); err != nil {
			return fmt.Errorf("decode github response: %w", err)
		}
	}
	return nil
}

// GetFileContent возвращает содержимое файла из репозитория по ref.
func (g *GitHubClient) GetFileContent(ctx context.Context, path, ref string) (string, error) {
	var file struct {
		Content  string `json:"content"`
		Encoding string `json:"encoding"`
	}
	q := ""
	if ref != "" {
		q = "?ref=" + ref
	}
	if err := g.call(ctx, http.MethodGet, "/repos/"+g.Repo+"/contents/"+path+q, nil, &file); err != nil {
		return "", fmt.Errorf("получить файл %s: %w", path, err)
	}
	if file.Encoding != "base64" {
		return "", fmt.Errorf("файл %s: неожиданная кодировка %q", path, file.Encoding)
	}
	raw, err := base64.StdEncoding.DecodeString(strings.ReplaceAll(file.Content, "\n", ""))
	if err != nil {
		return "", fmt.Errorf("декодировать %s: %w", path, err)
	}
	return string(raw), nil
}

// CreateBranchAndPR создаёт ветку с 6 файлами задачи и draft-PR.
// Возвращает URL PR.
func (g *GitHubClient) CreateBranchAndPR(ctx context.Context, branch, baseBranch string, files map[string]string, title, body string) (string, error) {
	// 1. Базовый ref
	var ref struct {
		Object struct {
			SHA string `json:"sha"`
		} `json:"object"`
	}
	if err := g.call(ctx, http.MethodGet, "/repos/"+g.Repo+"/git/ref/heads/"+baseBranch, nil, &ref); err != nil {
		return "", fmt.Errorf("получить базовую ветку %s: %w", baseBranch, err)
	}
	baseSHA := ref.Object.SHA

	// 2. Базовый commit → tree sha
	var baseCommit struct {
		Tree struct {
			SHA string `json:"sha"`
		} `json:"tree"`
	}
	if err := g.call(ctx, http.MethodGet, "/repos/"+g.Repo+"/git/commits/"+baseSHA, nil, &baseCommit); err != nil {
		return "", fmt.Errorf("получить базовый коммит: %w", err)
	}

	// 3. Blobs
	tree := make([]map[string]any, 0, len(files))
	for path, content := range files {
		var blob struct {
			SHA string `json:"sha"`
		}
		if err := g.call(ctx, http.MethodPost, "/repos/"+g.Repo+"/git/blobs", map[string]string{
			"content":  base64.StdEncoding.EncodeToString([]byte(content)),
			"encoding": "base64",
		}, &blob); err != nil {
			return "", fmt.Errorf("создать blob %s: %w", path, err)
		}
		tree = append(tree, map[string]any{
			"path": path,
			"mode": "100644",
			"type": "blob",
			"sha":  blob.SHA,
		})
	}

	// 4. Tree
	var newTree struct {
		SHA string `json:"sha"`
	}
	if err := g.call(ctx, http.MethodPost, "/repos/"+g.Repo+"/git/trees", map[string]any{
		"base_tree": baseCommit.Tree.SHA,
		"tree":      tree,
	}, &newTree); err != nil {
		return "", fmt.Errorf("создать tree: %w", err)
	}

	// 5. Commit
	var commit struct {
		SHA string `json:"sha"`
	}
	if err := g.call(ctx, http.MethodPost, "/repos/"+g.Repo+"/git/commits", map[string]any{
		"message": "Добавлена задача (сгенерирована AI из формы приложения)",
		"tree":    newTree.SHA,
		"parents": []string{baseSHA},
	}, &commit); err != nil {
		return "", fmt.Errorf("создать коммит: %w", err)
	}

	// 6. Branch (ref)
	if err := g.call(ctx, http.MethodPost, "/repos/"+g.Repo+"/git/refs", map[string]any{
		"ref": "refs/heads/" + branch,
		"sha": commit.SHA,
	}, nil); err != nil {
		return "", fmt.Errorf("создать ветку %s: %w", branch, err)
	}

	// 7. Pull request (draft — мерджер проверяет вручную)
	var pr struct {
		HTMLURL string `json:"html_url"`
	}
	if err := g.call(ctx, http.MethodPost, "/repos/"+g.Repo+"/pulls", map[string]any{
		"title": title,
		"body":  body,
		"head":  branch,
		"base":  baseBranch,
		"draft": true,
	}, &pr); err != nil {
		return "", fmt.Errorf("создать pull request: %w", err)
	}
	return pr.HTMLURL, nil
}
