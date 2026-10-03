export function areDepsEqual(oldDeps: any[], newDeps: any[]): boolean {
  if (oldDeps.length !== newDeps.length) return false;
  return oldDeps.every((dep, i) => Object.is(dep, newDeps[i]));
}

export function useMemo<T>(
  callback: () => T,
  deps: any[],
  ref: { value: T; deps: any[] } | null
): { value: T; deps: any[] } {
  if (!ref || !areDepsEqual(ref.deps, deps)) {
    return { value: callback(), deps };
  }
  return ref;
}
