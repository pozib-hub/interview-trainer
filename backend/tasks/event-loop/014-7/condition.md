# Event Loop: несколько .then у одного Promise

Определите порядок вывода в консоль:

```ts
setTimeout(function timeout() {
  console.log(1);
}, 0);

let p = new Promise(function (resolve, reject) {
  console.log(2);
  resolve("");
});

p.then(function () {
  console.log(5);
}).then(function () {
  console.log(6);
});

p.then(function () {
  console.log(7);
}).then(function () {
  console.log(8);
});

console.log(4);
```

Реализуйте функцию `getOrder()`, возвращающую `Promise<string[]>` — порядок вывода.
