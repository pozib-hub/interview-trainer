import { test, expect } from "vitest";
import { getOrder } from "../solution";

test("порядок вывода", async () => {
  const order = await getOrder();
  expect(order).toEqual([
    "before promise",
    "in Promise",
    "log1",
    "Promise then-1",
    "Promise then 2",
    "setTimeout 0",
  ]);
});
