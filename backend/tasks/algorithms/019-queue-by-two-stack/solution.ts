export class Stack<T> {
  private storage: T[] = [];

  push(data: T) {
    this.storage.push(data);
  }

  pop() {
    return this.storage.pop();
  }

  size() {
    return this.storage.length;
  }
}

export class Queue<T> {
  private stack1: Stack<T> = new Stack();
  private stack2: Stack<T> = new Stack();

  enqueue(data: T) {
    this.stack1.push(data);
  }

  dequeue() {
    if (this.isEmpty()) {
      throw new Error("Очередь пуста");
    }
    if (this.stack2.size() === 0) {
      while (this.stack1.size() > 0) {
        this.stack2.push(this.stack1.pop()!);
      }
    }
    return this.stack2.pop();
  }

  count() {
    return this.stack1.size() + this.stack2.size();
  }

  isEmpty() {
    return this.stack1.size() === 0 && this.stack2.size() === 0;
  }
}
