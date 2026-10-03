# Compare: глубокое сравнение значений

Напишите функцию `compareValues(a, b)`, которая рекурсивно сравнивает два значения:

- Примитивы: `===` (с учётом `NaN` через `Object.is`)
- Массивы: поэлементно, одинаковой длины
- Объекты: по ключам, рекурсивно
- `null` проверяется отдельно
- Разные типы → `false`

```ts
compareValues(1, 1); // true
compareValues([1, 2], [1, 2]); // true
compareValues({ a: 1 }, { a: 1 }); // true
compareValues({ a: [1, 2] }, { a: [1, 2] }); // true
compareValues({ a: 1 }, { a: 2 }); // false
compareValues(null, null); // true
```
