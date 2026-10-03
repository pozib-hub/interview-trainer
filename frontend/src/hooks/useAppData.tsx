
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "@lib/fetchApi";
import { initialReview, isDue, nextReview, type ReviewState } from "@lib/review";

export interface InterviewSession {
  id: string;
  date: number;
  taskIds: string[];
  results: Record<string, boolean>;
}

export interface AppData {
  solved: string[];
  sessions: InterviewSession[];
  code: Record<string, string>;
  layout: { sidebar: number; leftPane: number };
  solvedDates: Record<string, number>;
  reviews: Record<string, ReviewState>;
}

const LS_KEYS = {
  solved: "it:solved",
  sessions: "it:interview-history",
  layout: "it:layout",
  solvedDates: "it:solved-dates",
  reviews: "it:reviews",
};

function loadFromStorage(): AppData {
  let solved: string[] = [];
  let sessions: InterviewSession[] = [];
  let layout = { sidebar: 280, leftPane: 420 };
  let solvedDates: Record<string, number> = {};
  let reviews: Record<string, ReviewState> = {};
  const code: Record<string, string> = {};

  try {
    const raw = localStorage.getItem(LS_KEYS.solved);
    if (raw) solved = JSON.parse(raw);
  } catch {}
  try {
    const raw = localStorage.getItem(LS_KEYS.sessions);
    if (raw) sessions = JSON.parse(raw);
  } catch {}
  try {
    const raw = localStorage.getItem(LS_KEYS.layout);
    if (raw) layout = { ...layout, ...JSON.parse(raw) };
  } catch {}
  try {
    const raw = localStorage.getItem(LS_KEYS.solvedDates);
    if (raw) solvedDates = JSON.parse(raw);
  } catch {}
  try {
    const raw = localStorage.getItem(LS_KEYS.reviews);
    if (raw) reviews = JSON.parse(raw);
  } catch {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("it:code:")) {
        code[key.replace("it:code:", "")] = localStorage.getItem(key)!;
      }
    }
  } catch {}

  return { solved, sessions, code, layout, solvedDates, reviews };
}

function saveToStorage(data: Partial<AppData>) {
  if (data.solved !== undefined)
    localStorage.setItem(LS_KEYS.solved, JSON.stringify(data.solved));
  if (data.sessions !== undefined)
    localStorage.setItem(LS_KEYS.sessions, JSON.stringify(data.sessions));
  if (data.layout !== undefined)
    localStorage.setItem(LS_KEYS.layout, JSON.stringify(data.layout));
  if (data.solvedDates !== undefined)
    localStorage.setItem(LS_KEYS.solvedDates, JSON.stringify(data.solvedDates));
  if (data.reviews !== undefined)
    localStorage.setItem(LS_KEYS.reviews, JSON.stringify(data.reviews));
  if (data.code !== undefined) {
    for (const [id, val] of Object.entries(data.code)) {
      localStorage.setItem("it:code:" + id, val);
    }
  }
}

export interface AppDataContextValue {
  data: AppData | null;
  loaded: boolean;
  solvedList: string[];
  isSolved: (taskId: string) => boolean;
  toggleSolved: (taskId: string) => void;
  markSolved: (taskId: string) => void;
  clearSolved: () => void;
  sessions: InterviewSession[];
  saveSession: (session: InterviewSession) => void;
  getUsedTaskIds: () => Set<string>;
  clearHistory: () => void;
  saveCode: (taskId: string, code: string) => void;
  getCode: (taskId: string) => string | undefined;
  reviews: Record<string, ReviewState>;
  isReviewDue: (taskId: string) => boolean;
  dueReviewIds: string[];
  completeReview: (taskId: string, passed: boolean) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

/**
 * Объединяет сессии из двух источников по id, отдавая предпочтение более свежей.
 */
function mergeSessions(a: InterviewSession[], b: InterviewSession[]): InterviewSession[] {
  const map = new Map<string, InterviewSession>();
  for (const s of [...a, ...b]) {
    const existing = map.get(s.id);
    if (!existing || s.date > existing.date) map.set(s.id, s);
  }
  return Array.from(map.values()).sort((x, y) => y.date - x.date);
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

const EMPTY_DATA: AppData = {
  solved: [],
  sessions: [],
  code: {},
  layout: { sidebar: 280, leftPane: 420 },
  solvedDates: {},
  reviews: {},
};

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPatch = useRef<Partial<AppData>>({});

  // Ref to always access latest data without re-creating callbacks
  const dataRef = useRef<AppData>(EMPTY_DATA);
  dataRef.current = data ?? EMPTY_DATA;

  useEffect(() => {
    (async () => {
      const local = loadFromStorage();
      try {
        const res = await apiFetch("/api/data");
        if (res.ok) {
          const server = (await res.json()) as AppData;
          // Union merge: combine both sides without losing data
          const solvedDates: Record<string, number> = { ...server.solvedDates };
          for (const [id, at] of Object.entries(local.solvedDates ?? {})) {
            if (!solvedDates[id] || at > solvedDates[id]) solvedDates[id] = at;
          }
          const reviews: Record<string, ReviewState> = { ...server.reviews };
          for (const [id, r] of Object.entries(local.reviews ?? {})) {
            if (!reviews[id] || r.due > reviews[id].due) reviews[id] = r;
          }
          const merged: AppData = {
            solved: Array.from(new Set([...server.solved, ...local.solved])),
            sessions: mergeSessions(server.sessions, local.sessions),
            code: { ...server.code, ...local.code },
            layout: server.layout ?? local.layout,
            solvedDates,
            reviews,
          };
          setData(merged);
          dataRef.current = merged;
          saveToStorage(merged);
          // Push merged state back to server if it differs
          if (
            merged.solved.length > server.solved.length ||
            merged.sessions.length > server.sessions.length ||
            Object.keys(merged.code).length > Object.keys(server.code).length ||
            Object.keys(merged.solvedDates).length > Object.keys(server.solvedDates ?? {}).length ||
            Object.keys(merged.reviews).length > Object.keys(server.reviews ?? {}).length
          ) {
            apiFetch("/api/data", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(merged),
            });
          }
        } else {
          setData(local);
          dataRef.current = local;
        }
      } catch {
        setData(local);
        dataRef.current = local;
      }
      setLoaded(true);
    })();
  }, []);

  const scheduleSync = useCallback(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      if (Object.keys(pendingPatch.current).length === 0) return;
      apiFetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingPatch.current),
      }).catch(() => {});
      pendingPatch.current = {};
    }, 800);
  }, []);

  // All callbacks below use dataRef instead of [data] dependency
  // → stable identity → no cascading re-renders

  const toggleSolved = useCallback(
    (taskId: string) => {
      const prev = dataRef.current;
      const set = new Set(prev.solved);
      if (set.has(taskId)) set.delete(taskId);
      else set.add(taskId);
      const solved = [...set];
      let solvedDates = prev.solvedDates;
      let reviews = prev.reviews;
      if (set.has(taskId)) {
        solvedDates = { ...prev.solvedDates, [taskId]: Date.now() };
        if (!reviews[taskId]) {
          reviews = { ...prev.reviews, [taskId]: initialReview() };
        }
      } else {
        const { [taskId]: _drop, ...rest } = prev.solvedDates;
        solvedDates = rest;
        const { [taskId]: _dropReview, ...restReviews } = prev.reviews;
        reviews = restReviews;
      }
      saveToStorage({ solved, solvedDates, reviews });
      pendingPatch.current = { ...pendingPatch.current, solved, solvedDates, reviews };
      setData({ ...prev, solved, solvedDates, reviews });
      scheduleSync();
    },
    [scheduleSync]
  );

  const markSolved = useCallback(
    (taskId: string) => {
      const prev = dataRef.current;
      if (prev.solved.includes(taskId)) return;
      const solved = [...prev.solved, taskId];
      const solvedDates = { ...prev.solvedDates, [taskId]: Date.now() };
      const reviews = prev.reviews[taskId]
        ? prev.reviews
        : { ...prev.reviews, [taskId]: initialReview() };
      saveToStorage({ solved, solvedDates, reviews });
      pendingPatch.current = { ...pendingPatch.current, solved, solvedDates, reviews };
      setData({ ...prev, solved, solvedDates, reviews });
      scheduleSync();
    },
    [scheduleSync]
  );

  const isSolved = useCallback(
    (taskId: string) => dataRef.current.solved.includes(taskId),
    []
  );

  const clearSolved = useCallback(() => {
    const prev = dataRef.current;
    saveToStorage({ solved: [], solvedDates: {}, reviews: {} });
    pendingPatch.current = { ...pendingPatch.current, solved: [], solvedDates: {}, reviews: {} };
    setData({ ...prev, solved: [], solvedDates: {}, reviews: {} });
    scheduleSync();
  }, [scheduleSync]);

  const saveSession = useCallback(
    (session: InterviewSession) => {
      const prev = dataRef.current;
      const sessions = [session, ...prev.sessions].slice(0, 50);
      saveToStorage({ sessions });
      pendingPatch.current = { ...pendingPatch.current, sessions };
      setData({ ...prev, sessions });
      scheduleSync();
    },
    [scheduleSync]
  );

  const getUsedTaskIds = useCallback((): Set<string> => {
    const used = new Set<string>();
    for (const s of dataRef.current.sessions) {
      for (const id of s.taskIds) used.add(id);
    }
    return used;
  }, []);

  const clearHistory = useCallback(() => {
    const prev = dataRef.current;
    saveToStorage({ sessions: [] });
    pendingPatch.current = { ...pendingPatch.current, sessions: [] };
    setData({ ...prev, sessions: [] });
    scheduleSync();
  }, [scheduleSync]);

  const saveCode = useCallback((taskId: string, code: string) => {
    const prev = dataRef.current;
    localStorage.setItem("it:code:" + taskId, code);
    setData({ ...prev, code: { ...prev.code, [taskId]: code } });
  }, []);

  const getCode = useCallback(
    (taskId: string): string | undefined => dataRef.current.code[taskId],
    []
  );

  const isReviewDue = useCallback(
    (taskId: string) => isDue(dataRef.current.reviews[taskId]),
    []
  );

  const dueReviewIds = useMemo(
    () => Object.keys(data?.reviews ?? {}).filter((id) => isDue(data!.reviews[id])),
    [data],
  );

  const completeReview = useCallback(
    (taskId: string, passed: boolean) => {
      const prev = dataRef.current;
      const cur = prev.reviews[taskId];
      if (!cur || !isDue(cur)) return;
      const reviews = { ...prev.reviews, [taskId]: nextReview(cur, passed) };
      saveToStorage({ reviews });
      pendingPatch.current = { ...pendingPatch.current, reviews };
      setData({ ...prev, reviews });
      scheduleSync();
    },
    [scheduleSync]
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      data,
      loaded,
      solvedList: data?.solved ?? [],
      isSolved,
      toggleSolved,
      markSolved,
      clearSolved,
      sessions: data?.sessions ?? [],
      saveSession,
      getUsedTaskIds,
      clearHistory,
      saveCode,
      getCode,
      reviews: data?.reviews ?? {},
      isReviewDue,
      dueReviewIds,
      completeReview,
    }),
    [data, loaded, isSolved, toggleSolved, markSolved, clearSolved, saveSession, getUsedTaskIds, clearHistory, saveCode, getCode]
  );

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function pickRandomTasks(
  allTasks: { id: string }[],
  count: number,
  excludeIds: Set<string>
): string[] {
  function fisherYatesShuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const available = allTasks.filter((t) => !excludeIds.has(t.id));

  if (available.length < count) {
    const used = available.map((t) => t.id);
    const pool = allTasks.filter((t) => !used.includes(t.id));
    const shuffled = fisherYatesShuffle([...available, ...pool]);
    return shuffled.slice(0, Math.min(count, allTasks.length)).map((t) => t.id);
  }

  const shuffled = fisherYatesShuffle(available);
  return shuffled.slice(0, count).map((t) => t.id);
}
