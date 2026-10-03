import { test, expect } from "vitest";
import { saveList, type Product } from "../solution";

test("saveList — валидные продукты", async () => {
  const products: Product[] = [
    { id: "1", name: "Milk" },
    { id: "2", name: "Bread" },
  ];
  const result = await saveList(products);
  expect(result.ok).toBe(true);
  expect(result.errors).toBeUndefined();
});

test("saveList — пустое имя", async () => {
  const products: Product[] = [{ id: "1", name: "" }];
  const result = await saveList(products);
  expect(result.ok).toBe(false);
  expect(result.errors?.some(e => e.text === "Имя должно быть заполнено")).toBe(true);
});

test("saveList — короткое имя (< 3 символов)", async () => {
  const products: Product[] = [{ id: "1", name: "ab" }];
  const result = await saveList(products);
  expect(result.ok).toBe(false);
  expect(result.errors?.some(e => e.text === "Имя должно быть длиннее двух символов")).toBe(true);
});

test("saveList — спецсимволы в имени", async () => {
  const products: Product[] = [{ id: "1", name: "Milk!" }];
  const result = await saveList(products);
  expect(result.ok).toBe(false);
  expect(result.errors?.some(e => e.text === "Имя не должно содержать спецсимволы")).toBe(true);
});

test("saveList — несколько ошибок для одного продукта", async () => {
  const products: Product[] = [{ id: "1", name: "!" }];
  const result = await saveList(products);
  expect(result.ok).toBe(false);
  expect(result.errors?.length).toBeGreaterThanOrEqual(2);
});
