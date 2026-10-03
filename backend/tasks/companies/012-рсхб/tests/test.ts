import { test, expect } from "vitest";
import { promiseAll, batching } from "../solution";

test("promiseAll — все resolve", async () => {
  expect(await promiseAll([Promise.resolve(1), Promise.resolve(2)])).toEqual([1, 2]);
});

test("promiseAll — пустой массив", async () => {
  expect(await promiseAll([])).toEqual([]);
});

test("promiseAll — reject", async () => {
  await expect(promiseAll([Promise.resolve(1), Promise.reject("err")])).rejects.toBe("err");
});

test("batching — разбивает на чанки", () => {
  expect(batching([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
});

test("batching — пустой массив", () => {
  expect(batching([], 3)).toEqual([]);
});

test("batching — size больше массива", () => {
  expect(batching([1, 2], 5)).toEqual([[1, 2]]);
});
