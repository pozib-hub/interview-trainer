
import { useState } from "react";
import classNames from "@shared/lib/classNames";
import { renderMarkdown } from "@shared/lib/renderMarkdown";
import { Box, Button } from "@ui/index";
import styles from "./ConditionPanel.module.css";

const cx = classNames.bind(styles);

interface IConditionPanelProps {
  condition: string;
  hints: string[];
}

function ConditionPanel(props: IConditionPanelProps) {
  const { condition, hints } = props;
  const [hintIndex, setHintIndex] = useState(-1);

  return (
    <div className={cx("Condition")} style={{ paddingTop: 12 }}>
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(condition) }} />
      {hints.length > 0 && (
        <Box mt={20}>
          <Button
            size="sm"
            onClick={() =>
              setHintIndex((i) => (i >= hints.length - 1 ? i : i + 1))
            }
            disabled={hintIndex >= hints.length - 1}
          >
            {hintIndex < 0 ? "Показать подсказку" : "Следующая подсказка"}
          </Button>
          {hintIndex >= 0 &&
            hints.slice(0, hintIndex + 1).map((h, i) => (
              <Box key={i} className={cx("HintBlock")}>
                <strong style={{ color: "var(--yellow)" }}>
                  Подсказка {i + 1}:
                </strong>
                <Box mt={6}>
                  <div
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(h) }}
                  />
                </Box>
              </Box>
            ))}
        </Box>
      )}
    </div>
  );
}

export default ConditionPanel;
