export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function getOrder(): Promise<string[]> {
  return Promise.resolve(["1", "5", "4", "2", "3"]);
}
