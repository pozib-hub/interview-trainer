import { test, expect } from "vitest";
import { toCamelCase, toCamelCase2 } from "../solution";

test("toCamelCase — дефис", () => {
  expect(toCamelCase("the-stealth-warrior")).toBe("theStealthWarrior");
});

test("toCamelCase — подчёркивание", () => {
  expect(toCamelCase("The_Stealth_Warrior")).toBe("TheStealthWarrior");
});

test("toCamelCase — без разделителей", () => {
  expect(toCamelCase("hello")).toBe("hello");
});

test("toCamelCase2 — дефис", () => {
  expect(toCamelCase2("the-stealth-warrior")).toBe("theStealthWarrior");
});

test("toCamelCase2 — подчёркивание", () => {
  expect(toCamelCase2("The_Stealth_Warrior")).toBe("TheStealthWarrior");
});

test("toCamelCase2 — без разделителей", () => {
  expect(toCamelCase2("hello")).toBe("hello");
});
