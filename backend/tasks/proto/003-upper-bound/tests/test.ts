import { test, expect } from "vitest";
import "../solution";

test("последний индекс — конец массива", () => {
  expect([3, 4, 5].upperBound(5)).toBe(2);
});

test("элемент отсутствует", () => {
  expect([1, 4, 5].upperBound(2)).toBe(-1);
});

test("последний индекс среди дубликатов", () => {
  expect([3, 4, 6, 6, 6, 6, 7].upperBound(6)).toBe(5);
});

test("первый элемент массива", () => {
  expect([3, 4, 5].upperBound(3)).toBe(0);
});

test("все элементы равны target", () => {
  expect([7, 7, 7, 7].upperBound(7)).toBe(3);
});

test("один элемент равен target", () => {
  expect([5].upperBound(5)).toBe(0);
});

test("один элемент не равен target", () => {
  expect([5].upperBound(3)).toBe(-1);
});

test("target меньше всех", () => {
  expect([10, 20, 30].upperBound(5)).toBe(-1);
});

test("target больше всех", () => {
  expect([10, 20, 30].upperBound(40)).toBe(-1);
});

test("переход через отрицательные значения", () => {
  expect([-10, -5, -5, 0, 3].upperBound(-5)).toBe(2);
});
