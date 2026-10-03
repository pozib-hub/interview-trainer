import { test, expect } from "vitest";
import { getOrder } from "../solution";

test("порядок вывода (hard)", async () => {
  const order = await getOrder();
  expect(order).toEqual([
    "in promise",
    "log1",
    "Promise then",
    "setTimeout 100",
    "sleep 1000 then",
    "sleep 2000 then",
    "sleep 2000 finally",
    "finally setTimeout 1000",
  ]);
});
