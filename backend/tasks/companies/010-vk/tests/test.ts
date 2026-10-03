import { test, expect } from "vitest";
import { flatPolyfill, promiseAll } from "../solution";

test("flatPolyfill — плоский массив", () => {
  expect(flatPolyfill([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4]);
});

test("flatPolyfill — без вложенности", () => {
  expect(flatPolyfill([1, 2, 3])).toEqual([1, 2, 3]);
});

test("flatPolyfill — пустой", () => {
  expect(flatPolyfill([])).toEqual([]);
});

test("promiseAll — все resolve", async () => {
  const results = await promiseAll([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3),
  ]);
  expect(results).toEqual([1, 2, 3]);
});

test("promiseAll — пустой массив", async () => {
  const results = await promiseAll([]);
  expect(results).toEqual([]);
});

test("promiseAll — один reject", async () => {
  await expect(
    promiseAll([Promise.resolve(1), Promise.reject(new Error("fail"))])
  ).rejects.toThrow("fail");
});

test("promiseAll — сохраняет порядок", async () => {
  const results = await promiseAll([
    new Promise((r) => setTimeout(() => r(3), 30)),
    new Promise((r) => setTimeout(() => r(1), 10)),
    new Promise((r) => setTimeout(() => r(2), 20)),
  ]);
  expect(results).toEqual([3, 1, 2]);
});
