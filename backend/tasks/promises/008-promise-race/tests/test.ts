import { test, expect } from "vitest";
import { promiseRace } from "../solution";

test("возвращает первый разрешённый", async () => {
  const result = await promiseRace([
    new Promise((r) => setTimeout(() => r("slow"), 50)),
    Promise.resolve("fast"),
  ]);
  expect(result).toBe("fast");
});

test("возвращает первый отклонённый", async () => {
  await expect(
    promiseRace([Promise.reject("error"), Promise.resolve(1)])
  ).rejects.toBe("error");
});

test("пустой массив — вечное ожидание (не разрешается)", () => {
  const p = promiseRace([]);
  return Promise.race([
    p,
    new Promise((_, rej) => setTimeout(() => rej("timeout"), 100)),
  ]).catch((e) => expect(e).toBe("timeout"));
});

test("один промис", async () => {
  const result = await promiseRace([Promise.resolve(42)]);
  expect(result).toBe(42);
});
