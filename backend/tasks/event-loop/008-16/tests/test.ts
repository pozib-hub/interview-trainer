import { test, expect } from "vitest";
import { getOrder } from "../solution";

test("порядок вывода (document/MutationObserver/raf — не выполняются в Node)", () => {
  expect(getOrder()).toEqual(["1", "3", "4", "10", "5", "6", "7", "2", "8", "9"]);
});
