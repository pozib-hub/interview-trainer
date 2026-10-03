import { test, expect } from "vitest";
import { getOrder } from "../solution";

test("порядок вывода", async () => {
  const order = await getOrder();
  expect(order).toEqual(["1", "5", "4", "2", "3"]);
});
