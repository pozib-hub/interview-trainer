import { test, expect } from "vitest";
import { promiseAll } from "../solution";

test("все промисы разрешаются", async () => {
  const result = await promiseAll([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3),
  ]);
  expect(result).toEqual([1, 2, 3]);
});

test("пустой массив", async () => {
  const timeout = new Promise((_, rej) => setTimeout(() => rej("timeout"), 1000));
  const result = await Promise.race([promiseAll([]), timeout]);
  expect(result).toEqual([]);
});

test("один промис", async () => {
  const result = await promiseAll([Promise.resolve("hello")]);
  expect(result).toEqual(["hello"]);
});

test("отклонение при ошибке", async () => {
  await expect(
    promiseAll([Promise.resolve(1), Promise.reject("error"), Promise.resolve(3)])
  ).rejects.toBe("error");
});

test("сохраняет порядок результатов", async () => {
  const result = await promiseAll([
    new Promise((r) => setTimeout(() => r("slow"), 50)),
    new Promise((r) => r("fast")),
  ]);
  expect(result).toEqual(["slow", "fast"]);
});
