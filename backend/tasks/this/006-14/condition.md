# This: стрелочная функция в методе объекта

Что выведется в консоль?

```ts
const shape = {
  radius: 10,
  diameter() {
    return this.radius * 2;
  },
  perimeter: () => 2 * Math.PI * this.radius,
};

console.log(shape.diameter());
console.log(shape.perimeter());
```

Реализуйте функцию `getResult()`, возвращающую массив строк: сначала `"ответ"`, затем вывод консоли.

Как исправить `perimeter` — подумайте сами (см. подсказки).
