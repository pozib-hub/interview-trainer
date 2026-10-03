import { test, expectTypeOf } from "vitest";
import type { Concat } from "../solution";

test("Concat объединяет два кортежа", () => {
  expectTypeOf<Concat<[1, 2], [3, 4]>>().toEqualTypeOf<[1, 2, 3, 4]>();
});

test("Concat с пустым кортежем", () => {
  expectTypeOf<Concat<[], [1, 2]>>().toEqualTypeOf<[1, 2]>();
  expectTypeOf<Concat<[1, 2], []>>().toEqualTypeOf<[1, 2]>();
});

test("Concat оба пустых", () => {
  expectTypeOf<Concat<[], []>>().toEqualTypeOf<[]>();
});
