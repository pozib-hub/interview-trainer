import { test, expect } from "vitest";
import "../solution";

test("следующий день в середине месяца", () => {
  const date = new Date("2014-06-20");
  expect(date.nextDay()).toBe("2014-06-21");
});

test("переход через конец месяца", () => {
  const date = new Date("2017-10-31");
  expect(date.nextDay()).toBe("2017-11-01");
});

test("переход через конец года", () => {
  const date = new Date("2017-12-31");
  expect(date.nextDay()).toBe("2018-01-01");
});

test("високосный год", () => {
  const date = new Date("2020-02-28");
  expect(date.nextDay()).toBe("2020-02-29");
});

test("не високосный год", () => {
  const date = new Date("2019-02-28");
  expect(date.nextDay()).toBe("2019-03-01");
});

test("исходный объект не изменяется", () => {
  const date = new Date("2014-06-20");
  const before = date.toISOString().slice(0, 10);
  date.nextDay();
  expect(date.toISOString().slice(0, 10)).toBe(before);
});

test("метод доступен на любом Date", () => {
  expect(new Date("2021-01-01").nextDay()).toBe("2021-01-02");
  expect(new Date("1999-12-31").nextDay()).toBe("2000-01-01");
});
