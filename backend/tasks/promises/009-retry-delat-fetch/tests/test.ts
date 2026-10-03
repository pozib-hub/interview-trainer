import { test, expect, vi } from "vitest";
import { retry } from "../solution";

test("retry — успех с первой попытки", async () => {
  const cb = vi.fn().mockResolvedValue(undefined);
  await retry(cb, { count: 3, delay: () => 0 });
  expect(cb).toHaveBeenCalledTimes(1);
});

test("retry — успех после ретраев", async () => {
  vi.useFakeTimers();
  let attempt = 0;
  const cb = vi.fn().mockImplementation(() => {
    attempt++;
    if (attempt < 3) return Promise.reject(new Error("fail"));
    return Promise.resolve(undefined);
  });

  const promise = retry(cb, { count: 5, delay: () => 0 });
  await vi.advanceTimersByTimeAsync(100);
  await promise;

  expect(cb).toHaveBeenCalledTimes(3);
  vi.useRealTimers();
});

test("retry — превышение лимита ретраев", async () => {
  vi.useFakeTimers();
  const cb = vi.fn().mockRejectedValue(new Error("fail"));

  const promise = retry(cb, { count: 2, delay: () => 0 });
  await vi.advanceTimersByTimeAsync(100);

  await expect(promise).rejects.toBe("Max retries reached");
  expect(cb).toHaveBeenCalledTimes(3);
  vi.useRealTimers();
});
