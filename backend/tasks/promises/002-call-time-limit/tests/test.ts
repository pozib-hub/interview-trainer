import { test, expect, vi } from "vitest";
import { asyncLimit, fn, fn2 } from "../solution";

test("asyncLimit — успевает по времени", async () => {
  vi.useFakeTimers();
  const promise = asyncLimit(fn, 150)(5);
  await vi.advanceTimersByTimeAsync(200);
  const result = await promise;
  expect(result).toBe(25);
  vi.useRealTimers();
});

test("asyncLimit — не успевает, reject", async () => {
  vi.useFakeTimers();
  const promise = asyncLimit(fn, 50)(5);
  await vi.advanceTimersByTimeAsync(200);
  await expect(promise).rejects.toThrow("Превышен лимит времени исполнения");
  vi.useRealTimers();
});

test("asyncLimit — fn2 успевает", async () => {
  vi.useFakeTimers();
  const promise = asyncLimit(fn2, 200)(1, 2);
  await vi.advanceTimersByTimeAsync(200);
  const result = await promise;
  expect(result).toBe(3);
  vi.useRealTimers();
});

test("asyncLimit — fn2 не успевает", async () => {
  vi.useFakeTimers();
  const promise = asyncLimit(fn2, 50)(1, 2);
  await vi.advanceTimersByTimeAsync(200);
  await expect(promise).rejects.toThrow();
  vi.useRealTimers();
});
