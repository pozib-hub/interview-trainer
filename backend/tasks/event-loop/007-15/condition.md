# Event Loop: Promise constructor + then

Определите порядок вывода в консоль:

```ts
setTimeout(() => console.log("setTimeout 1"), 0);

new Promise((resolve, reject) => {
  console.log("Promise 1");
  resolve();
  console.log("Promise 2");
}).then(() => console.log("Promise 3"));

Promise.resolve().then(() => setTimeout(() => console.log("setTimeout 2"), 0));
Promise.resolve().then(() => console.log("Promise 4"));

setTimeout(() => console.log("setTimeout 3"), 0);

console.log("final");
```

Реализуйте функцию `getResult()`, возвращающую массив строк в порядке вывода.
