import { test, expect } from "vitest";
import { fn } from "../solution";

test("перемещает нули в конец", () => {
  expect(fn([7, 3, 0, 0, 0, 2, 4, 0, 5, 19])).toEqual([7, 3, 2, 4, 5, 19, 0, 0, 0, 0]);
});

test("без нулей", () => {
  expect(fn([1, 2, 3])).toEqual([1, 2, 3]);
});

test("только нули", () => {
  expect(fn([0, 0, 0])).toEqual([0, 0, 0]);
});

test("пустой массив", () => {
  expect(fn([])).toEqual([]);
});
