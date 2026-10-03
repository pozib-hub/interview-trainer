import { test, expect } from "vitest";
import { strJoin, strJoin2, strJoin3 } from "../solution";

test("strJoin объединяет с разделителем", () => {
  expect(strJoin("-", "1", "2", "3", "4", "5")).toBe("1-2-3-4-5");
});

test("strJoin без аргументов", () => {
  expect(strJoin("-")).toBe("");
});

test("strJoin2 объединяет с разделителем", () => {
  expect(strJoin2("-", "1", "2", "3", "4", "5")).toBe("1-2-3-4-5");
});

test("strJoin3 объединяет с разделителем", () => {
  expect(strJoin3("-", "1", "2", "3", "4", "5")).toBe("1-2-3-4-5");
});

test("strJoin2 с одним аргументом", () => {
  expect(strJoin2("-")).toBe("");
});

test("strJoin3 с одним аргументом", () => {
  expect(strJoin3("-")).toBe("");
});
