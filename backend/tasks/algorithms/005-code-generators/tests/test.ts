import { test, expect } from "vitest";
import { createCodesGenerator, shuffle } from "../solution";

test("генератор выдаёт уникальные коды", () => {
  const gen = createCodesGenerator(1, 5);
  const codes = new Set<string>();
  for (let i = 0; i < 5; i++) codes.add(gen()!);
  expect(codes.size).toBe(5);
});

test("коды в диапазоне", () => {
  const gen = createCodesGenerator(10, 15);
  const codes: string[] = [];
  for (let i = 0; i < 6; i++) codes.push(gen()!);
  for (const c of codes) {
    const n = parseInt(c, 10);
    expect(n).toBeGreaterThanOrEqual(10);
    expect(n).toBeLessThanOrEqual(15);
  }
});

test("возвращает сообщение после исчерпания", () => {
  const gen = createCodesGenerator(1, 2);
  gen();
  gen();
  expect(gen()).toBe("Все коды зарезервированы");
});

test("длина кодов одинакова (padStart)", () => {
  const gen = createCodesGenerator(1, 100);
  expect(gen()!.length).toBe(3);
});

test("shuffle перемешивает массив", () => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const copy = [...arr];
  shuffle(copy);
  expect(copy.sort((a, b) => a - b)).toEqual(arr);
});
