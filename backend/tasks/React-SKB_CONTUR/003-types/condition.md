# React SKB/Contur: типы API

Определите TypeScript-типы для API валидации продуктов:

```ts
type Product = { name: string; id: string };
type Errors = Array<{ id: string; text: string }>;
type Response = { ok: false; errors: Errors } | { ok: true };
type Api = { saveList: (products: Product[]) => Promise<Response> };
```

Тип `Response` — это discriminated union: либо успешный ответ без ошибок, либо ответ с ошибками.
