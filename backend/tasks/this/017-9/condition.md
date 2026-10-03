# This: метод delay для Function.prototype

Реализуйте `Function.prototype.delay(ms)` — метод, который возвращает новую функцию, откладывающую вызов исходной функции на `ms` миллисекунд.

```ts
function log(arg) {
  console.log(arg);
}

const delayedLog = log.delay(1000);
delayedLog("hello"); // выведет "hello" через 1 секунду
```

Метод должен корректно передавать `this` и аргументы.

Реализуйте функцию `getResult()`, возвращающую `true` если реализация работает корректно.
