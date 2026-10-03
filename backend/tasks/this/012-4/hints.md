## Подсказка 1
`Dog.bark = function(){...}` — добавляет метод в сам конструктор `Dog`, а не в `Dog.prototype`. Это статический метод.

## Подсказка 2
`fido` — экземпляр, созданный через `new Dog("fido")`. Экземпляры наследуют от `Dog.prototype`, а не от самого `Dog`.

## Подсказка 3
`fido.bark()` → `TypeError: fido.bark is not a function`.
Решение 1: `Dog.prototype.bark = function(){...}` — метод доступен всем экземплярам.
Решение 2: `Dog.bark()` — вызывать как статический метод (но `this.name` будет `undefined`).
