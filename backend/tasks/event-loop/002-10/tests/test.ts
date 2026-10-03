import { test, expect } from "vitest";
import { getOrder } from "../solution";

test("порядок вывода", async () => {
  const order = await getOrder();
  expect(order).toEqual(["1", "2", "5", "7", "3", "4", "6", "гOTOBO!"]);
});
