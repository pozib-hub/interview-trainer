# Event Loop: очередь микрозадач

Определите порядок вывода в консоль:

```ts
const run = () => {
  setTimeout(() => console.log("timeout"), 0);

  console.log(1);

  new Promise((resolve) => {
    console.log("Promise");
    setTimeout(() => {
      console.log("777");
      resolve("");
    }, 0);
  })
    .then(() => console.log("then1"))
    .then(() => console.log("then2"));

  console.log(4);

  setTimeout(() => console.log("timeout2"), 0);
};

run();
```

Реализуйте функцию `getResult()`, возвращающую массив строк в порядке вывода.
