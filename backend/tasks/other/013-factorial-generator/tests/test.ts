import { test, expect } from "vitest";
import { factorial } from "../solution";

test("n = 5", () => {
  const gen = factorial(5);
  expect(gen.next().value).toBe(1);
  expect(gen.next().value).toBe(2);
  expect(gen.next().value).toBe(6);
  expect(gen.next().value).toBe(24);
  expect(gen.next().value).toBe(120);
  expect(gen.next().done).toBe(true);
});

test("n = 2", () => {
  const gen = factorial(2);
  expect(gen.next().value).toBe(1);
  expect(gen.next().value).toBe(2);
  expect(gen.next().done).toBe(true);
});

test("n = 0", () => {
  const gen = factorial(0);
  expect(gen.next().value).toBe(1);
  expect(gen.next().done).toBe(true);
});

test("n = 1", () => {
  const gen = factorial(1);
  expect(gen.next().value).toBe(1);
  expect(gen.next().done).toBe(true);
});

test("итерация через for..of", () => {
  const values: number[] = [];
  for (const v of factorial(5)) {
    values.push(v);
  }
  expect(values).toEqual([1, 2, 6, 24, 120]);
});

test("n = 18 (максимум)", () => {
  const values: number[] = [];
  for (const v of factorial(18)) {
    values.push(v);
  }
  expect(values.length).toBe(18);
  expect(values[0]).toBe(1);
  expect(values[17]).toBe(6402373705728000);
});

test("расход массива через spread", () => {
  expect([...factorial(4)]).toEqual([1, 2, 6, 24]);
});
