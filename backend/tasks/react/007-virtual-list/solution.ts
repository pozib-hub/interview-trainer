export function areDepsEqual(oldDeps: any[], newDeps: any[]): boolean {
  if (oldDeps.length !== newDeps.length) return false;
  return oldDeps.every((dep, i) => Object.is(dep, newDeps[i]));
}

export function getBigRandomList(): number[] {
  return new Array(1000).fill(0).map(() => Math.random());
}

export function calculateVisibleItems(
  scrollTop: number,
  itemHeight: number,
  viewportHeight: number,
  count: number
): { start: number; end: number } {
  const countItemsInViewport = Math.ceil(viewportHeight / itemHeight);
  const start = Math.floor(scrollTop / itemHeight);
  const end = Math.min(count - 1, start + countItemsInViewport);
  return { start, end };
}
