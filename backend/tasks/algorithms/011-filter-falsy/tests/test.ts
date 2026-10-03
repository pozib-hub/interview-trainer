import { test, expect } from "vitest";
import { filterFalsy } from "../solution";

test("filterFalsy([null, 0, false, 1]) => [1]", () => {
  expect(filterFalsy([null, 0, false, 1])).toEqual([1]);
});

test("filterFalsy({ a: null, b: [false, 1] }) => { 'b': [1] }", () => {
  expect(filterFalsy({ a: null, b: [false, 1] })).toEqual({ 'b': [1] });
});

test("filterFalsy([null, 0, 5, [0], [false, 16]]) => [5, [], [16]]", () => {
  expect(filterFalsy([null, 0, 5, [0], [false, 16]])).toEqual([5, [], [16]]);
});
