import { test, expect } from "vitest";
import { sortDates } from "../solution";

test("сортирует по дате", () => {
  const input = [
    { date: "10.01.2017" },
    { date: "01.12.2002" },
    { date: "11.02.2021" },
    { date: "05.11.2016" },
  ];

  const result = sortDates(input);

  expect(result[0].date).toBe("01.12.2002");
  expect(result[1].date).toBe("05.11.2016");
  expect(result[2].date).toBe("10.01.2017");
  expect(result[3].date).toBe("11.02.2021");
});

test("не мутирует оригинал", () => {
  const input = [{ date: "10.01.2017" }, { date: "01.12.2002" }];
  const original = [...input];
  sortDates(input);
  expect(input).toEqual(original);
});

test("пустой массив", () => {
  expect(sortDates([])).toEqual([]);
});
