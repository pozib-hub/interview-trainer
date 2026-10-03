declare global {
  interface Date {
    nextDay(): string;
  }
}

Date.prototype.nextDay = function (): string {
  const date = new Date(this.valueOf());
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

export {};
