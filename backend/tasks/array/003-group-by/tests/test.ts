import { test, expect } from "vitest";
import { groupBy } from "../solution";

test("группировка по Math.ceil", () => {
  const result = groupBy([6.1, 4.2, 6.9], Math.ceil);
  expect(result[7]).toEqual([6.1, 6.9]);
  expect(result[5]).toEqual([4.2]);
});

test("группировка по чётности", () => {
  const result = groupBy([1, 2, 3, 4, 5, 6], (n) => (n % 2 === 0 ? "even" : "odd"));
  expect(result["odd"]).toEqual([1, 3, 5]);
  expect(result["even"]).toEqual([2, 4, 6]);
});

test("пустой массив", () => {
  const result = groupBy([], () => "x");
  expect(Object.keys(result)).toHaveLength(0);
});

test("один элемент", () => {
  const result = groupBy([42], (n) => String(n));
  expect(result["42"]).toEqual([42]);
});

test("группировка объектов по свойству", () => {
  const users = [
    { role: "admin", name: "A" },
    { role: "user", name: "B" },
    { role: "admin", name: "C" },
  ];
  const result = groupBy(users, (u) => u.role);
  expect(result["admin"]).toHaveLength(2);
  expect(result["user"]).toEqual([{ role: "user", name: "B" }]);
});
