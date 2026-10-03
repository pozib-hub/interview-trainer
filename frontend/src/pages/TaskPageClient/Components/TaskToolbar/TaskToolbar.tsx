
import { Button, Spinner } from "@ui/index";

interface ITaskToolbarProps {
  loading: boolean;
  code: string;
  run: () => void;
  reset: () => void;
  language: string;
  hintLoading: boolean;
  onHint: () => void;
}

function TaskToolbar(props: ITaskToolbarProps) {
  const { loading, code, run, reset, language, hintLoading, onHint } = props;

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "8px 12px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}
    >
      <Button variant="primary" onClick={run} disabled={loading || !code.trim()}>
        {loading ? "Запуск…" : "▶ Запустить тесты"}
      </Button>
      <Button onClick={onHint} disabled={hintLoading || !code.trim()} title="Подсказка от ИИ: подтолкнёт к решению, не решая за тебя">
        {hintLoading ? <>Подсказка… <Spinner style={{ marginLeft: 6 }} /></> : "🤖 Подсказка"}
      </Button>
      <Button onClick={reset}>
        Сбросить
      </Button>
      <span
        style={{
          alignSelf: "center",
          color: "var(--text-muted)",
          fontSize: 12,
        }}
      >
        {language}
      </span>
    </div>
  );
}

export default TaskToolbar;
