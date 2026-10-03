import { test, expectTypeOf } from "vitest";
import type { Replace } from "../solution";

test("Replace заменяет подстроку", () => {
  expectTypeOf<Replace<"foobar", "bar", "foo">>().toEqualTypeOf<"foofoo">();
});

test("Replace с пустым From возвращает исходную строку", () => {
  expectTypeOf<Replace<"hello", "", "x">>().toEqualTypeOf<"hello">();
});

test("Replace без совпадения", () => {
  expectTypeOf<Replace<"hello", "x", "y">>().toEqualTypeOf<"hello">();
});
