import { test, expect } from "vitest";
import { reduceString } from "../solution";

test("сжатие с повторами", () => {
  expect(reduceString("AAABBBBBBBHELPMEEF")).toBe("A3B7HELPME2F");
});

test("без повторов", () => {
  expect(reduceString("ABC")).toBe("ABC");
});

test("пустая строка", () => {
  expect(reduceString("")).toBe("");
});

test("все одинаковые", () => {
  expect(reduceString("AAAA")).toBe("A4");
});
