import { test, expect } from "vitest";
import { areDepsEqual, useCallback } from "../solution";

test("areDepsEqual — одинаковые массивы", () => {
  expect(areDepsEqual([1, 2, 3], [1, 2, 3])).toBe(true);
});

test("areDepsEqual — разные массивы", () => {
  expect(areDepsEqual([1, 2, 3], [1, 2, 4])).toBe(false);
});

test("areDepsEqual — разная длина", () => {
  expect(areDepsEqual([1, 2], [1, 2, 3])).toBe(false);
});

test("areDepsEqual — пустые массивы", () => {
  expect(areDepsEqual([], [])).toBe(true);
});

test("areDepsEqual — Object.is для NaN", () => {
  expect(areDepsEqual([NaN], [NaN])).toBe(true);
});

test("useCallback — обновляет при изменении deps", () => {
  const fn1 = () => 1;
  const fn2 = () => 2;
  const ref = useCallback(fn1, [1], null);
  expect(ref?.callback).toBe(fn1);

  const ref2 = useCallback(fn2, [2], ref);
  expect(ref2?.callback).toBe(fn2);
});

test("useCallback — не обновляет при тех же deps", () => {
  const fn1 = () => 1;
  const fn2 = () => 2;
  const ref = useCallback(fn1, [1], null);
  const ref2 = useCallback(fn2, [1], ref);
  expect(ref2?.callback).toBe(fn1);
});
