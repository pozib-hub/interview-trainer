import { test, expect, vi } from "vitest";
import { debounce } from "../solution";

test("debounce вызывает функцию после задержки", () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  const debounced = debounce(fn, 500);

  debounced();
  expect(fn).not.toHaveBeenCalled();

  vi.advanceTimersByTime(500);
  expect(fn).toHaveBeenCalledTimes(1);

  vi.useRealTimers();
});

test("debounce вызывает только последний вызов", () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  const debounced = debounce(fn, 300);

  debounced("a");
  debounced("b");
  debounced("c");

  vi.advanceTimersByTime(300);
  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith("c");

  vi.useRealTimers();
});

test("debounce передаёт аргументы", () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  const debounced = debounce(fn, 100);

  debounced(42, "hello");
  vi.advanceTimersByTime(100);
  expect(fn).toHaveBeenCalledWith(42, "hello");

  vi.useRealTimers();
});
