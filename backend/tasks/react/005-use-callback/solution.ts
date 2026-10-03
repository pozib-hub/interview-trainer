export function areDepsEqual(oldDeps: any[], newDeps: any[]): boolean {
  if (oldDeps.length !== newDeps.length) return false;
  return oldDeps.every((dep, i) => Object.is(dep, newDeps[i]));
}

export function useCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[],
  ref: { callback: T; deps: any[] } | null
): { callback: T; deps: any[] } | null {
  if (!ref || !areDepsEqual(ref.deps, deps)) {
    return { callback, deps };
  }
  return ref;
}
