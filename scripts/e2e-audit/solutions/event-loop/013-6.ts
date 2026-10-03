export function getOrder(): Promise<string[]> {
  return Promise.resolve([
    "1",
    "Promise",
    "4",
    "timeout",
    "777",
    "then1",
    "then2",
    "timeout2",
  ]);
}
