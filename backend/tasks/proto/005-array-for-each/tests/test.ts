import { test, expect } from "vitest";
import "../solution";

test("выполняет callback для каждого элемента", () => {
  const arr = [1, 2, 3];
  arr.forEach((val: number, i: number, a: number[]) => (a[i] = val * 2));
  expect(arr).toEqual([2, 4, 6]);
});

test("this внутри callback ссылается на context", () => {
  const arr = [true, true, false, false];
  const context = { context: false };
  arr.forEach(function (this: any, val: any, i: number, a: any[]) {
    a[i] = this;
  }, context);
  expect(arr).toEqual([
    { context: false },
    { context: false },
    { context: false },
    { context: false },
  ]);
});

test("инвертация булевых значений", () => {
  const arr = [true, true, false, false];
  const context = { context: 5 };
  arr.forEach((val: boolean, i: number, a: boolean[]) => (a[i] = !val), context);
  expect(arr).toEqual([false, false, true, true]);
});

test("передаёт value, index и array", () => {
  const arr = [10, 20, 30];
  const calls: Array<[number, number, number[]]> = [];
  arr.forEach(
    (val: number, i: number, a: number[]) => calls.push([val, i, a]),
    {}
  );
  expect(calls).toEqual([
    [10, 0, arr],
    [20, 1, arr],
    [30, 2, arr],
  ]);
});

test("пустой массив — callback не вызывается", () => {
  const arr: number[] = [];
  let count = 0;
  arr.forEach(() => count++, {});
  expect(count).toBe(0);
});

test("ничего не возвращает", () => {
  const arr = [1, 2, 3];
  const result = arr.forEach(() => {}, {});
  expect(result).toBeUndefined();
});

test("большой массив", () => {
  const arr = Array.from({ length: 1000 }, (_, i) => i);
  let sum = 0;
  arr.forEach((val: number) => (sum += val), {});
  expect(sum).toBe(499500);
});

test("forEach заменён на собственную реализацию, не нативную", () => {
  expect(Array.prototype.forEach.toString()).not.toContain("[native code]");
});
