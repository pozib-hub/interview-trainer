import { test, expectTypeOf } from "vitest";
import type { Api, Product, Errors, Response } from "../solution";

test("Product имеет name и id", () => {
  expectTypeOf<Product>().toMatchTypeOf<{ name: string; id: string }>();
});

test("Errors — массив", () => {
  expectTypeOf<Errors>().toEqualTypeOf<Array<{ id: string; text: string }>>();
});

test("Response — discriminated union", () => {
  expectTypeOf<Response>().toEqualTypeOf<
    | { ok: false; errors: Errors }
    | { ok: true }
  >();
});

test("Api.saveList возвращает Promise<Response>", () => {
  expectTypeOf<Api["saveList"]>().toEqualTypeOf<(products: Product[]) => Promise<Response>>();
});
