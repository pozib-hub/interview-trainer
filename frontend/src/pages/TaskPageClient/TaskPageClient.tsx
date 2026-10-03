
import { useEffect, useRef, useState } from "react";
import type { RunResult, TaskFull } from "@lib/types";
import CodeEditor from "@components/CodeEditor";
import TestResults from "@components/TestResults";
import HintPanel from "@components/HintPanel";
import {
  useResizableLayout,
  DragHandle,
  HDragHandle,
} from "@hooks/useResizableLayout";
import { useAppData } from "@hooks/useAppData";
import { fetchTask, runTests, requestHint, requestReview } from "@lib/taskApi";
import type { TaskReview } from "@lib/types";
import ReviewModal from "@components/ReviewModal";
import TaskLoadingSkeleton from "./Components/TaskLoadingSkeleton/TaskLoadingSkeleton";
import TaskConditionView from "./Components/TaskConditionView/TaskConditionView";
import TaskToolbar from "./Components/TaskToolbar/TaskToolbar";
import TaskTabs from "./Components/TaskTabs/TaskTabs";
import TaskSolutionView from "./Components/TaskSolutionView/TaskSolutionView";

const STORAGE_PREFIX = "it:code:";

export default function TaskPageClient({ taskId }: { taskId: string }) {
  const [task, setTask] = useState<TaskFull | null>(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(true);
  const [tab, setTab] = useState<"condition" | "solution">("condition");
  const [showSolution, setShowSolution] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState("");
  const [review, setReview] = useState<TaskReview | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);

  const { layout, startDrag } = useResizableLayout();
  const app = useAppData();

  const saveCodeRef = useRef(app.saveCode);
  saveCodeRef.current = app.saveCode;

  const codeRef = useRef(code);
  const taskIdRef = useRef(taskId);
  codeRef.current = code;
  taskIdRef.current = taskId;

  useEffect(() => {
    return () => {
      const id = taskIdRef.current;
      const c = codeRef.current;
      if (c) {
        localStorage.setItem(STORAGE_PREFIX + id, c);
        saveCodeRef.current(id, c);
      }
    };
  }, []);

  useEffect(() => {
    setTask(null);
    setTaskLoading(true);
    setResult(null);
    setTab("condition");
    setShowSolution(false);
    setHints([]);
    setHintError("");
    setReview(null);
    setReviewError("");
    setReviewOpen(false);
    fetchTask(taskId)
      .then((data) => {
        setTask(data);
        if (data) {
          const saved = localStorage.getItem(STORAGE_PREFIX + taskId);
          setCode(saved ?? data.template);
        }
      })
      .finally(() => setTaskLoading(false));
  }, [taskId]);

  const run = async () => {
    if (!task) return;
    setLoading(true);
    setResult(null);
    localStorage.setItem(STORAGE_PREFIX + taskId, code);
    try {
      const data = await runTests(taskId, code);
      setResult(data);
      if (data.passed) {
        app.markSolved(taskId);
        app.saveCode(taskId, code);
      }
    } catch (e) {
      setResult({
        taskId,
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

  const reset = () => {
    if (!task) return;
    if (confirm("Сбросить код к шаблону?")) {
      setCode(task.template);
      localStorage.removeItem(STORAGE_PREFIX + taskId);
    }
  };

  const askHint = async () => {
    if (!task || hintLoading) return;
    setHintLoading(true);
    setHintError("");
    const res = await requestHint(taskId, code, hints);
    if ("error" in res && res.error) {
      setHintError(res.error);
    } else if ("hint" in res && res.hint) {
      setHints((prev) => [...prev, res.hint]);
    }
    setHintLoading(false);
  };

  const askReview = async () => {
    if (reviewLoading) return;
    setReviewLoading(true);
    setReviewError("");
    setReviewOpen(true);
    setReview(null);
    const res = await requestReview(taskId, code);
    if ("error" in res && res.error) {
      setReviewError(res.error);
    } else if (!("error" in res)) {
      setReview(res);
    }
    setReviewLoading(false);
  };

  if (taskLoading || !task) {
    return <TaskLoadingSkeleton layout={layout} />;
  }

  const isTaskSolved = app.isSolved(taskId);

  return (
    <div className="Workspace">
      <div
        className="LeftPane"
        style={{ width: layout.leftPane, flexShrink: 0 }}
      >
        <TaskTabs
          tab={tab}
          onSetTab={setTab}
          isTaskSolved={isTaskSolved}
          onToggleSolved={() => app.toggleSolved(taskId)}
        />
        {tab === "condition" ? (
          <TaskConditionView task={task} />
        ) : (
          <TaskSolutionView
            showSolution={showSolution}
            onToggleSolution={() => setShowSolution((s) => !s)}
            solution={task.solution}
          />
        )}
      </div>

      <DragHandle
        onMouseDown={(e: React.MouseEvent) => startDrag("leftPane", e)}
      />

      <div className="RightPane">
        <TaskToolbar
          loading={loading}
          code={code}
          run={run}
          reset={reset}
          language={task.language}
          hintLoading={hintLoading}
          onHint={askHint}
        />
        <CodeEditor
          value={code}
          onChange={setCode}
          language={task.language === "javascript" ? "javascript" : "typescript"}
        />
        <HintPanel hints={hints} loading={hintLoading} error={hintError} />
        <HDragHandle
          onMouseDown={(e: React.MouseEvent) => startDrag("resultsHeight", e)}
        />
        <TestResults
          result={result}
          loading={loading}
          height={layout.resultsHeight}
          onReview={askReview}
          reviewLoading={reviewLoading}
        />
      </div>
      <ReviewModal
        open={reviewOpen}
        loading={reviewLoading}
        error={reviewError}
        review={review}
        onClose={() => setReviewOpen(false)}
      />
    </div>
  );
}
