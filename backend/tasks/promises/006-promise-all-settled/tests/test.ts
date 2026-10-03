import { test, expect } from "vitest";
import { promiseAllSettled } from "../solution";

test("все разрешены", async () => {
  const result = await promiseAllSettled([
    Promise.resolve(1),
    Promise.resolve(2),
  ]);
  expect(result).toEqual([
    { status: "fulfilled", value: 1 },
    { status: "fulfilled", value: 2 },
  ]);
});

test("часть отклонена", async () => {
  const result = await promiseAllSettled([
    Promise.resolve(1),
    Promise.reject("err"),
    Promise.resolve(3),
  ]);
  expect(result[0]).toEqual({ status: "fulfilled", value: 1 });
  expect(result[1]).toEqual({ status: "rejected", reason: "err" });
  expect(result[2]).toEqual({ status: "fulfilled", value: 3 });
});

test("пустой массив", async () => {
  const result = await promiseAllSettled([]);
  expect(result).toEqual([]);
});

test("все отклонены", async () => {
  const result = await promiseAllSettled([
    Promise.reject("a"),
    Promise.reject("b"),
  ]);
  expect(result).toEqual([
    { status: "rejected", reason: "a" },
    { status: "rejected", reason: "b" },
  ]);
});

test("сохраняет порядок", async () => {
  const result = await promiseAllSettled([
    new Promise((r) => setTimeout(() => r(1), 50)),
    Promise.reject("fast"),
  ]);
  expect(result[0]).toEqual({ status: "fulfilled", value: 1 });
  expect(result[1]).toEqual({ status: "rejected", reason: "fast" });
});
