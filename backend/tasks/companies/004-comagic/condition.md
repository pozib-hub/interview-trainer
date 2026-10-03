# Companies: Comagic — event loop, this, debounce, дерево

Решите 4 задачи:

1. **Event loop порядок** — реализуйте `getEventLoopOrder(): Promise<string[]>`, возвращающую порядок вывода для кода с `setTimeout` и `Promise`.

2. **This binding** — реализуйте `testThisBinding()`, возвращающую `{ unbound, bound }`:
   - `unbound` — вызов метода без привязки (`this` = `undefined`)
   - `bound` — вызов метода через `.bind(obj)()`

3. **Debounce** — реализуйте `debounce(fn, time)`, вызывающую `fn` только один раз после последнего вызова.

4. **Дерево** — реализуйте `treeFn(obj)`, преобразующую вложенный объект в плоский с путями-ключами:

```ts
treeFn({ a: { b: 'two', c: { d: 'one' } } })
// => { 'a.b': 'two', 'a.c.d': 'one' }
```
