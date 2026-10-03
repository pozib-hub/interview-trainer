import { test, expect } from "vitest";
import { Stack } from "../solution";

test("push и pop", () => {
  const s = new Stack();
  s.push(5);
  s.push(3);
  expect(s.pop()).toBe(3);
  expect(s.pop()).toBe(5);
});

test("getMin: отслеживает минимум", () => {
  const s = new Stack();
  s.push(5);
  expect(s.getMin()).toBe(5);
  s.push(3);
  expect(s.getMin()).toBe(3);
  s.push(7);
  expect(s.getMin()).toBe(3);
  s.push(1);
  expect(s.getMin()).toBe(1);
});

test("getMin: после pop минимум обновляется", () => {
  const s = new Stack();
  s.push(5);
  s.push(3);
  s.push(1);
  expect(s.getMin()).toBe(1);
  s.pop();
  expect(s.getMin()).toBe(3);
  s.pop();
  expect(s.getMin()).toBe(5);
});

test("pop пустого стека", () => {
  const s = new Stack();
  expect(s.pop()).toBeUndefined();
});

test("дубликаты минимума", () => {
  const s = new Stack();
  s.push(3);
  s.push(3);
  expect(s.getMin()).toBe(3);
  s.pop();
  expect(s.getMin()).toBe(3);
});
