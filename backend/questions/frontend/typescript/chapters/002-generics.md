# Дженерики

## Что такое дженерики и зачем они нужны?

Дженерик — параметр типа, который заполняется при использовании: функция или тип «шаблонизируется». Это переиспользование кода без потери информации о типах.

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
const n = first([1, 2, 3]);      // n: number | undefined
const s = first(["a", "b"]);     // s: string | undefined
```

Без дженерика пришлось бы писать либо копии функции для каждого типа, либо использовать `any` и терять типизацию.

## Что такое constraints (ограничения) дженериков?

`extends` сужает допустимые типы параметра: доступными становятся свойства ограничения.

```ts
function getLength<T extends { length: number }>(x: T): number {
  return x.length; // length доступна благодаря constraint
}
getLength("abc");     // ок
getLength([1, 2]);    // ок
getLength(42);        // ошибка
```

`keyof T` — частый constraint: `function pick<T, K extends keyof T>(obj: T, key: K)` гарантирует, что ключ существует.

## Что делает keyof и как его применять?

`keyof T` — union всех ключей типа `T`. Позволяет типобезопасно обращаться к свойствам по «переменному» ключу.

```ts
interface User { id: number; name: string; email: string }
type UserKey = keyof User; // "id" | "name" | "email"

function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

Связка `keyof` + индексный доступ `T[K]` закрывает целый класс ошибок с динамическими ключами.

## Что такое infer и когда используется?

`infer` объявляет переменную типа внутри условного типа, чтобы извлечь её из совпадения. Основа утилит вроде `ReturnType`.

```ts
type ReturnType<T> = T extends (...args: never[]) => infer R ? R : never;
type ElementOf<T> = T extends (infer E)[] ? E : never;

type R = ReturnType<() => string>;   // string
type E = ElementOf<number[]>;        // number
```

Если совпадение удалось, `infer`-переменная получает конкретный тип; нет — работает ветка `else`. Извлечение типов промисов (`Awaited`), элементов массивов и аргументов функций — типовые применения.

## Что такое дженерики по умолчанию?

Значение параметра типа, если он не указан явно: `T = User`.

```ts
interface ApiResponse<T = unknown> {
  status: number;
  data: T;
}
const r1: ApiResponse = { status: 200, data: anything }; // data: unknown
const r2: ApiResponse<User> = { status: 200, data: user };
```

Дефолты упрощают API: частые сценарии не требуют указания типов, а редкие — могут переопределить.

## Как типизировать классы с дженериками?

Параметр типа после имени класса доступен во всех полях и методах.

```ts
class Store<T> {
  private items: T[] = [];
  add(item: T): void { this.items.push(item); }
  getAll(): T[] { return [...this.items]; }
}
const numStore = new Store<number>();
numStore.add(1);      // ок
numStore.add("1");    // ошибка
```

Так устроены коллекции в стандартной библиотеке и state-менеджеры: тип элемента фиксируется один раз при создании инстанса.

## Чем дженерик-функция отличается от union-параметра?

Union допускает перемешивание: функция принимает любой из типов, но связи между аргументами и результатом нет. Дженерик фиксирует конкретный тип на каждый вызов.

```ts
function mergeU(a: string | number, b: string | number) { /* ... */ }
mergeU(1, "a"); // допустимо — связи нет

function pair<T>(a: T, b: T): [T, T] { return [a, b]; }
pair(1, "a"); // ошибка — T не может быть одновременно number и string
```

Правило: если аргументы должны быть «одного сорта» — дженерик; если независимы — union.

## Как типизировать промисы и async-функции?

`async`-функция всегда возвращает `Promise<T>`, где `T` — тип возвращаемого значения. `await` снимает обёртку.

```ts
async function getUser(id: string): Promise<User> {
  const res = await fetch(`/users/${id}`);
  return res.json();
}
const user: User = await getUser("1");
```

Типизация ответов API: `res.json()` возвращает `Promise<unknown>` (или `any` в старых версиях lib) — результат стоит явно привести через схему/валидатор, а не `as User`.
