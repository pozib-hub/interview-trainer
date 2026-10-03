export class EventEmitter {
  private emits: Map<string, Set<(...args: any[]) => void>>;

  constructor() {
    this.emits = new Map();
  }

  public subscribe<T extends any[]>(
    name: string,
    callback: (...args: T) => void
  ) {
    if (!this.emits.has(name)) {
      this.emits.set(name, new Set());
    }

    this.emits.get(name)?.add(callback);

    return {
      release: () => {
        this.emits.get(name)?.delete(callback);
      },
    };
  }

  public emit<T extends any[]>(name: string, ...args: T) {
    if (this.emits.has(name)) {
      for (const callback of this.emits.get(name)!) {
        callback(...args);
      }
    }
  }
}

export const emitter = new EventEmitter();

export const sub1 = emitter.subscribe("event1", callback1);
export const sub2 = emitter.subscribe("event2", callback2);
export const sub3 = emitter.subscribe("event1", callback1);

emitter.emit("event1", 1, 2);
emitter.emit("event2", 3, 4);

// В консоль выведется
// 3
// 3
// 12

sub1.release();
sub3.release();

emitter.emit("event1", 1, 2); // Ничего не выведет, все подписчики удалены
export function callback1(x: number, y: number) {
  console.log(x + y, "event 1");
}

export function callback2(x: number, y: number) {
  console.log(x * y, "event 2");
}