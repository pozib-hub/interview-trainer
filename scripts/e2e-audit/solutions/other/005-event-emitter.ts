export class EventEmitter {
  private handlers = new Map<string, Set<() => void>>();

  subscribe(event: string, cb: (...args: any[]) => void) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(cb);
    return {
      release: () => {
        this.handlers.get(event)?.delete(cb);
      },
    };
  }

  emit(event: string, ...args: any[]) {
    this.handlers.get(event)?.forEach((cb) => (cb as any)(...args));
  }
}

export function callback1(x: number, y: number) {
  return x + y;
}
export function callback2(x: number, y: number) {
  return x * y;
}
export const emitter = new EventEmitter();
export const sub1 = emitter.subscribe("event1", () => {});
export const sub2 = emitter.subscribe("event2", () => {});
export const sub3 = emitter.subscribe("event3", () => {});
