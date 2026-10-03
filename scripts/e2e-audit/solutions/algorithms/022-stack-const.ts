export class Stack {
  private storage: number[] = [];
  private minStack: number[] = [];

  push(v: number): void {
    this.storage.push(v);
    if (this.minStack.length === 0 || v <= this.minStack[this.minStack.length - 1]) {
      this.minStack.push(v);
    }
  }
  pop(): number | undefined {
    const v = this.storage.pop();
    if (v !== undefined && v === this.minStack[this.minStack.length - 1]) {
      this.minStack.pop();
    }
    return v;
  }
  getMin(): number | undefined {
    return this.minStack[this.minStack.length - 1];
  }
}
