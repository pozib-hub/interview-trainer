import { test, expect, vi } from "vitest";
import { areDepsEqual, useMemo } from "../solution";

test("areDepsEqual — одинаковые", () => {
  expect(areDepsEqual([1, 2], [1, 2])).toBe(true);
});

test("areDepsEqual — разные", () => {
  expect(areDepsEqual([1, 2], [1, 3])).toBe(false);
});

test("areDepsEqual — разная длина", () => {
  expect(areDepsEqual([1], [1, 2])).toBe(false);
});

test("useMemo — пересчитывает при изменении deps", () => {
  const cb = vi.fn(() => 42);
  const ref = useMemo(cb, [1], null);
  expect(ref.value).toBe(42);

  const ref2 = useMemo(cb, [2], ref);
  expect(ref2.value).toBe(42);
  expect(cb).toHaveBeenCalledTimes(2);
});

test("useMemo — не пересчитывает при тех же deps", () => {
  const cb = vi.fn(() => 42);
  const ref = useMemo(cb, [1], null);
  const ref2 = useMemo(cb, [1], ref);
  expect(ref2.value).toBe(42);
  expect(cb).toHaveBeenCalledTimes(1);
});
