import { test, expect, vi } from "vitest";
import { counter, memo, memoizeSum, sum, getOrder } from "../solution";

test("counter возвращает 1, 2, 3", () => {
  const c = (() => {
    let count = 0;
    return () => ++count;
  })();
  expect(c()).toBe(1);
  expect(c()).toBe(2);
  expect(c()).toBe(3);
});

test("memo кеширует результат", () => {
  const fn = vi.fn((a: number, b: number) => a + b);
  const memoized = memo(fn);

  memoized(1, 2);
  memoized(1, 2);
  memoized(3, 4);

  expect(fn).toHaveBeenCalledTimes(2);
});

test("memoizeSum кеширует повторные вызовы", () => {
  const result1 = memoizeSum(1, 2, 3);
  expect(result1).toBe(6);

  const result2 = memoizeSum(3, 2, 1);
  expect(result2).toBe(6);

  const result3 = memoizeSum(1, 2, 3);
  expect(result3).toBe(6);
});

test("порядок вывода: 5, 3, 1, 2, 4", () => {
  expect(getOrder()).toEqual([5, 3, 1, 2, 4]);
});
