
import { lazy, Suspense } from "react";
import classNames from "@shared/lib/classNames";
import { useTheme } from "@hooks/useTheme";
import styles from "./CodeEditor.module.css";
import EditorSkeleton from "./Components/EditorSkeleton/EditorSkeleton";

const cx = classNames.bind(styles);
const MonacoEditor = lazy(() => import("@monaco-editor/react"));

interface ICodeEditorProps {
  value: string;
  onChange: (v: string) => void;
  language?: string;
  readOnly?: boolean;
}

export default function CodeEditor(props: ICodeEditorProps) {
  const { value, onChange, language = "typescript", readOnly = false } = props;
  const { theme } = useTheme();

  return (
    <div className={cx("EditorWrap")}>
      <Suspense fallback={<EditorSkeleton />}>
        <MonacoEditor
          height="100%"
          language={language}
          theme={theme === "dark" ? "vs-dark" : "vs"}
          value={value}
          onChange={(v) => onChange(v ?? "")}
          loading={<EditorSkeleton />}
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            tabSize: 2,
            automaticLayout: true,
            fontFamily: "'SF Mono', Monaco, Menlo, monospace",
            lineNumbers: "on",
            padding: { top: 12 },
            readOnly,
          }}
        />
      </Suspense>
    </div>
  );
}
