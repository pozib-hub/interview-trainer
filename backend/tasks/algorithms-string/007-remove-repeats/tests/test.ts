import { test, expect } from "vitest";
import { removeRepeats } from "../solution";

test("убирает повторяющиеся символы", () => {
  const result = removeRepeats("Кккоооот Бааарссиккк зззапрыыгнннул   наааа зааабоооррррр");
  expect(result).toBe("Кот барсик запрыгнул на забор");
});

test("без повторов", () => {
  expect(removeRepeats("ab")).toBe("ab");
});

test("один символ", () => {
  expect(removeRepeats("a")).toBe("a");
});
