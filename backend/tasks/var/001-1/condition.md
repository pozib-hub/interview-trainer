# Var: var vs let в цикле с setTimeout

Что выведется в консоль?

```ts
for (var index = 0; index < 10; index++) {
  setTimeout(function () {
    console.log(index);
  }, 0);
}
```

Реализуйте функцию `getResult()`, возвращающую массив строк: сначала `"ответ"`, затем описание вывода.

Как исправить — подумайте сами (см. подсказки).
