import { test, expect } from "vitest";
import { sum, x2, curry, curry2 } from "../solution";

test("curry — все аргументы сразу", () => {
  expect(curry(sum)(1, 2, 3)).toBe(6);
});

test("curry — частичный вызов", () => {
  expect(curry(sum)(1, 2)(3)).toBe(6);
});

test("curry — по одному", () => {
  expect(curry(sum)(1)(2)(3)).toBe(6);
});

test("curry — двухаргументная функция", () => {
  expect(curry(x2)(5, 7)).toBe(12);
  expect(curry(x2)(5)(7)).toBe(12);
});

test("curry2 — по одному", () => {
  expect(curry2(sum)(1)(2)(3)).toBe(6);
});

test("curry2 — все сразу", () => {
  expect(curry2(sum)(1, 2, 3)).toBe(6);
});
