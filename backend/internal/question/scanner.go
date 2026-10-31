// Package question — сборник вопросов с собеседований: сканер файлового
// дерева questions/ и устное собеседование (план вопросов + разбор ответов).
package question

import (
	"encoding/json"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

const cacheTTL = 10 * time.Second

type Scanner struct {
	root string

	mu       sync.Mutex
	cache    *domain.QuestionsIndex
	cachedAt time.Time
}

func NewScanner(root string) *Scanner {
	return &Scanner{root: root}
}

var safeIDRe = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

func isSafeID(id string) bool {
	return safeIDRe.MatchString(id)
}

type nodeMeta struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Order       int    `json:"order"`
}

func readMeta(path string) (nodeMeta, bool) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nodeMeta{}, false
	}
	var meta nodeMeta
	if err := json.Unmarshal(raw, &meta); err != nil {
		return nodeMeta{}, false
	}
	return meta, true
}

func readChaptersDir(absDir, relDir string) []domain.QuestionChapter {
	chaptersDir := filepath.Join(absDir, "chapters")
	entries, err := os.ReadDir(chaptersDir)
	if err != nil {
		return []domain.QuestionChapter{}
	}
	names := make([]string, 0, len(entries))
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".md") {
			names = append(names, e.Name())
		}
	}
	sort.Strings(names)

	chapters := make([]domain.QuestionChapter, 0, len(names))
	for _, name := range names {
		raw, err := os.ReadFile(filepath.Join(chaptersDir, name))
		if err != nil {
			continue
		}
		chapters = append(chapters, ParseChapterMarkdown(relDir, name, string(raw)))
	}
	return chapters
}

func scanTechnology(root, directionID, dirName string) (domain.QuestionsTechnology, bool) {
	absDir := filepath.Join(root, directionID, dirName)
	meta, ok := readMeta(filepath.Join(absDir, "meta.json"))
	if !ok {
		return domain.QuestionsTechnology{}, false
	}
	return domain.QuestionsTechnology{
		ID:          directionID + "/" + dirName,
		DirectionID: directionID,
		Title:       firstNonEmpty(meta.Title, dirName),
		Description: meta.Description,
		Order:       meta.Order,
		Chapters:    readChaptersDir(absDir, directionID+"/"+dirName),
	}, true
}

func scanDirection(root, dirName string) (domain.QuestionsDirection, bool) {
	absDir := filepath.Join(root, dirName)
	meta, ok := readMeta(filepath.Join(absDir, "meta.json"))
	if !ok {
		return domain.QuestionsDirection{}, false
	}

	entries, err := os.ReadDir(absDir)
	if err != nil {
		entries = nil
	}

	technologies := []domain.QuestionsTechnology{}
	for _, entry := range entries {
		if !entry.IsDir() || strings.HasPrefix(entry.Name(), ".") || entry.Name() == "node_modules" {
			continue
		}
		if entry.Name() == "chapters" {
			continue
		}
		if tech, ok := scanTechnology(root, dirName, entry.Name()); ok {
			technologies = append(technologies, tech)
		}
	}
	sort.Slice(technologies, func(i, j int) bool {
		if technologies[i].Order != technologies[j].Order {
			return technologies[i].Order < technologies[j].Order
		}
		return technologies[i].Title < technologies[j].Title
	})

	return domain.QuestionsDirection{
		ID:           dirName,
		Title:        firstNonEmpty(meta.Title, dirName),
		Description:  meta.Description,
		Order:        meta.Order,
		Technologies: technologies,
		Chapters:     readChaptersDir(absDir, dirName),
	}, true
}

func (s *Scanner) Index() domain.QuestionsIndex {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	if s.cache != nil && now.Sub(s.cachedAt) < cacheTTL {
		return *s.cache
	}

	entries, err := os.ReadDir(s.root)
	if err != nil {
		entries = nil
	}

	directions := []domain.QuestionsDirection{}
	for _, entry := range entries {
		if !entry.IsDir() || strings.HasPrefix(entry.Name(), ".") || entry.Name() == "node_modules" {
			continue
		}
		if !isSafeID(entry.Name()) {
			continue
		}
		if direction, ok := scanDirection(s.root, entry.Name()); ok {
			directions = append(directions, direction)
		}
	}
	sort.Slice(directions, func(i, j int) bool {
		if directions[i].Order != directions[j].Order {
			return directions[i].Order < directions[j].Order
		}
		return directions[i].Title < directions[j].Title
	})

	index := domain.QuestionsIndex{Directions: directions}
	s.cache = &index
	s.cachedAt = now
	return index
}

func firstNonEmpty(a, b string) string {
	if strings.TrimSpace(a) != "" {
		return a
	}
	return b
}
