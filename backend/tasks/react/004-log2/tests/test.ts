import { test, expect } from "vitest";
import { getOrder } from "../solution";

test("порядок логов React (StrictMode mount + deps)", () => {
  expect(getOrder()).toEqual([
    "App render",
    "App render",
    "Parent useEffect",
    "App useEffect",
    "App useEffect cleanup",
    "Parent useEffect cleanup",
    "Parent useEffect",
    "App useEffect",
  ]);
});
