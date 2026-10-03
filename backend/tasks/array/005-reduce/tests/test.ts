import { test, expect } from "vitest";
import "../solution";

test("сумма чисел", () => {
  expect([1, 2, 3, 4].myReduce((acc, x) => acc + x, 0)).toBe(10);
});

test("пустой массив с initial", () => {
  expect([].myReduce((acc, x) => acc + x, 100)).toBe(100);
});

test("конкатенация строк", () => {
  expect(["a", "b", "c"].myReduce((acc, s) => acc + s, "")).toBe("abc");
});

test("построение объекта", () => {
  const result = [{ k: "a", v: 1 }, { k: "b", v: 2 }].myReduce(
    (acc, item) => ({ ...acc, [item.k]: item.v }),
    {} as Record<string, number>
  );
  expect(result).toEqual({ a: 1, b: 2 });
});

test("передаёт index", () => {
  const indices = [10, 20, 30].myReduce(
    (acc, _, i) => [...acc, i],
    [] as number[]
  );
  expect(indices).toEqual([0, 1, 2]);
});

test("максимальное значение", () => {
  expect([3, 7, 2, 9, 1].myReduce((max, x) => (x > max ? x : max), 0)).toBe(9);
});
