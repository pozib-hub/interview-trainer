import { test, expectTypeOf } from "vitest";
import type { NegativeNumber, A, B, C, D } from "../solution";

test("NegativeNumber<-10> = -10", () => {
  expectTypeOf<A>().toEqualTypeOf<-10>();
});

test("NegativeNumber<5> = never", () => {
  expectTypeOf<B>().toEqualTypeOf<never>();
});

test("NegativeNumber<-100> = -100", () => {
  expectTypeOf<C>().toEqualTypeOf<-100>();
});

test("NegativeNumber<0> = never", () => {
  expectTypeOf<D>().toEqualTypeOf<never>();
});
