export class Stack<T> {
  private storage: T[] = [];

  push(item: T): void {
    this.storage.push(item);
  }
  pop(): T | undefined {
    return this.storage.pop();
  }
  size(): number {
    return this.storage.length;
  }
}

export class Queue<T> {
  private stack1: Stack<T> = new Stack<T>();
  private stack2: Stack<T> = new Stack<T>();

  enqueue(item: T): void {
    this.stack1.push(item);
  }
  dequeue(): T {
    if (this.isEmpty()) throw new Error("Queue is empty");
    if (this.stack2.size() === 0) {
      while (this.stack1.size() > 0) {
        this.stack2.push(this.stack1.pop()!);
      }
    }
    return this.stack2.pop()!;
  }
  count(): number {
    return this.stack1.size() + this.stack2.size();
  }
  isEmpty(): boolean {
    return this.count() === 0;
  }
}
