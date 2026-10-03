import { test, expect } from "vitest";
import { range } from "../solution";

test('range([1, 4, 5, 2, 3, 9, 8, 11, 0]) => "0-5,8-9,11"', () => {
  expect(range([1, 4, 5, 2, 3, 9, 8, 11, 0])).toBe("0-5,8-9,11");
});

test('range([1, 4, 3, 2]) => "1-4"', () => {
  expect(range([1, 4, 3, 2])).toBe("1-4");
});

test('range([10, 12, 11, 14, 15, 16]) => "10-12,14-16"', () => {
  expect(range([10, 12, 11, 14, 15, 16])).toBe("10-12,14-16");
});

test('range([]) => ""', () => {
  expect(range([])).toBe("");
});

test('range([1, 2, 2, 3, 4, 6, 7, 9]) => "1-4,6-7,9"', () => {
  expect(range([1, 2, 2, 3, 4, 6, 7, 9])).toBe("1-4,6-7,9");
});

test('range([1, 3, 5, 7, 9]) => "1,3,5,7,9"', () => {
  expect(range([1, 3, 5, 7, 9])).toBe("1,3,5,7,9");
});
