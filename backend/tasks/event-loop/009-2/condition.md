# Event Loop: Promise + setTimeout

Определите порядок вывода в консоль:

```ts
const promise = new Promise((resolve) => {
  console.log(1);

  setTimeout(() => {
    console.log("timerStart");
    resolve("success");
    console.log("timerEnd");
  }, 0);

  console.log(2);
});

promise.then((res) => {
  console.log(res);
});

console.log(4);
```

Реализуйте функцию `getResult()`, возвращающую массив строк в порядке вывода.
