## Подсказка 1
Используйте `Proxy` с `set` trap для перехвата присваивания свойству `foo`.

## Подсказка 2
В `set` trap: `target[key] = String(value)` — всегда сохранять строку. `typeof obj.foo` всегда будет `"string"`.
