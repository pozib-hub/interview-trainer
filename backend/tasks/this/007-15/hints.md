## Подсказка 1
`Person.getFullName = function(){...}` — добавляет метод в сам конструктор `Person`, а не в `Person.prototype`. Это статический метод.

## Подсказка 2
`member` — экземпляр, созданный через `new Person()`. Экземпляры наследуют от `Person.prototype`, а не от самого `Person`.

## Подсказка 3
`member.getFullName()` → `TypeError: member.getFullName is not a function`. Исправление: `Person.prototype.getFullName = function(){...}`.
