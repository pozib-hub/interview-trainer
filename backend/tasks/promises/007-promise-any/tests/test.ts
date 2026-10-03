import { test, expect } from "vitest";
import { promiseAny } from "../solution";

test("возвращает первый разрешённый", async () => {
  const result = await promiseAny([
    Promise.reject("err"),
    Promise.resolve(42),
    Promise.resolve(99),
  ]);
  expect(result).toBe(42);
});

test("возвращает最快的 разрешённый", async () => {
  const result = await promiseAny([
    new Promise((r) => setTimeout(() => r("slow"), 50)),
    new Promise((r) => r("fast")),
  ]);
  expect(result).toBe("fast");
});

test("все отклонены → AggregateError", async () => {
  await expect(
    promiseAny([Promise.reject("a"), Promise.reject("b")])
  ).rejects.toThrow();
});

test("один промис разрешён", async () => {
  const result = await promiseAny([Promise.resolve("only")]);
  expect(result).toBe("only");
});

test("пустой массив отклоняет", async () => {
  await expect(promiseAny([])).rejects.toThrow();
});
