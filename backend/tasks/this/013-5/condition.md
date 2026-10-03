# This: callback внутри map

Что выведется в консоль?

```ts
const user = {
  name: "Bob",
  roles: ["friend", "brother", "student"],
  getRoles: function () {
    return this.roles.map(function (role) {
      return this.name + " is " + role;
    });
  },
};

console.log(user.getRoles());
```

Реализуйте функцию `getResult()`, возвращающую массив строк: сначала `"ответ"`, затем вывод консоли (результат `console.log`).

Как исправить — подумайте сами (см. подсказки).

Код выполняется как ESM-модуль (strict mode).
