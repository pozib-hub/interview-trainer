import { test, expect, vi } from "vitest";
import { memo, pow } from "../solution";

test("memoized(4) => 16", () => {
  const memoized = memo(pow);
  expect(memoized(4)).toBe(16);
});

test("memo возвращает из кеша", () => {
  const fn = vi.fn((a: number) => a * a);
  const memoized = memo(fn);

  memoized(4);
  memoized(4);

  expect(fn).toHaveBeenCalledTimes(1);
  expect(memoized(4)).toBe(16);
});

test("memo(5) => 25", () => {
  const memoized = memo(pow);
  expect(memoized(5)).toBe(25);
});

test("memo с разными аргументами", () => {
  const fn = vi.fn((a: number, b: number) => a + b);
  const memoized = memo(fn);

  memoized(1, 2);
  memoized(1, 2);
  memoized(3, 2);

  expect(fn).toHaveBeenCalledTimes(2);
});
