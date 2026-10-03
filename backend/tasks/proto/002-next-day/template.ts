declare global {
  interface Date {
    nextDay(): string;
  }
}

// TODO: реализуйте — назначьте метод nextDay на Date.prototype
Date.prototype.nextDay = function (): string {
  return "";
};

export {};
