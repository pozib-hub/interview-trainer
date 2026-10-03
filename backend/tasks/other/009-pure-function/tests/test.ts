import { test, expect } from "vitest";
import { add } from "../solution";

test("add — чистая функция с инъекцией зависимостей", async () => {
  const result = await add({ value: 4 }, 1, 100, async () => 50);
  expect(result).toBe(2 + 50 + 100);
});

test("add — не мутирует params", async () => {
  const params = { value: 4 };
  await add(params, 1, 100, async () => 0);
  expect(params.value).toBe(4);
});

test("add — детерминированный результат", async () => {
  const fetchData = async () => 10;
  const r1 = await add({ value: 1 }, 5, 20, fetchData);
  const r2 = await add({ value: 1 }, 5, 20, fetchData);
  expect(r1).toBe(r2);
});
