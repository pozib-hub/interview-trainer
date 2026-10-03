# Event Loop: микрозадачи и макрозадачи

Определите порядок вывода в консоль:

```ts
setTimeout(() => console.log(1));

Promise.reject(2).catch(console.log);

Promise.resolve().then(() => setTimeout(() => console.log(3)));

new Promise((resolve) => setTimeout(resolve)).then(() => console.log(4));

Promise.resolve(5).then(console.log);

setTimeout(() => console.log(6));

console.log(7);
```

Реализуйте функцию `getResult()`, возвращающую массив строк в порядке вывода.
