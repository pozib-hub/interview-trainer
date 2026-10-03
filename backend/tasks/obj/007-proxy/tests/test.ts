import { test, expect } from "vitest";
import { getResult } from "../solution";

test("Proxy преобразует в строку", () => {
  expect(getResult()).toEqual(["string", "string", "string"]);
});
