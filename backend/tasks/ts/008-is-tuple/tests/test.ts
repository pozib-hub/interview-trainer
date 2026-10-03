import { test, expectTypeOf } from "vitest";
import type { IsTuple } from "../solution";

test("IsTuple — кортеж", () => {
  expectTypeOf<IsTuple<[1, 2, 3]>>().toEqualTypeOf<true>();
});

test("IsTuple — массив (не кортеж)", () => {
  expectTypeOf<IsTuple<number[]>>().toEqualTypeOf<false>();
});

test("IsTuple — пустой кортеж", () => {
  expectTypeOf<IsTuple<[]>>().toEqualTypeOf<true>();
});

test("IsTuple — не массив", () => {
  expectTypeOf<IsTuple<string>>().toEqualTypeOf<false>();
});
