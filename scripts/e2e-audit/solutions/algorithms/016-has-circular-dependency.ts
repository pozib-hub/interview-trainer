export function hasCircularDependency(entrypoint: Resource, deps: Vector): boolean {
  const visiting = new Set<Resource>();
  const visited = new Set<Resource>();

  function dfs(node: Resource): boolean {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;
    visiting.add(node);
    for (const dep of deps[node] || []) {
      if (dfs(dep)) return true;
    }
    visiting.delete(node);
    visited.add(node);
    return false;
  }

  return dfs(entrypoint);
}
export function dfs(node: Resource, deps: Vector, seen: Set<Resource>): boolean {
  if (seen.has(node)) return true;
  seen.add(node);
  for (const dep of deps[node] || []) {
    if (dfs(dep, deps, seen)) return true;
  }
  seen.delete(node);
  return false;
}
export type Resource = string;
export type Vector = Record<Resource, Resource[]>;
