
import { useCallback, useEffect, useRef, useState } from "react";
import type { RunResult, TaskFull, TaskSummary } from "@lib/types";
import { useResizableLayout, DragHandle, HDragHandle } from "@hooks/useResizableLayout";
import { useAppData, pickRandomTasks, type InterviewSession, type AppDataContextValue } from "@hooks/useAppData";
import { fetchTasks, fetchTask, runTests } from "@lib/taskApi";
import InterviewSetupPhase from "./Components/InterviewSetupPhase/InterviewSetupPhase";
import InterviewResultsPhase from "./Components/InterviewResultsPhase/InterviewResultsPhase";
import InterviewLoadingSkeleton from "./Components/InterviewLoadingSkeleton/InterviewLoadingSkeleton";
import InterviewHeader from "./Components/InterviewHeader/InterviewHeader";
import InterviewProgressBar from "./Components/InterviewProgressBar/InterviewProgressBar";
import InterviewTaskHeader from "./Components/InterviewTaskHeader/InterviewTaskHeader";
import InterviewToolbar from "./Components/InterviewToolbar/InterviewToolbar";
import CodeEditor from "@components/CodeEditor";
import TestResults from "@components/TestResults";
import ConditionPanel from "@components/ConditionPanel";

type Phase = "setup" | "running" | "results";

const STORAGE_PREFIX = "it:code:";

export default function InterviewPage() {
  return <InterviewInner />;
}

function InterviewInner() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [allTasks, setAllTasks] = useState<TaskSummary[]>([]);
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [task, setTask] = useState<TaskFull | null>(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [showSolution, setShowSolution] = useState(false);

  const { layout, startDrag, containerRef } = useResizableLayout();
  const app = useAppData();
  const startedRef = useRef(false);

  const getCodeRef = useRef(app.getCode);
  const saveCodeRef = useRef(app.saveCode);
  const markSolvedRef = useRef(app.markSolved);
  const getUsedTaskIdsRef = useRef(app.getUsedTaskIds);
  const saveSessionRef = useRef(app.saveSession);
  getCodeRef.current = app.getCode;
  saveCodeRef.current = app.saveCode;
  markSolvedRef.current = app.markSolved;
  getUsedTaskIdsRef.current = app.getUsedTaskIds;
  saveSessionRef.current = app.saveSession;

  useEffect(() => {
    fetchTasks().then((data) => setAllTasks(data));
  }, []);

  const loadTask = useCallback((taskId: string) => {
    setTask(null);
    setTaskLoading(true);
    setResult(null);
    setShowSolution(false);
    fetchTask(taskId)
      .then((data: TaskFull | null) => {
        setTask(data);
        if (data) {
          const saved = getCodeRef.current(taskId) ?? localStorage.getItem(STORAGE_PREFIX + taskId);
          setCode(saved ?? data.template);
        }
      })
      .finally(() => setTaskLoading(false));
  }, []);

  const startInterview = useCallback(() => {
    if (allTasks.length === 0 || startedRef.current) return;
    startedRef.current = true;

    const count = Math.min(5 + Math.floor(Math.random() * 3), allTasks.length);
    const usedIds = getUsedTaskIdsRef.current();
    const picked = pickRandomTasks(allTasks, count, usedIds);

    setTaskIds(picked);
    setCurrentIndex(0);
    setResults({});
    setPhase("running");
    loadTask(picked[0]);
  }, [allTasks, loadTask]);

  const run = async () => {
    if (!task) return;
    setLoading(true);
    setResult(null);
    localStorage.setItem(STORAGE_PREFIX + task.id, code);
    try {
      const data = await runTests(task.id, code);
      setResult(data);
      setResults((prev) => ({ ...prev, [task.id]: data.passed }));
      if (data.passed) markSolvedRef.current(task.id);
    } catch (e) {
      setResult({
        taskId: task.id,
        passed: false,
        total: 0,
        failed: 0,
        assertions: [],
        stdout: "",
        stderr: String(e),
        durationMs: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentCode = useCallback(() => {
    if (task) {
      localStorage.setItem(STORAGE_PREFIX + task.id, code);
      saveCodeRef.current(task.id, code);
    }
  }, [task, code]);

  const switchTask = useCallback((index: number) => {
    saveCurrentCode();
    setCurrentIndex(index);
    loadTask(taskIds[index]);
  }, [saveCurrentCode, loadTask, taskIds]);

  const goNext = useCallback(() => {
    if (currentIndex + 1 >= taskIds.length) {
      saveCurrentCode();
      const session: InterviewSession = {
        id: Date.now().toString(),
        date: Date.now(),
        taskIds,
        results,
      };
      saveSessionRef.current(session);
      setPhase("results");
    } else {
      switchTask(currentIndex + 1);
    }
  }, [currentIndex, taskIds, results, switchTask, saveCurrentCode]);

  const goPrev = useCallback(() => {
    if (currentIndex === 0) return;
    switchTask(currentIndex - 1);
  }, [currentIndex, switchTask]);

  const finishEarly = useCallback(() => {
    if (confirm("Завершить тренировку досрочно?")) {
      saveCurrentCode();
      const session: InterviewSession = {
        id: Date.now().toString(),
        date: Date.now(),
        taskIds,
        results,
      };
      saveSessionRef.current(session);
      setPhase("results");
    }
  }, [taskIds, results, saveCurrentCode]);

  // ===== SETUP PHASE =====
  if (phase === "setup") {
    return (
      <InterviewSetupPhase
        allTasks={allTasks}
        app={app}
        startInterview={startInterview}
      />
    );
  }

  // ===== RESULTS PHASE =====
  if (phase === "results") {
    return (
      <InterviewResultsPhase
        taskIds={taskIds}
        results={results}
        onNewInterview={() => {
          startedRef.current = false;
          setPhase("setup");
        }}
      />
    );
  }

  // ===== LOADING =====
  if (taskLoading || !task) {
    return <InterviewLoadingSkeleton layout={layout} />;
  }

  // ===== RUNNING PHASE =====
  const passedCount = Object.values(results).filter(Boolean).length;

  return (
    <div className="AppShell">
      <InterviewHeader
        passedCount={passedCount}
        currentIndex={currentIndex}
        taskIds={taskIds}
        finishEarly={finishEarly}
      />

      <InterviewProgressBar
        taskIds={taskIds}
        results={results}
        currentIndex={currentIndex}
        onSwitchTask={switchTask}
      />

      <div className="AppBody" ref={containerRef}>
        <div
          className="LeftPane"
          style={{ width: layout.leftPane, flexShrink: 0 }}
        >
          <InterviewTaskHeader task={task} />
          <ConditionPanel condition={task.condition} hints={[]} />
        </div>

        <DragHandle onMouseDown={(e: React.MouseEvent) => startDrag("leftPane", e)} />

        <div className="RightPane">
          <InterviewToolbar
            loading={loading}
            code={code}
            showSolution={showSolution}
            run={run}
            onToggleSolution={() => setShowSolution((s) => !s)}
            goPrev={goPrev}
            goNext={goNext}
            currentIndex={currentIndex}
            taskIds={taskIds}
          />

          {showSolution && (
            <pre
              style={{
                margin: 0,
                background: "var(--bg)",
                borderBottom: "1px solid var(--border)",
                padding: 12,
                fontSize: 13,
                maxHeight: 200,
                overflow: "auto",
              }}
            >
              <code>{task.solution}</code>
            </pre>
          )}

          <CodeEditor
            value={code}
            onChange={setCode}
            language={task.language === "typescript" ? "typescript" : "javascript"}
          />
          <HDragHandle onMouseDown={(e: React.MouseEvent) => startDrag("resultsHeight", e)} />
          <TestResults result={result} loading={loading} height={layout.resultsHeight} />
        </div>
      </div>
    </div>
  );
}
