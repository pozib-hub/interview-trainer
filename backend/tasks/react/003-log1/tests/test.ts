import { test, expect } from "vitest";
import { getOrder } from "../solution";

test("порядок useEffect и useLayoutEffect (StrictMode mount)", () => {
  expect(getOrder()).toEqual([
    "App",
    "App",
    "useLayoutEffect",
    "useLayoutEffect cleanup",
    "useLayoutEffect",
    "useEffect 1",
    "useEffect 2",
    "useEffect 2 cleanup",
    "useEffect 1 cleanup",
    "useEffect 1",
    "useEffect 2",
  ]);
});
