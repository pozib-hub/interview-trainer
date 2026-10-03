import { test, expectTypeOf } from "vitest";
import type {
  MyRecord,
  MyOmit,
  MyPick,
  MyPartial,
  MyRequired,
  MyReadonly,
  MyExclude,
  MyExtract,
  MyReturnType,
  MyInstanceType,
} from "../solution";

test("MyRecord", () => {
  expectTypeOf<MyRecord<"a" | "b", number>>().toEqualTypeOf<{ a: number; b: number }>();
});

test("MyOmit", () => {
  expectTypeOf<MyOmit<{ a: number; b: string; c: boolean }, "a">>().toEqualTypeOf<{ b: string; c: boolean }>();
});

test("MyPick", () => {
  expectTypeOf<MyPick<{ a: number; b: string }, "a">>().toEqualTypeOf<{ a: number }>();
});

test("MyPartial", () => {
  expectTypeOf<MyPartial<{ a: number; b: string }>>().toEqualTypeOf<{ a?: number; b?: string }>();
});

test("MyRequired", () => {
  expectTypeOf<MyRequired<{ a?: number; b?: string }>>().toEqualTypeOf<{ a: number; b: string }>();
});

test("MyReadonly", () => {
  expectTypeOf<MyReadonly<{ a: number }>>().toEqualTypeOf<{ readonly a: number }>();
});

test("MyExclude", () => {
  expectTypeOf<MyExclude<"a" | "b" | "c", "a">>().toEqualTypeOf<"b" | "c">();
});

test("MyExtract", () => {
  expectTypeOf<MyExtract<"a" | "b" | "c", "a" | "b">>().toEqualTypeOf<"a" | "b">();
});

test("MyReturnType", () => {
  expectTypeOf<MyReturnType<() => string>>().toEqualTypeOf<string>();
  expectTypeOf<MyReturnType<() => number>>().toEqualTypeOf<number>();
});

test("MyInstanceType", () => {
  class Foo {}
  expectTypeOf<MyInstanceType<typeof Foo>>().toEqualTypeOf<Foo>();
});
