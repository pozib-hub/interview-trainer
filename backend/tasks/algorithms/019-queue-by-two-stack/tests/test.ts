import { test, expect } from "vitest";
import { Stack, Queue } from "../solution";

test("Stack: push и pop", () => {
  const s = new Stack<number>();
  s.push(1);
  s.push(2);
  s.push(3);
  expect(s.size()).toBe(3);
  expect(s.pop()).toBe(3);
  expect(s.pop()).toBe(2);
  expect(s.size()).toBe(1);
});

test("Stack: pop пустого стека", () => {
  const s = new Stack<number>();
  expect(s.pop()).toBeUndefined();
});

test("Queue: FIFO порядок", () => {
  const q = new Queue<number>();
  q.enqueue(1);
  q.enqueue(2);
  q.enqueue(3);
  expect(q.dequeue()).toBe(1);
  expect(q.dequeue()).toBe(2);
  expect(q.dequeue()).toBe(3);
});

test("Queue: count и isEmpty", () => {
  const q = new Queue<number>();
  expect(q.isEmpty()).toBe(true);
  q.enqueue(10);
  q.enqueue(20);
  expect(q.count()).toBe(2);
  expect(q.isEmpty()).toBe(false);
  q.dequeue();
  q.dequeue();
  expect(q.isEmpty()).toBe(true);
});

test("Queue: dequeue пустой очереди бросает ошибку", () => {
  const q = new Queue<number>();
  expect(() => q.dequeue()).toThrow();
});

test("Queue: интерливинг enqueue/dequeue", () => {
  const q = new Queue<number>();
  q.enqueue(1);
  q.enqueue(2);
  q.dequeue();
  q.enqueue(3);
  q.enqueue(4);
  expect(q.dequeue()).toBe(2);
  expect(q.dequeue()).toBe(3);
  expect(q.dequeue()).toBe(4);
});
