import { test, expect } from "vitest";
import { logger, loggerCheck, execute, testLogger, testModifyItemData, checkOrder } from "../solution";

test("logger.check возвращает строку", () => {
  expect(logger.check()).toBe("This is Dev mode");
});

test("loggerCheck (bound) возвращает строку", () => {
  expect(loggerCheck()).toBe("This is Dev mode");
});

test("execute вызывает fn и возвращает результат", () => {
  expect(execute(() => 42)).toBe(42);
});

test("testLogger — оба вызова дают одинаковый результат", () => {
  const result = testLogger();
  expect(result.check1).toBe("This is Dev mode");
  expect(result.check2).toBe("This is Dev mode");
});

test("testModifyItemData — после modifyItemData", () => {
  const result = testModifyItemData();
  expect(result.afterModify.price.rub).toBe(5000);
  expect(result.afterModify.platform).toBe("Android");
  expect(result.afterModify.isModified).toBe(true);
});

test("testModifyItemData — замыкание видит изменённые значения", () => {
  const result = testModifyItemData();
  expect(result.closureResult.price.rub).toBe(5000);
  expect(result.closureResult.platform).toBe("iOS");
  expect(result.closureResult.isModified).toBe(null);
});

test("checkOrder — порядок вывода", async () => {
  const order = await checkOrder();
  expect(order).toEqual(["1", "2", "6", "3", "4", "5"]);
});
