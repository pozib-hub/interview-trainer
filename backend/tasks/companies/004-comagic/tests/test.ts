import { test, expect, vi } from "vitest";
import { getEventLoopOrder, testThisBinding, debounce, treeFn, tree } from "../solution";

test("event loop order", async () => {
  const order = await getEventLoopOrder();
  expect(order).toEqual([
    "Promise 1",
    "Promise 2",
    "final",
    "Promise 3",
    "Promise 4",
    "setTimeout 1",
    "setTimeout 3",
    "setTimeout 2",
  ]);
});

test("this binding — unbound возвращает undefined", () => {
  const result = testThisBinding();
  expect(result.unbound).toBe("name is: undefined");
});

test("this binding — bound возвращает David", () => {
  const result = testThisBinding();
  expect(result.bound).toBe("name is: David");
});

test("debounce вызывает только последний", () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  const debounced = debounce(fn, 300);

  debounced(1);
  debounced(2);
  debounced(3);

  vi.advanceTimersByTime(300);
  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith(3);
  vi.useRealTimers();
});

test("treeFn уплощает дерево", () => {
  expect(treeFn(tree)).toEqual({
    "a.b": "two",
    "a.c.d": "one",
  });
});
