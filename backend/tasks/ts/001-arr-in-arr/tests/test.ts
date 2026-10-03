import { test, expectTypeOf } from "vitest";
import type { Arr } from "../solution";

test("Arr — рекурсивный тип массива с number и вложенными Arr", () => {
  expectTypeOf<Arr>().toEqualTypeOf<(number | Arr)[]>();
});

test("arr — валидный Arr", () => {
  const nested: number[] = [1, 2, 3];
  expectTypeOf(nested).toMatchTypeOf<Arr>();
});

test("Arr поддерживает вложенность", () => {
  const nested: (number | number[])[] = [1, [2, 3]];
  expectTypeOf(nested).toMatchTypeOf<Arr>();
});
