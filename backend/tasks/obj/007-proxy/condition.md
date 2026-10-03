# Obj: Proxy с преобразованием типов

Необходимо реализовать объект `obj`, у которого свойство `foo` при любом присвоении значения всегда возвращает строку.

```ts
const obj = {};
obj.foo = 1;
console.log(typeof obj.foo); // "string"

obj.foo = true;
console.log(typeof obj.foo); // "string"

obj.foo = {};
console.log(typeof obj.foo); // "string"
```

Реализуйте функцию `getResult()`, возвращающую массив строк — результат каждого `typeof obj.foo`.
