import { test, expect } from "vitest";
import { sum } from "../solution";

test("без аргументов возвращает 0", () => {
  expect(sum()).toBe(0);
});

test("один аргумент и вызов", () => {
  expect(sum(1)()).toBe(1);
});

test("два аргумента", () => {
  expect(sum(1)(4)()).toBe(5);
});

test("несколько вызовов", () => {
  expect(sum(5)(2)(2)()).toBe(9);
});

test("длинная цепочка", () => {
  expect(sum(9)(5)(1)(5)(4)(6)()).toBe(30);
});
