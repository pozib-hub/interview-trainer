import { test, expect } from "vitest";
import { deleteDuplicate, deleteDuplicate2 } from "../solution";

test("deleteDuplicate: удаляет дубликаты чисел", () => {
  expect(deleteDuplicate([1, 1, 3, 4, 5, 6, 7, 7, 8])).toEqual([1, 3, 4, 5, 6, 7, 8]);
});

test("deleteDuplicate: пустой массив", () => {
  expect(deleteDuplicate([])).toEqual([]);
});

test("deleteDuplicate: все одинаковые", () => {
  expect(deleteDuplicate([5, 5, 5, 5])).toEqual([5]);
});

test("deleteDuplicate: строки", () => {
  expect(deleteDuplicate(["a", "b", "a", "c"])).toEqual(["a", "b", "c"]);
});

test("deleteDuplicate2: удаляет дубликаты чисел", () => {
  expect(deleteDuplicate2([1, 1, 3, 4, 5, 6, 7, 7, 8])).toEqual([1, 3, 4, 5, 6, 7, 8]);
});

test("deleteDuplicate2: пустой массив", () => {
  expect(deleteDuplicate2([])).toEqual([]);
});
