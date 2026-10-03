import { test, expect, vi } from "vitest";
import { countArgsWrapper, example } from "../solution";

test("обёртка логирует количество аргументов", () => {
  const logs: string[] = [];
  const spy = vi.spyOn(console, "log").mockImplementation((...args) => {
    logs.push(args.join(" "));
  });

  const wrapped = countArgsWrapper(example);
  wrapped(1, 2);

  spy.mockRestore();
  expect(logs).toContain("Передано аргументов: 2");
});

test("обёртка возвращает результат fn", () => {
  const wrapped = countArgsWrapper(example);
  expect(wrapped(1, 2, 3)).toBe(6);
});

test("обёртка передаёт 0 аргументов", () => {
  const logs: string[] = [];
  const spy = vi.spyOn(console, "log").mockImplementation((...args) => {
    logs.push(args.join(" "));
  });

  const fn = vi.fn(() => 42);
  const wrapped = countArgsWrapper(fn);
  wrapped();

  spy.mockRestore();
  expect(logs).toContain("Передано аргументов: 0");
});
