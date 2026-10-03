import { test, expect, vi } from "vitest";
import { getResult } from "../solution";

test("myBind привязывает контекст", () => {
  const obj = { a: 1 };
  function say(this: { a: number }) { return this.a; }
  const bound = say.myBind(obj);
  expect(bound()).toBe(1);
});

test("myBind поддерживает каррирование", () => {
  const obj = { a: 1 };
  function say(this: { a: number }, arg1: number, arg2: number) { return this.a + arg1 + arg2; }
  const bound = say.myBind(obj, 10);
  expect(bound(20)).toBe(31);
});

test("getResult возвращает true", () => {
  expect(getResult()).toBe(true);
});
