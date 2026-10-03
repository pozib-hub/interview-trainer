# Other: счётчик и замыкание

Что выведется в консоль?

```ts
let counter = 0;

function one() {
  console.log(++counter);
}

one();

function two(callback) {
  let counter = 5;
  callback();
}

two(one);
```

Реализуйте функции `counter`, `one()` и `two(callback)` так, чтобы вывод соответствовал ожидаемому.
