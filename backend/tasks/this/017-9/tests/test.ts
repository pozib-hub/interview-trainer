import { test, expect, vi } from "vitest";
import { getResult } from "../solution";

test("delay откладывает вызов", async () => {
  const log = vi.fn();
  const delayedLog = log.delay(50);
  delayedLog("hello");
  expect(log).not.toHaveBeenCalled();
  await new Promise((r) => setTimeout(r, 100));
  expect(log).toHaveBeenCalledWith("hello");
});

test("getResult возвращает true", () => {
  expect(getResult()).toBe(true);
});
