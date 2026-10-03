export function areDepsEqual(oldDeps: any[], newDeps: any[]): boolean {
  if (oldDeps.length !== newDeps.length) return false;
  for (let i = 0; i < oldDeps.length; i++) {
    if (!Object.is(oldDeps[i], newDeps[i])) return false;
  }
  return true;
}

export function useMemo(
  factory: () => any,
  deps: any[],
  prevRef: { value: any; deps: any[] } | null
) {
  if (prevRef === null) {
    return { value: factory(), deps };
  }
  if (areDepsEqual(prevRef.deps, deps)) {
    return prevRef;
  }
  return { value: factory(), deps };
}
