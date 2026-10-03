import { test, expect } from "vitest";
import { descendingOrder } from "../solution";

test("0 → 0", () => {
  expect(descendingOrder(0)).toBe(0);
});

test("1 → 1", () => {
  expect(descendingOrder(1)).toBe(1);
});

test("111 → 111", () => {
  expect(descendingOrder(111)).toBe(111);
});

test("15 → 51", () => {
  expect(descendingOrder(15)).toBe(51);
});

test("1021 → 2110", () => {
  expect(descendingOrder(1021)).toBe(2110);
});

test("123456789 → 987654321", () => {
  expect(descendingOrder(123456789)).toBe(987654321);
});
