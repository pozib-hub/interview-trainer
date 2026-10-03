import { test, expect } from "vitest";
import { getResult } from "../solution";

test("порядок вывода (без requestAnimationFrame/MutationObserver)", () => {
  expect(getResult()).toEqual([
    "1", "15", "4", "13", "16", "2", "3", "10", "11", "14", "5", "6",
  ]);
});
