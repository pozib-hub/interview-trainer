import { test, expect } from "vitest";
import { getOrder } from "../solution";

test("порядок event loop", async () => {
  const order = await getOrder();
  expect(order).toEqual(["2", "4", "5", "7", "6", "8", "1"]);
});
