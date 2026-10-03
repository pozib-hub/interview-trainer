import { test, expect } from "vitest";
import { getOrder } from "../solution";

test("порядок вывода", async () => {
  const order = await getOrder();
  expect(order).toEqual([
    "1",
    "Promise",
    "4",
    "timeout",
    "777",
    "then1",
    "then2",
    "timeout2",
  ]);
});
