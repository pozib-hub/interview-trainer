
import type { RunResult } from "@lib/types";
import classNames from "@shared/lib/classNames";
import { Spinner } from "@ui/index";
import styles from "./TestResults.module.css";

const cx = classNames.bind(styles);

interface ITestResultsProps {
  result: RunResult | null;
  loading: boolean;
  height?: number;
}

function TestResults(props: ITestResultsProps) {
  const { result, loading, height = 260 } = props;

  if (loading) {
    return (
      <div className={cx("resultsPanel")} style={{ height, flexShrink: 0 }}>
        <div className={cx("resultsSummary")}>
          <Spinner mr={8} />
          Запуск тестов…
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={cx("ResultsPanel")} style={{ height, flexShrink: 0 }}>
        <div
          className={cx("ResultsSummary")}
          style={{ color: "var(--text-muted)" }}
        >
          Нажмите «Запустить тесты», чтобы проверить решение
        </div>
      </div>
    );
  }

  return (
    <div className={cx("ResultsPanel")} style={{ height, flexShrink: 0 }}>
      <div
        className={cx("ResultsSummary", {
          ResultsSummaryOk: result.passed,
          ResultsSummaryFail: !result.passed,
        })}
      >
        {result.passed
          ? `✓ Все тесты пройдены (${result.total})`
          : `✗ Провалено: ${result.failed} из ${result.total}`}
        <span
          style={{
            float: "right",
            color: "var(--text-muted)",
            fontWeight: 400,
          }}
        >
          {result.durationMs} мс
        </span>
      </div>
      {!result.passed && result.total === 0 && (
        <div className={cx("NoTestsHint")}>
          Тесты не запустились: код не скомпилировался или не был найден ни один
          тест. Обычно причина — синтаксическая ошибка или отсутствующий
          экспорт.
        </div>
      )}
      {result.assertions.map((a, i) => (
        <div
          key={i}
          className={cx("ResultItem", {
            ResultItemPassed: a.passed,
            ResultItemFailed: !a.passed,
          })}
        >
          {a.passed ? "✓" : "✗"} {a.name}
          {a.message && <div className={cx("ResultItemMsg")}>{a.message}</div>}
        </div>
      ))}
      {result.stderr && (
        <div className={cx("StderrBlock")}>
          <div className={cx("StderrTitle")}>Вывод процесса:</div>
          {result.stderr}
        </div>
      )}
    </div>
  );
}

export default TestResults;
