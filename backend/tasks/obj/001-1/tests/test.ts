import { test, expect } from "vitest";
import { getResult } from "../solution";

test("объект как ключ — перетирается", () => {
  expect(getResult()).toEqual(["undefined b"]);
});
