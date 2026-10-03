export type Resource = string;
export type Vector = Record<Resource, Resource[]>;

export function hasCircularDependency(entrypoint: Resource, deps: Vector): boolean {
  if (!deps[entrypoint]) return false; // Если точка входа отсутствует — цикла нет

  const stack = [...deps[entrypoint]];
  const visited = new Set<Resource>();

  while (stack.length > 0) {
    const item = stack.pop()!;

    if (visited.has(item)) {
      return true; // Найден цикл
    }

    if (deps[item]?.length === 0) {
      return false;
    }

    visited.add(item);

    if (deps[item]) {
      stack.push(...deps[item]); // Добавляем зависимости в стек
    }
  }

  return false;
}

// function hasCircularDependency(entrypoint: Resource, deps: Vector): boolean {
//   const visited = new Set<Resource>(); // Глобальный список посещённых
//   const stack = new Set<Resource>(); // Локальный стек текущего пути

//   function dfs(resource: Resource): boolean {
//     if (stack.has(resource)) return true; // Найден цикл
//     if (visited.has(resource)) return false; // Уже проверяли этот узел

//     stack.add(resource);
//     visited.add(resource);

//     for (const dep of deps[resource] || []) {
//       if (dfs(dep)) return true;
//     }

//     stack.delete(resource); // Удаляем из пути, т.к. вернулись
//     return false;
//   }

//   return dfs(entrypoint);
// }

// примеры
console.log(
  hasCircularDependency("index.js", {
    "index.js": ["foo.js", "bar.js"],
    "bar.js": ["baz.js"],
    "foo.js": ["baz.js"],
    "baz.js": ["x.js"],
    "x.js": ["foo.js"], // <- cycle: index -> foo -> baz -> x -> foo
  })
); // true (C)

console.log(
  hasCircularDependency("index.js", {
    "index.js": ["foo.js", "bar.js"],
    "bar.js": ["baz.js"],
    "foo.js": ["baz.js"],
    "baz.js": ["x.js"],
    "x.js": [], // <- Нет ссылок на предков, значит цикла нет
  })
); // false (нет цикла)

console.log(
  hasCircularDependency("index.js", {
    "index.js": ["index.js"], // <- Ссылается сам на себя
  })
); // true (есть цикл)

console.log(hasCircularDependency("index.js", {})); // false (нет зависимостей)