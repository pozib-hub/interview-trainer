import { test, expect, vi } from "vitest";
import { throttling } from "../solution";

test("вызывает функцию немедленно при первом вызове", () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  const throttled = throttling(fn, 300);
  throttled();
  expect(fn).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});

test("не вызывает функцию повторно в течение wait", () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  const throttled = throttling(fn, 300);
  throttled();
  throttled();
  throttled();
  expect(fn).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});

test("вызывает снова после истечения wait", () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  const throttled = throttling(fn, 300);
  throttled();
  vi.advanceTimersByTime(300);
  throttled();
  expect(fn).toHaveBeenCalledTimes(2);
  vi.useRealTimers();
});

test("передаёт аргументы", () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  const throttled = throttling(fn, 300);
  throttled("a", "b");
  expect(fn).toHaveBeenCalledWith("a", "b");
  vi.useRealTimers();
});
