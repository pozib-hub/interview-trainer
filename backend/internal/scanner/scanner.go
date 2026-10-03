package scanner

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

const listCacheTTL = 10 * time.Second

type taskCacheEntry struct {
	data  domain.TaskFull
	mtime int64
}

type Scanner struct {
	root string

	mu          sync.Mutex
	listCache   []domain.TaskSummary
	listCacheAt time.Time
	taskCache   map[string]taskCacheEntry
	missing     map[string]struct{}
}

func New(root string) *Scanner {
	return &Scanner{
		root:      root,
		taskCache: map[string]taskCacheEntry{},
		missing:   map[string]struct{}{},
	}
}

func (s *Scanner) Root() string { return s.root }

func (s *Scanner) resolveTaskID(id string) (string, bool) {
	if id == "" || strings.ContainsRune(id, 0) {
		return "", false
	}
	if filepath.IsAbs(id) {
		return "", false
	}
	resolved := filepath.Join(s.root, filepath.FromSlash(id))
	rel, err := filepath.Rel(s.root, resolved)
	if err != nil || rel == ".." || strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
		return "", false
	}
	return resolved, true
}

func readMeta(dir string) (domain.TaskMeta, bool) {
	raw, err := os.ReadFile(filepath.Join(dir, "meta.json"))
	if err != nil {
		return domain.TaskMeta{}, false
	}
	var meta domain.TaskMeta
	if err := json.Unmarshal(raw, &meta); err != nil {
		return domain.TaskMeta{}, false
	}
	return meta, true
}

func isTaskDir(dir string) bool {
	_, err := os.Stat(filepath.Join(dir, "meta.json"))
	return err == nil
}

func dirMtime(dir string) int64 {
	var max int64
	files := []string{
		"meta.json", "condition.md", "template.ts", "solution.ts", "hints.md",
		filepath.Join("tests", "test.ts"),
		filepath.Join("tests", "test.tsx"),
	}
	for _, name := range files {
		if st, err := os.Stat(filepath.Join(dir, name)); err == nil && st.ModTime().UnixNano() > max {
			max = st.ModTime().UnixNano()
		}
	}
	return max
}

func readSafe(path string) string {
	raw, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	return string(raw)
}

func splitHints(raw string) []string {
	if strings.TrimSpace(raw) == "" {
		return []string{}
	}
	parts := strings.Split(raw, "\n## ")
	hints := make([]string, 0, len(parts))
	for i, p := range parts {
		if i == 0 {
			p = strings.TrimPrefix(p, "## ")
		}
		if t := strings.TrimSpace(p); t != "" {
			hints = append(hints, t)
		}
	}
	return hints
}

func (s *Scanner) ListTasks() []domain.TaskSummary {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	if s.listCache != nil && now.Sub(s.listCacheAt) < listCacheTTL {
		return s.listCache
	}

	tasks := s.scan()
	sort.Slice(tasks, func(i, j int) bool {
		if tasks[i].Topic != tasks[j].Topic {
			return tasks[i].Topic < tasks[j].Topic
		}
		return tasks[i].Slug < tasks[j].Slug
	})
	s.listCache = tasks
	s.listCacheAt = now
	return tasks
}

func (s *Scanner) scan() []domain.TaskSummary {
	var acc []domain.TaskSummary
	topicEntries, err := os.ReadDir(s.root)
	if err != nil {
		return acc
	}
	for _, topicEntry := range topicEntries {
		if !topicEntry.IsDir() || strings.HasPrefix(topicEntry.Name(), ".") || topicEntry.Name() == "node_modules" {
			continue
		}
		topicDir := filepath.Join(s.root, topicEntry.Name())
		taskEntries, err := os.ReadDir(topicDir)
		if err != nil {
			continue
		}
		for _, taskEntry := range taskEntries {
			if !taskEntry.IsDir() || strings.HasPrefix(taskEntry.Name(), ".") {
				continue
			}
			dir := filepath.Join(topicDir, taskEntry.Name())
			if !isTaskDir(dir) {
				continue
			}
			meta, ok := readMeta(dir)
			if !ok {
				continue
			}
			acc = append(acc, domain.TaskSummary{
				ID:         topicEntry.Name() + "/" + taskEntry.Name(),
				Topic:      topicEntry.Name(),
				Slug:       taskEntry.Name(),
				Title:      meta.Title,
				Difficulty: meta.Difficulty,
				Tags:       meta.Tags,
				Language:   meta.Language,
			})
		}
	}
	return acc
}

func (s *Scanner) GetTask(id string) (domain.TaskFull, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	dir, ok := s.resolveTaskID(id)
	if !ok {
		return domain.TaskFull{}, false
	}

	if _, missing := s.missing[id]; missing {
		return domain.TaskFull{}, false
	}
	if cached, hit := s.taskCache[id]; hit && cached.mtime == dirMtime(dir) {
		return cached.data, true
	}

	if st, err := os.Stat(dir); err != nil || !st.IsDir() || !isTaskDir(dir) {
		s.missing[id] = struct{}{}
		return domain.TaskFull{}, false
	}
	meta, ok := readMeta(dir)
	if !ok {
		s.missing[id] = struct{}{}
		return domain.TaskFull{}, false
	}

	parts := strings.SplitN(id, "/", 2)
	topic, slug := "misc", filepath.Base(dir)
	if len(parts) == 2 && parts[0] != "" {
		topic, slug = parts[0], parts[1]
	}

	testFile := filepath.Join(dir, "tests", "test.ts")
	if meta.Language == domain.LanguageTypeScriptReact {
		testFile = filepath.Join(dir, "tests", "test.tsx")
	}

	task := domain.TaskFull{
		TaskSummary: domain.TaskSummary{
			ID:         id,
			Topic:       topic,
			Slug:        slug,
			Title:       meta.Title,
			Difficulty:  meta.Difficulty,
			Tags:        meta.Tags,
			Language:    meta.Language,
		},
		Condition: readSafe(filepath.Join(dir, "condition.md")),
		Template:  readSafe(filepath.Join(dir, "template.ts")),
		Hints:     splitHints(readSafe(filepath.Join(dir, "hints.md"))),
		Solution:  readSafe(filepath.Join(dir, "solution.ts")),
		TestFile:  readSafe(testFile),
	}

	s.taskCache[id] = taskCacheEntry{data: task, mtime: dirMtime(dir)}
	return task, true
}
