import { test, expect } from "vitest";
import { fn } from "../solution";

test("транспонирует символы слов", () => {
  const result = fn("ab cd");
  expect(result).toEqual([["a", "c"], ["b", "d"]]);
});

test("разной длины слова", () => {
  const result = fn("abc d");
  expect(result).toEqual([["a", "d"], ["b", ""], ["c", ""]]);
});

test("одно слово", () => {
  const result = fn("hello");
  expect(result).toEqual([["h"], ["e"], ["l"], ["l"], ["o"]]);
});
