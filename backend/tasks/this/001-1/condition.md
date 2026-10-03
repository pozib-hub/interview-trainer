# This: потеря контекста в setTimeout

Что выведется в консоль?

```ts
function greet(greeting: string) {
  setTimeout(function () {
    console.log(`${greeting} ${this.firstName} ${this.lastName}`);
  }, 100);
}
const user = { firstName: "John", lastName: "Boon" };

greet("hello");
```

Реализуйте функцию `getResult()`, возвращающую массив строк: сначала `"ответ"`, затем вывод консоли.

Как исправить код, чтобы `this` ссылался на `user` — подумайте сами (см. подсказки).
