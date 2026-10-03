export function getOrder(): Promise<string[]> {
  return Promise.resolve(["1", "2", "5", "7", "3", "4", "6", "гOTOBO!"]);
}
