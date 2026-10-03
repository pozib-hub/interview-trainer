import { test, expect } from "vitest";
import { flatPolyfill } from "../solution";

test("плоский массив", () => {
  expect(flatPolyfill([1, [2, 3], [4, [5, 6]]])).toEqual([1, 2, 3, 4, 5, 6]);
});

test("без вложенности", () => {
  expect(flatPolyfill([1, 2, 3])).toEqual([1, 2, 3]);
});

test("пустой массив", () => {
  expect(flatPolyfill([])).toEqual([]);
});

test("глубокая вложенность", () => {
  expect(flatPolyfill([1, [2, [3, [4, [5]]]]])).toEqual([1, 2, 3, 4, 5]);
});
