declare global {
  interface Function {
    delay(ms: number): (...args: any[]) => void;
  }
}

export function getResult(): boolean {
  // TODO: реализуйте
  return undefined as any;
}

export {};
