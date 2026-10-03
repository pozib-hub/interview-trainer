import { test, expect } from "vitest";
import { square, times2, sum, compose1, compose2 } from "../solution";

test("square", () => {
  expect(square(3)).toBe(9);
  expect(square(0)).toBe(0);
});

test("times2", () => {
  expect(times2(3)).toBe(6);
  expect(times2(0)).toBe(0);
});

test("sum", () => {
  expect(sum(2, 3)).toBe(5);
});

test("compose1 — square(times2(2))", () => {
  expect(compose1(square, times2)(2)).toBe(square(times2(2)));
});

test("compose1 — sum then times2 then square", () => {
  expect(compose2(square, times2, sum)(3, 4)).toBe(square(times2(sum(3, 4))));
});

test("compose1 — одна функция", () => {
  expect(compose1(square)(5)).toBe(25);
});

test("compose2 — без функций возвращает 0", () => {
  expect(compose2()(5)).toBe(0);
});
