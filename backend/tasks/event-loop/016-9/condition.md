# Event Loop: reject и цепочка catch

Определите порядок вывода в консоль:

```ts
console.log(1);

const a = new Promise((resolve, reject) => {
  console.log(2);
  reject();
});
setTimeout(() => {
  console.log(3);
});
a.then(() => console.log(4))
  .catch(() => console.log(5))
  .catch(() => console.log(6))
  .then(() => console.log(7));

console.log(8);
```

Реализуйте функцию `getResult()`, возвращающую массив строк в порядке вывода.
