import { test, expectTypeOf } from "vitest";
import type { PartialWithRequired, User, UserWithRequiredName } from "../solution";

test("PartialWithRequired делает указанные поля обязательными", () => {
  type T = { a?: string; b: number };
  type R = PartialWithRequired<T, "a">;
  expectTypeOf<R["a"]>().toEqualTypeOf<string>();
  expectTypeOf<R["b"]>().toEqualTypeOf<number>();
});

test("PartialWithRequired не трогает остальные поля", () => {
  type T = { a?: string; c?: boolean; d: number };
  type R = PartialWithRequired<T, "a">;
  expectTypeOf<R["c"]>().toEqualTypeOf<boolean | undefined>();
  expectTypeOf<R["d"]>().toEqualTypeOf<number>();
});

test("UserWithRequiredName требует name", () => {
  const valid: UserWithRequiredName = { name: "John", age: 30, email: "a@b.c" };
  expectTypeOf(valid["name"]).toEqualTypeOf<string>();
  expectTypeOf(valid["age"]).toEqualTypeOf<number>();
  expectTypeOf(valid["email"]).toEqualTypeOf<string>();
});

test("User.name опционален", () => {
  const u: User = { age: 30, email: "a@b.c" };
  expectTypeOf(u["name"]).toEqualTypeOf<string | undefined>();
  expectTypeOf(u["age"]).toEqualTypeOf<number>();
});
