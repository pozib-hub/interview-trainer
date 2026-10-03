## Подсказка 1

`$` должна находить элементы через `document.querySelectorAll(selector)` и возвращать объект-обёртку с методами `on`, `html` и `css`.

## Подсказка 2

Цепочка вызовов работает, только если каждый метод возвращает `this`.

## Подсказка 3

`html(content?)` без аргумента — чтение `innerHTML` первого элемента, с аргументом — установка всем найденным. `css(property, value)` — `element.style.setProperty(property, value)`.
