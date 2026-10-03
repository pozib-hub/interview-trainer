import { test, expect } from "vitest";
import { partial } from "../solution";

test("без плейсхолдеров — restArgs в конец", () => {
  const fn = (...args: number[]) => args;
  const partialFn = partial(fn, [2, 4, 6]);
  expect(partialFn(8, 10)).toEqual([2, 4, 6, 8, 10]);
});

test("плейсхолдеры заменяются по порядку", () => {
  const fn = (...args: number[]) => args;
  const partialFn = partial(fn, [1, 2, "_" as any, 4, "_" as any, 6]);
  expect(partialFn(3, 5)).toEqual([1, 2, 3, 4, 5, 6]);
});

test("плейсхолдер и доп. аргументы", () => {
  const fn = (a: number, b: number, c: number) => b + a - c;
  const partialFn = partial(fn, ["_" as any, 5]);
  expect(partialFn(5, 20)).toBe(-10);
});

test("исходный массив args не мутируется", () => {
  const fn = (...args: number[]) => args;
  const args = [1, "_" as any, 3];
  const partialFn = partial(fn, args);
  partialFn(2);
  expect(args).toEqual([1, "_", 3]);
});

test("все плейсхолдеры", () => {
  const fn = (...args: number[]) => args;
  const partialFn = partial(fn, ["_" as any, "_" as any]);
  expect(partialFn(7, 8)).toEqual([7, 8]);
});

test("больше restArgs, чем плейсхолдеров", () => {
  const fn = (...args: number[]) => args;
  const partialFn = partial(fn, [1, "_" as any, 3]);
  expect(partialFn(2, 4, 5)).toEqual([1, 2, 3, 4, 5]);
});

test("вызов без restArgs при отсутствии плейсхолдеров", () => {
  const fn = (a: number, b: number) => a + b;
  const partialFn = partial(fn, [1, 2]);
  expect(partialFn()).toBe(3);
});
