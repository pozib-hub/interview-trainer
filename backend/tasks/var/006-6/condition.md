# Var: IIFE и setTimeout в цикле

Что выведется в консоль?

```ts
(function () {
  console.log("start");

  for (var i = 0; i < 100; i++) {
    ((i) => setTimeout(() => console.log(i), 5))(i);
  }

  console.log("end");
})();
```

Реализуйте функцию `getResult()`, возвращающую массив строк с выводом консоли (начиная с `"ответ"`).
