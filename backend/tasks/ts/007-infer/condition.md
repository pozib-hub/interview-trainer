# TS: infer в условных типах

Реализуйте тип `TObjectInfer<T>`, который извлекает тип значения из объекта:

```ts
type TObjectInfer<T> = /* ... */;

const data = {
  x: 1,
  y: "2",
  z: function () {},
};

type IData = TObjectInfer<typeof data>;
// IData = number | string | (() => void)
```

Если `T` не является объектом с строковыми ключами, тип должен вернуть `never`.
