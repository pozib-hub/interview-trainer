import { test, expect } from "vitest";
import { restoreString1, restoreString2 } from "../solution";

test("restoreString1 — перемешивание", () => {
  expect(restoreString1("домик", [4, 1, 0, 3, 2])).toBe("кодим");
});

test("restoreString1 — клару", () => {
  expect(restoreString1("украл", [1, 4, 3, 2, 0])).toBe("клару");
});

test("restoreString2 — перемешивание", () => {
  expect(restoreString2("домик", [4, 1, 0, 3, 2])).toBe("кодим");
});

test("restoreString2 — клару", () => {
  expect(restoreString2("украл", [1, 4, 3, 2, 0])).toBe("клару");
});
