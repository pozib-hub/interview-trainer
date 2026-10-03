export class Stack {
  private storage: number[] = [];
  private minStack: number[] = [];

  push(value: number): void {
    this.storage.push(value);
    if (this.minStack.length === 0 || value <= this.getMin()!) {
      this.minStack.push(value);
    }
  }

  pop(): number | undefined {
    if (this.storage.length === 0) return undefined;
    const removed = this.storage.pop();
    if (removed === this.getMin()) {
      this.minStack.pop();
    }
    return removed;
  }

  getMin(): number | undefined {
    return this.minStack[this.minStack.length - 1];
  }
}
