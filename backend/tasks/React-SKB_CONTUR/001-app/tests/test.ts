import { test, expect } from "vitest";
import { addProduct, removeProduct, updateProduct, canSend, type Product } from "../solution";

test("addProduct — добавляет продукт", () => {
  const products: Product[] = [];
  const result = addProduct(products);
  expect(result.length).toBe(1);
  expect(result[0].name).toBe("");
});

test("addProduct — не мутирует оригинал", () => {
  const products: Product[] = [];
  addProduct(products);
  expect(products.length).toBe(0);
});

test("removeProduct — удаляет по id", () => {
  const products: Product[] = [
    { id: "1", name: "A" },
    { id: "2", name: "B" },
  ];
  const result = removeProduct(products, "1");
  expect(result.length).toBe(1);
  expect(result[0].id).toBe("2");
});

test("updateProduct — обновляет name по id", () => {
  const products: Product[] = [{ id: "1", name: "old" }];
  const result = updateProduct(products, "1", "new");
  expect(result[0].name).toBe("new");
});

test("updateProduct — не меняет другие продукты", () => {
  const products: Product[] = [
    { id: "1", name: "A" },
    { id: "2", name: "B" },
  ];
  const result = updateProduct(products, "1", "C");
  expect(result[1].name).toBe("B");
});

test("canSend — можно отправить с продуктами и без loading", () => {
  expect(canSend([{ id: "1", name: "A" }], false)).toBe(true);
});

test("canSend — нельзя при loading", () => {
  expect(canSend([{ id: "1", name: "A" }], true)).toBe(false);
});

test("canSend — нельзя с пустым списком", () => {
  expect(canSend([], false)).toBe(false);
});
