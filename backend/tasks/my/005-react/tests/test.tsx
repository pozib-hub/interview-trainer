// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { renderHook, act, render, screen, fireEvent } from "@testing-library/react";
import { useCounter, App } from "../solution";

test("useCounter — начальное состояние", () => {
  const { result } = renderHook(() => useCounter(1000));
  expect(result.current.count).toBe(0);
  expect(typeof result.current.start).toBe("function");
  expect(typeof result.current.stop).toBe("function");
  expect(typeof result.current.onMouseEnter).toBe("function");
  expect(typeof result.current.onMouseLeave).toBe("function");
});

test("start запускает счётчик", async () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useCounter(1000));
  act(() => result.current.start());
  await act(async () => {
    await vi.advanceTimersByTimeAsync(3000);
  });
  expect(result.current.count).toBe(3);
  vi.useRealTimers();
});

test("stop останавливает счётчик", async () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useCounter(1000));
  act(() => result.current.start());
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  act(() => result.current.stop());
  await act(async () => {
    await vi.advanceTimersByTimeAsync(3000);
  });
  expect(result.current.count).toBe(2);
  vi.useRealTimers();
});

test("onMouseEnter замораживает count, onMouseLeave обновляет до актуального", async () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useCounter(1000));
  act(() => result.current.start());
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  expect(result.current.count).toBe(2);

  act(() => result.current.onMouseEnter());
  await act(async () => {
    await vi.advanceTimersByTimeAsync(3000);
  });
  expect(result.current.count).toBe(2);

  act(() => result.current.onMouseLeave());
  expect(result.current.count).toBe(5);
  vi.useRealTimers();
});

test("App отображает count и реагирует на события мыши", async () => {
  vi.useFakeTimers();
  render(<App />);

  expect(screen.getByTestId("count").textContent).toBe("0");

  fireEvent.click(screen.getByText("start"));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  expect(screen.getByTestId("count").textContent).toBe("2");

  fireEvent.mouseEnter(screen.getByTestId("counter-area"));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(3000);
  });
  expect(screen.getByTestId("count").textContent).toBe("2");

  fireEvent.mouseLeave(screen.getByTestId("counter-area"));
  expect(screen.getByTestId("count").textContent).toBe("5");

  fireEvent.click(screen.getByText("stop"));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  expect(screen.getByTestId("count").textContent).toBe("5");
  vi.useRealTimers();
});
