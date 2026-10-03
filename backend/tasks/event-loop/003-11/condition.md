# Event Loop: async/await и микрозадачи

Определите порядок вывода в консоль:

```ts
test();
setTimeout(() => {
  console.log("3");
});

async function test() {
  console.log("1");
  await console.log("2");
  console.log("6");
  await console.log("7");
}

new Promise((res) => {
  console.log("4");
  res("");
}).then(() => console.log("5"));
```

Реализуйте функцию `getResult()`, возвращающую массив строк — порядок вывода.
