# This: filter и потеря контекста

Что выведется в консоль?

```ts
const users = {
  currentFilter: "active",
  users: [
    { name: "Alex", status: "active" },
    { name: "Nick", status: "deleted" },
  ],
  getFilteredUsers: function () {
    return this.users.filter(function (user) {
      return user.status === this.currentFilter;
    });
  },
};

console.log(users.getFilteredUsers());
```

Реализуйте функцию `getResult()`, возвращающую массив строк: сначала `"ответ"`, затем вывод консоли.

Как исправить — подумайте сами (см. подсказки).
