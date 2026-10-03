## Подсказка 1
Внутри IIFE `function a()` — имя `a` относится к самой функции (Named Function Expression). `console.log(a)` выведет функцию.

## Подсказка 2
Вне IIFE `return a` в `getA` возвращает переменную `var a = "var"` из замыкания. `SomeFuncSecond` наследует через `Object.create` и `SomeFuncFirst.call(this, ...)`.
