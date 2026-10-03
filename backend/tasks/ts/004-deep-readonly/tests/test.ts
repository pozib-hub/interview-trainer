import { test, expectTypeOf } from "vitest";
import type { DeepReadonly } from "../solution";

test("DeepReadonly — примитивы", () => {
  expectTypeOf<DeepReadonly<number>>().toEqualTypeOf<number>();
});

test("DeepReadonly — объект", () => {
  type T = { a: number; b: string };
  type Expected = { readonly a: number; readonly b: string };
  expectTypeOf<DeepReadonly<T>>().toEqualTypeOf<Expected>();
});

test("DeepReadonly — вложенный объект", () => {
  type T = { a: { b: number } };
  type Expected = { readonly a: { readonly b: number } };
  expectTypeOf<DeepReadonly<T>>().toEqualTypeOf<Expected>();
});
