# TS: Replace в строковых типах

Реализуйте тип `Replace<S, From, To>` — заменяет первое вхождение `From` на `To` в строке `S`:

```ts
type Replace<"foobar", "bar", "foo"> = "foofoo";
type Replace<"foobar", "foo", "bar"> = "barbar";
type Replace<"foobar", "", "foo"> = "foobar"; // пустая From — без изменений
type Replace<"foobar", "xyz", "abc"> = "foobar"; // нет вхождения — без изменений
```
