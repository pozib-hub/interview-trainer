# Event Loop: sleep и отложенные микрозадачи

Определите порядок вывода в консоль:

```ts
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(function () {
  console.log(1);
  setTimeout(() => console.log(2), 1000);
  Promise.resolve().then(() => {
    sleep(1000).then(() => console.log(3));
    console.log(4);
  });
  console.log(5);
})();
```

Реализуйте функцию `getOrder()`, возвращающую `Promise<string[]>` — порядок вывода.
