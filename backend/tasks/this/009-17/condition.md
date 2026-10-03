# This: привязка контекста

Дана функция `getName`, которая возвращает `this.name`. Реализуйте:

1. `testThisBinding()` — возвращает объект с результатами вызова `getName` разными способами:
   - `methodCall` — вызов как метод объекта
   - `unboundCall` — вызов через `.call(obj)`
   - `boundCall` — вызов через `.bind(obj)()`
   - `applyCall` — вызов через `.apply(obj)`
   - `arrowCall` — вызов стрелочной функции из объекта

2. `testNewThis()` — проверяет, что `this` в конструкторе и прототипах работает корректно:
   - `constructorThis` — `true`, если счётчик увеличился дважды
   - `prototypeMethod` — `"exists"`, если метод есть в прототипе
