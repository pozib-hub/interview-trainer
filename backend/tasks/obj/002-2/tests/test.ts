import { test, expect } from "vitest";
import { a, b, c } from "../solution";

test("c() меняет внешнюю a на 4", () => {
  expect(a).toBe(4);
});

test("b остаётся 3 (внутренний b = 4 не влияет)", () => {
  expect(b).toBe(3);
});

test("c — функция", () => {
  expect(typeof c).toBe("function");
});
