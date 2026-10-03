import { test, expect } from "vitest";
import { reconstructTrip } from "../solution";

test("восстанавливает маршрут", () => {
  const tickets = [
    { from: "Спб", to: "Минск" },
    { from: "Киев", to: "Новосибирск" },
    { from: "Череповец", to: "Москва" },
    { from: "Минск", to: "Киев" },
    { from: "Москва", to: "Спб" },
  ];

  const result = reconstructTrip(tickets);

  expect(result[0]).toEqual({ from: "Череповец", to: "Москва" });
  expect(result[1]).toEqual({ from: "Москва", to: "Спб" });
  expect(result[2]).toEqual({ from: "Спб", to: "Минск" });
  expect(result[3]).toEqual({ from: "Минск", to: "Киев" });
  expect(result[4]).toEqual({ from: "Киев", to: "Новосибирск" });
});

test("два билета", () => {
  expect(
    reconstructTrip([
      { from: "A", to: "B" },
      { from: "B", to: "C" },
    ])
  ).toEqual([
    { from: "A", to: "B" },
    { from: "B", to: "C" },
  ]);
});
