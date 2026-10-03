# React SKB/Contur: API валидация

Реализуйте функцию `saveList(products: Product[])`, которая валидирует список продуктов и возвращает `Response`:

```ts
type Product = { id: string; name: string };
type Error = { id: string; text: string };
type Errors = Error[];
type Response = { ok: boolean; errors?: Errors };
```

Правила валидации:
- Имя должно быть заполнено (не пустая строка)
- Имя должно быть длиннее 2 символов (если не пустое)
- Имя не должно содержать спецсимволы (`\W` или `_`)
- Список не должен быть пустым

Если есть ошибки — `{ ok: false, errors }`, иначе `{ ok: true }`.

Также экспортируйте объект `Api` с методом `saveList`.
