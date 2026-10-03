export function areDepsEqual(oldDeps: any[], newDeps: any[]): boolean {
  if (oldDeps.length !== newDeps.length) return false;
  for (let i = 0; i < oldDeps.length; i++) {
    if (!Object.is(oldDeps[i], newDeps[i])) return false;
  }
  return true;
}

export function getBigRandomList(): number[] {
  return new Array(1000).fill(0).map(() => Math.random());
}

export function calculateVisibleItems(
  scrollTop: number,
  itemHeight: number,
  viewportHeight: number,
  count: number
) {
  const start = Math.floor(scrollTop / itemHeight);
  const end = Math.min(count - 1, Math.ceil((scrollTop + viewportHeight) / itemHeight));
  return { start, end };
}

export function handleScroll(
  scrollTop: number,
  itemHeight: number,
  viewportHeight: number,
  count: number
) {
  return calculateVisibleItems(scrollTop, itemHeight, viewportHeight, count);
}
