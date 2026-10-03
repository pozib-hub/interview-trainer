import { test, expect } from "vitest";
import { task1, sayWelcome, testClosure, truthyCount, testLet, doAsync, testDoAsync, showFullName } from "../solution";

test("task1 — результат 6", () => {
  expect(task1()).toBe(6);
});

test("sayWelcome использует замыкание currentCity", () => {
  expect(sayWelcome()).toBe("Welcome toЕкатеринбург");
});

test("testClosure — замыкание не видит innerCity", () => {
  expect(testClosure()).toBe("Welcome toЕкатеринбург");
});

test("truthyCount — количество truthy значений", () => {
  expect(truthyCount()).toBe(8);
});

test("testLet — let можно переназначить", () => {
  expect(testLet()).toBe(2);
});

test("doAsync(true) resolve 2", async () => {
  expect(await doAsync(true)).toBe(2);
});

test("doAsync(false) reject 1", async () => {
  await expect(doAsync(false)).rejects.toBe(1);
});

test("testDoAsync — syncValue = 0, asyncValue = 1 (reject)", async () => {
  const result = await testDoAsync();
  expect(result.syncValue).toBe(0);
  expect(result.asyncValue).toBe(1);
});

test("showFullName — с rest-параметрами", () => {
  expect(showFullName("Екатерина", "II", "императрица", "Всероссийская")).toBe(
    "Екатерина II - императрица,Всероссийская"
  );
});

test("showFullName — без rest", () => {
  expect(showFullName("Иван", "Грозный")).toBe("Иван Грозный");
});
