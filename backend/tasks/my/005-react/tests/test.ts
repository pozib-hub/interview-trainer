import { test, expect } from "vitest";
import { useCounter, App } from "../solution";

test("useCounter — функция", () => {
  expect(typeof useCounter).toBe("function");
});

test("App — функция (компонент)", () => {
  expect(typeof App).toBe("function");
});

test("useCounter возвращает count и обработчики мыши", () => {
  const { count, onMouseEnter, onMouseLeave } = useCounter(1000);
  expect(count).toBe(0);
  expect(typeof onMouseEnter).toBe("function");
  expect(typeof onMouseLeave).toBe("function");
});
