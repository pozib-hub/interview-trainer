import { test, expect } from "vitest";
import { revertStr, mirror } from "../solution";

test("revertStr переворачивает строку", () => {
  expect(revertStr("hello")).toBe("olleh");
  expect(revertStr("a")).toBe("a");
  expect(revertStr("")).toBe("");
});

test("mirror переворачивает ключи объекта", () => {
  expect(mirror({ abc: undefined, xyz: undefined })).toEqual({
    abc: "cba",
    xyz: "zyx",
  });
});

test("mirror пустой объект", () => {
  expect(mirror({})).toEqual({});
});
