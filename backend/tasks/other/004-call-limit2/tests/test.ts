import { test, expect, vi } from "vitest";
import { runonce } from "../solution";

test("вызывает функцию только один раз", () => {
  const fn = vi.fn();
  const once = runonce(fn);

  once();
  once();
  once();

  expect(fn).toHaveBeenCalledTimes(1);
});

test("передаёт контекст и аргументы при первом вызове", () => {
  const fn = vi.fn();
  const once = runonce(fn);

  once();

  expect(fn).toHaveBeenCalledWith();
});

test("повторный runonce создаёт независимое замыкание", () => {
  const fn1 = vi.fn();
  const fn2 = vi.fn();

  const once1 = runonce(fn1);
  const once2 = runonce(fn2);

  once1();
  once2();
  once1();
  once2();

  expect(fn1).toHaveBeenCalledTimes(1);
  expect(fn2).toHaveBeenCalledTimes(1);
});
