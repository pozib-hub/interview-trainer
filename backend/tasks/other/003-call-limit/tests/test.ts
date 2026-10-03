import { test, expect, vi } from "vitest";
import { callLimit } from "../solution";

test("вызывает fn до лимита", () => {
  const fn = vi.fn();
  const limited = callLimit(fn, 3);

  limited();
  limited();
  limited();

  expect(fn).toHaveBeenCalledTimes(3);
});

test("после лимита вызывает callback", async () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  const cb = vi.fn();
  const limited = callLimit(fn, 2, cb);

  limited();
  limited();
  limited();

  expect(fn).toHaveBeenCalledTimes(2);
  await vi.advanceTimersByTimeAsync(0);
  expect(cb).toHaveBeenCalledTimes(1);

  vi.useRealTimers();
});

test("reset сбрасывает лимит", () => {
  const fn = vi.fn();
  const limited = callLimit(fn, 2);

  limited();
  limited();
  limited.reset();
  limited();

  expect(fn).toHaveBeenCalledTimes(3);
});
