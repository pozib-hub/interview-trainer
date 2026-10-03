import { test, expect } from "vitest";
import { testThisBinding, testNewThis } from "../solution";

test("method call — this привязан к объекту", () => {
  const result = testThisBinding();
  expect(result.methodCall).toBe("Test");
});

test("unbound call — через call(obj) работает", () => {
  const result = testThisBinding();
  expect(result.unboundCall).toBe("Test");
});

test("bound call — bind фиксирует this", () => {
  const result = testThisBinding();
  expect(result.boundCall).toBe("Test");
});

test("apply call — apply устанавливает this", () => {
  const result = testThisBinding();
  expect(result.applyCall).toBe("Test");
});

test("arrow function — возвращает значение", () => {
  const result = testThisBinding();
  expect(result.arrowCall).toBe("arrow");
});

test("new — конструктор устанавливает this", () => {
  const result = testNewThis();
  expect(result.constructorThis).toBe(true);
});

test("прототипный метод доступен", () => {
  const result = testNewThis();
  expect(result.prototypeMethod).toBe("exists");
});
