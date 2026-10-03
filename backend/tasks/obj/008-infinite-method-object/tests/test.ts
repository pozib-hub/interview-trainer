import { test, expect } from "vitest";
import { createInfiniteObject } from "../solution";

test("возвращает имя метода", () => {
  const obj = createInfiniteObject();
  expect(obj["abc123"]()).toBe("abc123");
});

test("имя со спецсимволами", () => {
  const obj = createInfiniteObject();
  expect(obj[".-qw73n|^2It"]()).toBe(".-qw73n|^2It");
});

test("произвольное имя", () => {
  const obj = createInfiniteObject();
  expect(obj.anyName()).toBe("anyName");
});

test("методы можно вызывать независимо", () => {
  const obj = createInfiniteObject();
  expect(obj.foo()).toBe("foo");
  expect(obj.bar()).toBe("bar");
  expect(obj["baz qux"]()).toBe("baz qux");
});

test("числовое имя метода", () => {
  const obj = createInfiniteObject();
  expect(obj["123"]()).toBe("123");
});

test("пустое имя метода", () => {
  const obj = createInfiniteObject();
  expect(obj[""]()).toBe("");
});
