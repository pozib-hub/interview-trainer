import { test, expect, vi } from "vitest";
import { cancellable } from "../solution";

test("fn вызывается через t мс, если отмена не срабатывает", () => {
  vi.useFakeTimers();
  const fn = vi.fn((x: number) => x * 5);
  const cancelFn = cancellable(fn, [2], 20);

  vi.advanceTimersByTime(20);
  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith(2);
  expect(fn).toHaveReturnedWith(10);

  vi.useRealTimers();
});

test("fn не вызывается, если cancelFn вызвана раньше t", () => {
  vi.useFakeTimers();
  const fn = vi.fn((x: number) => x ** 2);
  const cancelFn = cancellable(fn, [2], 100);

  vi.advanceTimersByTime(50);
  cancelFn();
  vi.advanceTimersByTime(100);

  expect(fn).not.toHaveBeenCalled();

  vi.useRealTimers();
});

test("отмена после выполнения не влияет на результат", () => {
  vi.useFakeTimers();
  const fn = vi.fn((x1: number, x2: number) => x1 * x2);
  const cancelFn = cancellable(fn, [2, 4], 30);

  vi.advanceTimersByTime(30);
  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveReturnedWith(8);

  cancelFn();
  vi.advanceTimersByTime(100);
  expect(fn).toHaveBeenCalledTimes(1);

  vi.useRealTimers();
});

test("передаёт несколько аргументов", () => {
  vi.useFakeTimers();
  const fn = vi.fn((a: number, b: number, c: number) => a + b + c);
  cancellable(fn, [1, 2, 3], 40);

  vi.advanceTimersByTime(40);
  expect(fn).toHaveBeenCalledWith(1, 2, 3);
  expect(fn).toHaveReturnedWith(6);

  vi.useRealTimers();
});

test("повторный вызов cancelFn безопасен", () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  const cancelFn = cancellable(fn, [], 50);

  cancelFn();
  cancelFn();
  vi.advanceTimersByTime(100);

  expect(fn).not.toHaveBeenCalled();

  vi.useRealTimers();
});
