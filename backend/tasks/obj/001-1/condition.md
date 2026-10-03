# Obj: ключи объекта как [object Object]

Что выведется в консоль?

```ts
const a = { a: "a" };
const b = { b: "b" };
const c = {};

c[a] = a;
c[b] = b;

console.log(c[a].a, c[b].b);
```

Реализуйте функцию `getResult()`, возвращающую массив строк с выводом консоли.
