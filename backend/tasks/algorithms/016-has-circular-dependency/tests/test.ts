import { test, expect } from "vitest";
import { hasCircularDependency } from "../solution";

test("цикл существует (foo -> baz -> x -> foo)", () => {
  expect(
    hasCircularDependency("index.js", {
      "index.js": ["foo.js", "bar.js"],
      "bar.js": ["baz.js"],
      "foo.js": ["baz.js"],
      "baz.js": ["x.js"],
      "x.js": ["foo.js"],
    })
  ).toBe(true);
});

test("нет цикла", () => {
  expect(
    hasCircularDependency("index.js", {
      "index.js": ["foo.js", "bar.js"],
      "bar.js": ["baz.js"],
      "foo.js": ["baz.js"],
      "baz.js": ["x.js"],
      "x.js": [],
    })
  ).toBe(false);
});

test("самоссылка — цикл", () => {
  expect(
    hasCircularDependency("index.js", {
      "index.js": ["index.js"],
    })
  ).toBe(true);
});

test("нет зависимостей", () => {
  expect(hasCircularDependency("index.js", {})).toBe(false);
});
