export function areDepsEqual(oldDeps: any[], newDeps: any[]): boolean {
  if (oldDeps.length !== newDeps.length) return false;
  for (let i = 0; i < oldDeps.length; i++) {
    if (!Object.is(oldDeps[i], newDeps[i])) return false;
  }
  return true;
}

export function useCallback(
  callback: Function,
  deps: any[],
  prevRef: { callback: any; deps: any[] } | null
) {
  if (prevRef === null) {
    return { callback, deps };
  }
  if (areDepsEqual(prevRef.deps, deps)) {
    return prevRef;
  }
  return { callback, deps };
}
