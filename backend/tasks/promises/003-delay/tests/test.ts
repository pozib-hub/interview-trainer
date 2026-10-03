import { test, expect, vi } from "vitest";
import { delay } from "../solution";

test("delay возвращает Promise", () => {
  expect(delay(100)).toBeInstanceOf(Promise);
});

test("delay резолвится через ms", async () => {
  vi.useFakeTimers();
  const spy = vi.fn();
  delay(500).then(spy);

  vi.advanceTimersByTime(499);
  expect(spy).not.toHaveBeenCalled();

  vi.advanceTimersByTime(1);
  await vi.advanceTimersByTimeAsync(0);
  expect(spy).toHaveBeenCalled();

  vi.useRealTimers();
});

test("delay(0) резолвится", async () => {
  await delay(0);
  expect(true).toBe(true);
});
