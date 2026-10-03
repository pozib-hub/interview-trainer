import { test, expect, vi } from "vitest";
import { fetchData } from "../solution";

test("fetchData логирует отмену", async () => {
  vi.useFakeTimers();
  const logs: string[] = [];
  const spy = vi.spyOn(console, "log").mockImplementation((...args) => {
    logs.push(args.join(" "));
  });

  const promise = fetchData();
  vi.advanceTimersByTime(6000);
  await promise;

  spy.mockRestore();
  vi.useRealTimers();

  expect(logs).toContain("Процесс отменен");
});
