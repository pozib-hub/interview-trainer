package domain

import "sort"

func MergeAppData(account, guest AppData) AppData {
	solvedSet := make(map[string]struct{}, len(account.Solved)+len(guest.Solved))
	for _, id := range account.Solved {
		solvedSet[id] = struct{}{}
	}
	for _, id := range guest.Solved {
		solvedSet[id] = struct{}{}
	}
	solved := make([]string, 0, len(solvedSet))
	for id := range solvedSet {
		solved = append(solved, id)
	}
	sort.Strings(solved)

	sessionsById := make(map[string]InterviewSession, len(account.Sessions)+len(guest.Sessions))
	for _, s := range append(append([]InterviewSession{}, account.Sessions...), guest.Sessions...) {
		if existing, ok := sessionsById[s.ID]; !ok || s.Date > existing.Date {
			sessionsById[s.ID] = s
		}
	}
	sessions := make([]InterviewSession, 0, len(sessionsById))
	for _, s := range sessionsById {
		sessions = append(sessions, s)
	}
	sort.Slice(sessions, func(i, j int) bool { return sessions[i].Date > sessions[j].Date })

	code := make(map[string]string, len(account.Code)+len(guest.Code))
	for id, c := range account.Code {
		code[id] = c
	}
	for id, c := range guest.Code {
		code[id] = c
	}

	return AppData{
		Solved:   solved,
		Sessions: sessions,
		Code:     code,
		Layout:   guest.Layout,
	}
}
