# This: вложенная функция

Что выведется в консоль?

```ts
var object = {
  data: "Some Data",
  foo: function () {
    console.log(this.data);
    function bar() {
      console.log(this.data);
    }
    bar();
  },
};

object.foo();
```

Реализуйте функцию `getResult()`, возвращающую массив строк с выводом консоли (начиная с `"ответ"`).

Код выполняется как ESM-модуль (strict mode).
