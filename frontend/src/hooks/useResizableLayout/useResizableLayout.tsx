
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface LayoutState {
  sidebar: number;
  leftPane: number;
  resultsHeight: number;
}

const DEFAULTS: LayoutState = {
  sidebar: 280,
  leftPane: 420,
  resultsHeight: 260,
};

const MIN = { sidebar: 180, leftPane: 250, resultsHeight: 80 };
const MAX = { sidebar: 500, leftPane: 800, resultsHeight: 600 };

const STORAGE_KEY = "it:layout";

function loadLayout(): LayoutState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

type DragTarget = "sidebar" | "leftPane" | "resultsHeight" | null;

interface DragState {
  target: DragTarget;
  startX: number;
  startY: number;
  startSidebar: number;
  startLeftPane: number;
  startResultsHeight: number;
}

interface LayoutContextValue {
  layout: LayoutState;
  startDrag: (target: DragTarget, e: React.MouseEvent) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function useResizableLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useResizableLayout must be used within LayoutProvider");
  return ctx;
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setLayout] = useState<LayoutState>(DEFAULTS);
  const dragRef = useRef<DragState | null>(null);
  const layoutRef = useRef<LayoutState>(DEFAULTS);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loaded = loadLayout();
    setLayout(loaded);
    layoutRef.current = loaded;
  }, []);

  const startDrag = useCallback((target: DragTarget, e: React.MouseEvent) => {
    e.preventDefault();
    const current = loadLayout();
    layoutRef.current = current;
    setLayout(current);

    dragRef.current = {
      target,
      startX: e.clientX,
      startY: e.clientY,
      startSidebar: current.sidebar,
      startLeftPane: current.leftPane,
      startResultsHeight: current.resultsHeight,
    };
    document.body.style.cursor =
      target === "resultsHeight" ? "row-resize" : "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    let saveTimer: ReturnType<typeof setTimeout> | null = null;

    const saveLayout = (state: LayoutState) => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {}
      }, 300);
    };

    const onMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const current = layoutRef.current;

      if (drag.target === "sidebar") {
        const w = Math.min(
          MAX.sidebar,
          Math.max(MIN.sidebar, drag.startSidebar + (e.clientX - drag.startX))
        );
        const next = { ...current, sidebar: w };
        layoutRef.current = next;
        setLayout(next);
        saveLayout(next);
      } else if (drag.target === "leftPane") {
        const w = Math.min(
          MAX.leftPane,
          Math.max(MIN.leftPane, drag.startLeftPane + (e.clientX - drag.startX))
        );
        const next = { ...current, leftPane: w };
        layoutRef.current = next;
        setLayout(next);
        saveLayout(next);
      } else if (drag.target === "resultsHeight") {
        const h = Math.min(
          MAX.resultsHeight,
          Math.max(MIN.resultsHeight, drag.startResultsHeight + (drag.startY - e.clientY))
        );
        const next = { ...current, resultsHeight: h };
        layoutRef.current = next;
        setLayout(next);
        saveLayout(next);
      }
    };

    const onUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        if (saveTimer) {
          clearTimeout(saveTimer);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(layoutRef.current));
          } catch {}
        }
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, []);

  return (
    <LayoutContext.Provider value={{ layout, startDrag, containerRef }}>
      {children}
    </LayoutContext.Provider>
  );
}
