export class EventEmitter {
  private handlers = new Map<string, ((...args: any[]) => void)[]>();

  on(event: string, callback: (...args: any[]) => void): this {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(callback);
    return this;
  }

  off(event: string, callback?: (...args: any[]) => void): this {
    if (!callback) {
      this.handlers.delete(event);
    } else {
      const list = this.handlers.get(event);
      if (list) {
        const idx = list.indexOf(callback);
        if (idx !== -1) list.splice(idx, 1);
      }
    }
    return this;
  }

  emit(event: string, ...args: any[]): this {
    for (const cb of this.handlers.get(event) ?? []) {
      cb(...args);
    }
    return this;
  }

  once(event: string, callback: (...args: any[]) => void): this {
    const wrapped = (...args: any[]) => {
      this.off(event, wrapped);
      callback(...args);
    };
    return this.on(event, wrapped);
  }
}
