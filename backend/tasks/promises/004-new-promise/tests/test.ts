import { test, expect } from "vitest";
import { MyPromise, noop, getThen, tryCallOne, tryCallTwo, Handler, resolve, reject, doResolve, handle, handleResolved, safeThen, finale } from "../solution";

test("noop — пустая функция", () => {
  expect(noop()).toBeUndefined();
});

test("getThen возвращает .then", () => {
  expect(getThen({ then: 42 })).toBe(42);
  expect(getThen({})).toBeUndefined();
});

test("tryCallOne вызывает fn", () => {
  expect(tryCallOne((x: number) => x * 2, 5)).toBe(10);
});

test("tryCallOne возвращает null при ошибке", () => {
  expect(tryCallOne(() => { throw new Error(); }, 1)).toBeNull();
});

test("tryCallTwo вызывает fn", () => {
  let called = false;
  tryCallTwo((a: any, b: any) => { called = true; }, 1, 2);
  expect(called).toBe(true);
});

test("MyPromise — resolve", async () => {
  const p = new MyPromise((resolve: any) => resolve(42));
  expect(await p.then((v: number) => v)).toBe(42);
});

test("MyPromise — reject", async () => {
  const p = new MyPromise((_: any, reject: any) => reject(new Error("fail")));
  try {
    await p.then(() => {}, (err: any) => { throw err; });
  } catch (e: any) {
    expect(e).toBeInstanceOf(Error);
  }
});

test("Handler хранит callbacks", () => {
  const h = new Handler(() => 1, () => 2, {});
  expect(typeof h.onFulfilled).toBe("function");
  expect(typeof h.onRejected).toBe("function");
});

test("resolve + reject функции", () => {
  expect(typeof resolve).toBe("function");
  expect(typeof reject).toBe("function");
  expect(typeof handle).toBe("function");
  expect(typeof handleResolved).toBe("function");
  expect(typeof safeThen).toBe("function");
  expect(typeof finale).toBe("function");
  expect(typeof doResolve).toBe("function");
});
