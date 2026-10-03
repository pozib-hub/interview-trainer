import { test, expectTypeOf } from "vitest";
import type { T1, ExampleType, StringKeys, NumberKeys, BooleanKeys } from "../solution";

test("StringKeys — ключи со значением string", () => {
  expectTypeOf<StringKeys>().toEqualTypeOf<"Field1" | "Field2">();
});

test("NumberKeys — ключи со значением number", () => {
  expectTypeOf<NumberKeys>().toEqualTypeOf<"Field3">();
});

test("BooleanKeys — ключи со значением boolean", () => {
  expectTypeOf<BooleanKeys>().toEqualTypeOf<"Field4">();
});

test("T1 извлекает ключи по типу значения", () => {
  expectTypeOf<T1<{ a: string; b: number }, string>>().toEqualTypeOf<"a">();
});
