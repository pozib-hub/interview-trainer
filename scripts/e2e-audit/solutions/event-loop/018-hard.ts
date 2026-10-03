export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function getOrder(): Promise<string[]> {
  return Promise.resolve([
    "in promise",
    "log1",
    "Promise then",
    "setTimeout 100",
    "sleep 1000 then",
    "sleep 2000 then",
    "sleep 2000 finally",
    "finally setTimeout 1000",
  ]);
}
