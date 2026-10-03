import { test, expect } from "vitest";
import { isEqualDeep } from "../solution";

test("isEqualDeep({ a: 1 }, { a: 1 }) => true", () => {
  expect(isEqualDeep({ a: 1 }, { a: 1 })).toBe(true);
});

test("isEqualDeep({ a: 1 }, { a: 2 }) => false", () => {
  expect(isEqualDeep({ a: 1 }, { a: 2 })).toBe(false);
});

test("isEqualDeep([1, 2, 3], [1, 2, 3]) => true", () => {
  expect(isEqualDeep([1, 2, 3], [1, 2, 3])).toBe(true);
});

test("isEqualDeep([1, 2, 3], [1, 2, 4]) => false", () => {
  expect(isEqualDeep([1, 2, 3], [1, 2, 4])).toBe(false);
});

test("isEqualDeep({ a: [1, 2] }, { a: [1, 2] }) => true", () => {
  expect(isEqualDeep({ a: [1, 2] }, { a: [1, 2] })).toBe(true);
});

test("isEqualDeep({ a: { b: 2 } }, { a: { b: 2 } }) => true", () => {
  expect(isEqualDeep({ a: { b: 2 } }, { a: { b: 2 } })).toBe(true);
});

test("isEqualDeep(null, null) => true", () => {
  expect(isEqualDeep(null, null)).toBe(true);
});

test("isEqualDeep(null, {}) => false", () => {
  expect(isEqualDeep(null, {})).toBe(false);
});
