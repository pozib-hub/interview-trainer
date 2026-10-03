import { test, expect, vi } from "vitest";
import { EventEmitter } from "../solution";

test("on + emit", () => {
  const ee = new EventEmitter();
  const fn = vi.fn();
  ee.on("event", fn);
  ee.emit("event", "data");
  expect(fn).toHaveBeenCalledWith("data");
});

test("несколько обработчиков одного события", () => {
  const ee = new EventEmitter();
  const fn1 = vi.fn();
  const fn2 = vi.fn();
  ee.on("event", fn1).on("event", fn2);
  ee.emit("event");
  expect(fn1).toHaveBeenCalledTimes(1);
  expect(fn2).toHaveBeenCalledTimes(1);
});

test("emit без обработчиков", () => {
  const ee = new EventEmitter();
  expect(() => ee.emit("nonexistent")).not.toThrow();
});

test("off удаляет обработчики", () => {
  const ee = new EventEmitter();
  const fn = vi.fn();
  ee.on("event", fn);
  ee.off("event");
  ee.emit("event");
  expect(fn).not.toHaveBeenCalled();
});

test("цепочечный вызов", () => {
  const ee = new EventEmitter();
  expect(ee.on("a", () => {})).toBe(ee);
  expect(ee.emit("a")).toBe(ee);
  expect(ee.off("a")).toBe(ee);
});

test("аргументы передаются", () => {
  const ee = new EventEmitter();
  const fn = vi.fn();
  ee.on("event", fn);
  ee.emit("event", 1, 2, 3);
  expect(fn).toHaveBeenCalledWith(1, 2, 3);
});
