# Event Loop: бесконечная рекурсия

Определите, что выведется в консоль:

```ts
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");

(function a() {
  console.log("5");
  a();
})();

console.log("6");
```

Реализуйте функцию `getResult()`, возвращающую массив строк синхронного вывода (до ошибки).
Какая ошибка возникнет?
