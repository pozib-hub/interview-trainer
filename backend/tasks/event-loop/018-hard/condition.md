# Event Loop: sleep, finally, вложенные setTimeout

Определите порядок вывода в консоль:

```ts
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

setTimeout(() => {
  console.log("setTimeout 100");
  sleep(1000).then(() => {
    console.log("sleep 1000 then");
  });
}, 100);

const promise = new Promise((resolve) => {
  console.log("in promise");
  resolve("Promise then");
});

sleep(2000)
  .then(() => {
    console.log("sleep 2000 then");
  })
  .finally(() => {
    console.log("sleep 2000 finally");
    setTimeout(() => {
      console.log("finally setTimeout 1000");
    }, 1000);
  });

console.log("log1");

promise.then((res) => console.log(res));
```

Реализуйте функцию `getOrder()`, возвращающую `Promise<string[]>` — порядок вывода.
