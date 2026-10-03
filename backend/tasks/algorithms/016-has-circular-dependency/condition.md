# Написать ф-цию для определения цикличных зависимостей источников

Написать ф-цию для определения цикличных зависимостей источников
    type Resource = string;
    type Vector = Record<Resource, Resource[]>;

    function hasCircularDependency(entrypoint: Resource, deps: Vector): boolean {}

  // примеры
  hasCircularDependency("index.js", {
    "index.js": ["foo.js", "bar.js"],
    "bar.js": ["baz.js"],
    "foo.js": ["baz.js"],
    "baz.js": ["x.js"],
    "x.js": ["foo.js"], // <- cycle: index -> foo -> baz -> x -> foo
  }) // true (C)

  hasCircularDependency("index.js", {
    "index.js": ["foo.js", "bar.js"],
    "bar.js": ["baz.js"],
    "foo.js": ["baz.js"],
    "baz.js": ["x.js"],
    "x.js": [], // <- Нет ссылок на предков, значит цикла нет
  }) // false (нет цикла)


  hasCircularDependency("index.js", {
    "index.js": ["index.js"], // <- Ссылается сам на себя
  })  // true (есть цикл)

  hasCircularDependency("index.js", {})); // false (нет зависимостей)
