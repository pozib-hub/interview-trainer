export function getOrder(): Promise<string[]> {
  return Promise.resolve([
    "before promise",
    "in Promise",
    "log1",
    "Promise then-1",
    "Promise then 2",
    "setTimeout 0",
  ]);
}
