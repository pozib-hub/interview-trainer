import { test, expect } from "vitest";
import { areDepsEqual, getBigRandomList, calculateVisibleItems } from "../solution";

test("areDepsEqual — одинаковые", () => {
  expect(areDepsEqual([1, 2], [1, 2])).toBe(true);
});

test("areDepsEqual — разные", () => {
  expect(areDepsEqual([1, 2], [3, 4])).toBe(false);
});

test("getBigRandomList возвращает 1000 элементов", () => {
  const list = getBigRandomList();
  expect(list.length).toBe(1000);
});

test("getBigRandomList — значения в диапазоне 0-1", () => {
  const list = getBigRandomList();
  for (const v of list) {
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  }
});

test("calculateVisibleItems — начальная позиция", () => {
  const result = calculateVisibleItems(0, 32, 648, 1000);
  expect(result.start).toBe(0);
  expect(result.end).toBe(Math.min(999, Math.ceil(648 / 32)));
});

test("calculateVisibleItems — прокрутка", () => {
  const result = calculateVisibleItems(320, 32, 648, 1000);
  expect(result.start).toBe(10);
});
