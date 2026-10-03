import { test, expect } from "vitest";
import { TraverseGenerator, TraverseGeneratorRecurs } from "../solution";

test("TraverseGenerator: плоский массив", () => {
  const gen = TraverseGenerator([1, 2, 3]);
  expect(gen.next().value).toBe(1);
  expect(gen.next().value).toBe(2);
  expect(gen.next().value).toBe(3);
  expect(gen.next().done).toBe(true);
});

test("TraverseGenerator: вложенный массив", () => {
  const gen = TraverseGenerator([1, [2, 3]]);
  expect(gen.next().value).toBe(1);
  expect(gen.next().value).toBe(2);
  expect(gen.next().value).toBe(3);
});

test("TraverseGenerator: глубокая вложенность", () => {
  const gen = TraverseGenerator([[[6]], [1, 3], []]);
  expect(gen.next().value).toBe(6);
  expect(gen.next().value).toBe(1);
  expect(gen.next().value).toBe(3);
  expect(gen.next().done).toBe(true);
});

test("TraverseGenerator: пустой массив", () => {
  const gen = TraverseGenerator([]);
  expect(gen.next().done).toBe(true);
});

test("TraverseGeneratorRecurs: вложенный массив", () => {
  const gen = TraverseGeneratorRecurs([1, [2, [3, 4]], 5]);
  const values: any[] = [];
  for (const v of gen) values.push(v);
  expect(values).toEqual([1, 2, 3, 4, 5]);
});

test("TraverseGeneratorRecurs: пустой массив", () => {
  const gen = TraverseGeneratorRecurs([]);
  expect(gen.next().done).toBe(true);
});
