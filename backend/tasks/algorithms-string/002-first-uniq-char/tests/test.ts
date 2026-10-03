import { test, expect } from "vitest";
import { firstUniqChar } from "../solution";

test("первый уникальный символ", () => {
  expect(firstUniqChar("lleetcode")).toBe("t");
  expect(firstUniqChar("aabbccdde")).toBe("e");
});

test("нет уникального символа", () => {
  expect(firstUniqChar("aabbcc")).toBeNull();
});

test("один символ", () => {
  expect(firstUniqChar("a")).toBe("a");
});
