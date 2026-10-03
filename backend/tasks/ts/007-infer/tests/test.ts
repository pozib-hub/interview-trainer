import { test, expectTypeOf } from "vitest";
import type { TObjectInfer } from "../solution";

test("TObjectInfer извлекает тип значения объекта", () => {
  type Data = { x: number; y: string; z: () => void };
  expectTypeOf<TObjectInfer<Data>>().toEqualTypeOf<number | string | (() => void)>();
});

test("TObjectInfer для однотипных значений", () => {
  type Data = { a: string; b: string };
  expectTypeOf<TObjectInfer<Data>>().toEqualTypeOf<string>();
});
