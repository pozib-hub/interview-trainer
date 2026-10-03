import { test, expect } from "vitest";
import { intersection, intersection2 } from "../solution";

test("пересечение интервалов", () => {
  expect(
    intersection(
      [[8, 12], [17, 22]],
      [[5, 11], [14, 18], [20, 23]]
    )
  ).toEqual([[8, 11], [17, 18], [20, 22]]);
});

test("нет пересечений", () => {
  expect(intersection([[1, 2]], [[5, 6]])).toEqual([]);
});

test("intersection2 — то же поведение", () => {
  expect(
    intersection2(
      [[8, 12], [17, 22]],
      [[5, 11], [14, 18], [20, 23]]
    )
  ).toEqual([[8, 11], [17, 18], [20, 22]]);
});

test("intersection2 — нет пересечений", () => {
  expect(intersection2([[1, 2]], [[5, 6]])).toEqual([]);
});
