import { test, expectTypeOf } from "vitest";
import type { ApiRequest, Movies, MoviesRating } from "../solution";

test("ApiRequest: GET → string", () => {
  expectTypeOf<ApiRequest<"GET">["data"]>().toEqualTypeOf<string>();
});

test("ApiRequest: POST → number", () => {
  expectTypeOf<ApiRequest<"POST">["data"]>().toEqualTypeOf<number>();
});

test("Movies — ключи moviesRating", () => {
  expectTypeOf<Movies>().toEqualTypeOf<"titanic" | "avatar" | "inception" | "batman">();
});

test("MoviesRating — Record<Movies, number>", () => {
  expectTypeOf<MoviesRating>().toEqualTypeOf<Record<Movies, number>>();
});
