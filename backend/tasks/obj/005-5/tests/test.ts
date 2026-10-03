import { test, expect } from "vitest";
import { getResult } from "../solution";

test("передача объекта по ссылке vs копии", () => {
  expect(getResult()).toEqual(["{ a: 'a' } 1", "{ a: 'a', b: 'b' } 1"]);
});
