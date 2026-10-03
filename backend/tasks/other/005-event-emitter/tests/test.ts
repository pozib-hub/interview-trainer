import { test, expect, vi } from "vitest";
import { EventEmitter } from "../solution";

test("subscribe + emit", () => {
  const ee = new EventEmitter();
  const cb = vi.fn();
  const sub = ee.subscribe("event", cb);

  ee.emit("event", 1, 2, 3);
  expect(cb).toHaveBeenCalledWith(1, 2, 3);

  sub.release();
});

test("несколько подписчиков", () => {
  const ee = new EventEmitter();
  const cb1 = vi.fn();
  const cb2 = vi.fn();

  ee.subscribe("e", cb1);
  ee.subscribe("e", cb2);
  ee.emit("e", "data");

  expect(cb1).toHaveBeenCalledWith("data");
  expect(cb2).toHaveBeenCalledWith("data");
});

test("release отписывает", () => {
  const ee = new EventEmitter();
  const cb = vi.fn();
  const sub = ee.subscribe("e", cb);

  sub.release();
  ee.emit("e", "data");

  expect(cb).not.toHaveBeenCalled();
});

test("emit без подписчиков не падает", () => {
  const ee = new EventEmitter();
  expect(() => ee.emit("unknown", 1)).not.toThrow();
});
