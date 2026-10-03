import { test, expect, vi } from "vitest";
import { subscribe } from "../solution";

test("сообщения в порядке", () => {
  const rendered: string[] = [];
  subscribe((onMessage) => {
    onMessage({ id: 1, message: "One" });
    onMessage({ id: 2, message: "Two" });
    onMessage({ id: 3, message: "Three" });
  }, (msg) => rendered.push(msg));
  expect(rendered).toEqual(["One", "Two", "Three"]);
});

test("сообщения не по порядку — рендерит по очереди", () => {
  const rendered: string[] = [];
  subscribe((onMessage) => {
    onMessage({ id: 3, message: "Three" });
    onMessage({ id: 1, message: "One" });
    onMessage({ id: 2, message: "Two" });
  }, (msg) => rendered.push(msg));
  expect(rendered).toEqual(["One", "Two", "Three"]);
});

test("пропуск сообщения", () => {
  const rendered: string[] = [];
  subscribe((onMessage) => {
    onMessage({ id: 2, message: "Two" });
    onMessage({ id: 3, message: "Three" });
  }, (msg) => rendered.push(msg));
  expect(rendered).toEqual([]);
});

test("сообщения приходят после пропуска", () => {
  const rendered: string[] = [];
  let deliver: (msg: { id: number; message: string }) => void;
  subscribe((onMessage) => {
    deliver = onMessage;
  }, (msg) => rendered.push(msg));

  deliver!({ id: 2, message: "Two" });
  deliver!({ id: 1, message: "One" });
  expect(rendered).toEqual(["One", "Two"]);
});
