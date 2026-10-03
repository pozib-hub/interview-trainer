import { test, expect } from "vitest";
import { modifyBondData, getResult } from "../solution";

test("modifyBondData мутирует price", () => {
  const price = { rub: 1000 };
  const printFn = modifyBondData(price, "floating", false);
  expect(price.rub).toBe(1200);
});

test("modifyBondData не меняет bondType и isEditable снаружи", () => {
  const price = { rub: 1000 };
  let bondType = "floating";
  let isEditable = false;
  modifyBondData(price, bondType, isEditable);
  expect(bondType).toBe("floating");
  expect(isEditable).toBe(false);
});

test("getResult — после modifyBondData", () => {
  const result = getResult();
  expect(result.afterModify.price.rub).toBe(1200);
  expect(result.afterModify.bondType).toBe("floating");
  expect(result.afterModify.isEditable).toBe(false);
});

test("getResult — замыкание видит изменённые значения", () => {
  const result = getResult();
  expect(result.afterReassign.price.rub).toBe(1200);
  expect(result.afterReassign.bondType).toBe("fixed");
  expect(result.afterReassign.isEditable).toBe(true);
});
