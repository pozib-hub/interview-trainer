import { test, expect } from "vitest";
import { cloneDeepRecurs, cloneDeepWhile } from "../solution";

test("cloneDeepRecurs: примитивы", () => {
  expect(cloneDeepRecurs(42)).toBe(42);
  expect(cloneDeepRecurs("hello")).toBe("hello");
  expect(cloneDeepRecurs(null)).toBeNull();
});

test("cloneDeepRecurs: плоский объект", () => {
  const obj = { a: 1, b: "hello", c: true };
  const clone = cloneDeepRecurs(obj);
  expect(clone).toEqual(obj);
  expect(clone).not.toBe(obj);
});

test("cloneDeepRecurs: вложенный объект", () => {
  const obj = { a: { b: { c: 1 } } };
  const clone = cloneDeepRecurs(obj);
  expect(clone).toEqual(obj);
  expect(clone.a).not.toBe(obj.a);
  expect(clone.a.b).not.toBe(obj.a.b);
});

test("cloneDeepRecurs: массивы", () => {
  const obj = { list: [1, 2, { x: 3 }] };
  const clone = cloneDeepRecurs(obj);
  expect(clone).toEqual(obj);
  expect(clone.list).not.toBe(obj.list);
  expect(clone.list[2]).not.toBe(obj.list[2]);
});

test("cloneDeepWhile: примитивы", () => {
  expect(cloneDeepWhile({} as any)).toEqual({});
});

test("cloneDeepWhile: вложенный объект", () => {
  const obj = { a: { b: { c: 1 } }, d: [1, 2, 3] };
  const clone = cloneDeepWhile(obj);
  expect(clone).toEqual(obj);
  expect(clone.a).not.toBe(obj.a);
  expect(clone.d).not.toBe(obj.d);
});

test("cloneDeepRecurs: изменение клона не влияет на оригинал", () => {
  const obj = { a: { b: 1 } };
  const clone = cloneDeepRecurs(obj);
  clone.a.b = 999;
  expect(obj.a.b).toBe(1);
});
