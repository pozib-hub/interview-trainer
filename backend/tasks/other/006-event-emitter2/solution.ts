export class EventEmitter {
  private emits: Map<string, Set<(...args: any[]) => void>>;

  constructor() {
    this.emits = new Map();
  }

  on(name: string, callback: (...args: any[]) => void) {
    if (!this.emits.has(name)) {
      this.emits.set(name, new Set());
    }
    this.emits.get(name)!.add(callback);
    return this;
  }

  emit(name: string, ...args: any[]) {
    if (this.emits.has(name)) {
      for (const callback of this.emits.get(name)!) {
        callback(...args);
      }
    }
    return this;
  }

  off(name: string) {
    if (this.emits.has(name)) {
      this.emits.delete(name);
    }
    return this;
  }
}
