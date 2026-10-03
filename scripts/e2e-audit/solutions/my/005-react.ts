import { useEffect, useRef, useState } from "react";

export function useCounter(intervalMs: number = 1000) {
  const [count, setCount] = useState(0);
  const internalCountRef = useRef(0);
  const pausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const start = () => {
    if (timerRef.current === null) {
      timerRef.current = setInterval(() => {
        internalCountRef.current += 1;
        if (!pausedRef.current) {
          setCount(internalCountRef.current);
        }
      }, intervalMs);
    }
  };

  const stop = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const onMouseEnter = () => {
    pausedRef.current = true;
  };

  const onMouseLeave = () => {
    pausedRef.current = false;
    setCount(internalCountRef.current);
  };

  return { count, start, stop, onMouseEnter, onMouseLeave };
}

export function App() {
  const { count, start, stop, onMouseEnter, onMouseLeave } = useCounter(1000);
  return (
    <div
      data-testid="counter-area"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span data-testid="count">{count}</span>
      <button onClick={start}>start</button>
      <button onClick={stop}>stop</button>
    </div>
  );
}
