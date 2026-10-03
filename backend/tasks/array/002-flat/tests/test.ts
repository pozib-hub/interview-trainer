import { test, expect } from "vitest";
import { example } from "../solution";

declare global {
  interface Array<T> {
    flatRecurs<U = T>(depth: number): U[];
    flatStack<U = T>(depth: number): U[];
  }
}

test("flatRecurs — depth 1", () => {
  expect([1, [2, 3]].flatRecurs<number>(1)).toEqual([1, 2, 3]);
});

test("flatRecurs — depth 2", () => {
  expect([1, [2, [3]]].flatRecurs<number>(2)).toEqual([1, 2, 3]);
});

test("flatRecurs — depth 0", () => {
  expect([1, [2]].flatRecurs<number>(0)).toEqual([1, [2]]);
});

test("flatStack — depth 1", () => {
  expect([1, [2, 3]].flatStack<number>(1)).toEqual([1, 2, 3]);
});

test("flatStack — depth 2", () => {
  expect([1, [2, [3]]].flatStack<number>(2)).toEqual([1, 2, 3]);
});

test("flatStack — example из решения", () => {
  const result = example.flatStack<number>(2);
  expect(result).toContain(1);
  expect(result).toContain(66);
});
