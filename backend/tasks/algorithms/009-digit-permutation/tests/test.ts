import { test, expect } from "vitest";
import { digitPermutation } from "../solution";

test("digitPermutation([11, 22]) => [[11], [22]]", () => {
  expect(digitPermutation([11, 22])).toEqual([[11], [22]]);
});

test("digitPermutation([111111111112, 122222222222]) => [[111111111112], [122222222222]]", () => {
  expect(digitPermutation([111111111112, 122222222222])).toEqual([[111111111112], [122222222222]]);
});
