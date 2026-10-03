import { test, expect } from "vitest";
import { treeFn, treeFn2, tree } from "../solution";

test("treeFn — уплощает дерево", () => {
  expect(treeFn(tree)).toEqual({
    "a.b": "two",
    "a.c.d": "one",
  });
});

test("treeFn — пустой объект", () => {
  expect(treeFn({})).toEqual({});
});

test("treeFn2 — уплощает дерево", () => {
  expect(treeFn2(tree)).toEqual({
    "a.b": "two",
    "a.c.d": "one",
  });
});

test("treeFn2 — пустой объект", () => {
  expect(treeFn2({})).toEqual({});
});

test("treeFn и treeFn2 дают одинаковый результат", () => {
  expect(treeFn(tree)).toEqual(treeFn2(tree));
});
