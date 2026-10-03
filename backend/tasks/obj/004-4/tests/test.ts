import { test, expect, vi } from "vitest";
import { Count } from "../solution";

test("Count возвращает замыкание", () => {
  const fn = Count();
  expect(typeof fn).toBe("function");
});

test("замыкание инкрементирует счётчик", () => {
  const logs: number[] = [];
  const fn = Count();
  const spy = vi.spyOn(console, "log").mockImplementation((v) => logs.push(v));

  fn();
  fn();
  fn();

  spy.mockRestore();
  expect(logs).toEqual([0, 1, 2]);
});

test("установка свойства не сбрасывает счётчик", () => {
  const logs: number[] = [];
  const fn = Count();
  const spy = vi.spyOn(console, "log").mockImplementation((v) => logs.push(v));

  fn();
  fn();
  (fn as any).counter = 0;
  fn();

  spy.mockRestore();
  expect(logs).toEqual([0, 1, 2]);
});

test("каждый Count независим", () => {
  const logs1: number[] = [];
  const logs2: number[] = [];
  const fn1 = Count();
  const fn2 = Count();
  const spy = vi.spyOn(console, "log");

  spy.mockImplementationOnce((v) => logs1.push(v));
  spy.mockImplementationOnce((v) => logs2.push(v));

  fn1();
  fn2();

  spy.mockRestore();
  expect(logs1).toEqual([0]);
  expect(logs2).toEqual([0]);
});
