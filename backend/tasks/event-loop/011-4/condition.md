# Event Loop: Promise constructor

Определите порядок вывода в консоль:

```ts
function ILovePromise() {
  console.log("before promise");
  return new Promise((resolve) => {
    console.log("in Promise");
    resolve("");
  });
}

setTimeout(() => {
  console.log("setTimeout 0");
}, 0);

ILovePromise().then(() => console.log("Promise then-1"));

console.log("log1");

new Promise((resolve) => resolve("Promise then 2")).then(console.log);
```

Реализуйте функцию `getOrder()`, возвращающую `Promise<string[]>` — порядок вывода.
