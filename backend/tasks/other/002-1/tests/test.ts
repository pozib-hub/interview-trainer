import { test, expect } from "vitest";
import { counter, one, two } from "../solution";

test("counter инкрементируется one()", () => {
  const before = counter;
  one();
  expect(counter).toBe(before + 1);
});

test("two вызывает callback, но не влияет на внешний counter", () => {
  const before = counter;
  two(() => {});
  expect(counter).toBe(before);
});

test("one инкрементирует на 1", () => {
  const before = counter;
  one();
  expect(counter).toBe(before + 1);
});
