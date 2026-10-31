# Продвинутые типы

## Что такое conditional types?

Тип, выбирающий одну из веток по условию на типах: `T extends U ? X : Y`. Вычисляется на этапе компиляции.

```ts
type NonNullable<T> = T extends null | undefined ? never : T;
type IsString<T> = T extends string ? true : false;

type A = NonNullable<string | null>; // string
type B = IsString<number>;           // false
```

С дженериками условные типы «распределяются» по union (distributive): `NonNullable<string | null>` проверяет каждый элемент отдельно. Условные типы — база большинства утилитных типов.

## Что такое mapped types?

Тип, который строит новый тип, преобразуя каждое свойство исходного по правилу.

```ts
type Mutable<T> = {
  -readonly [K in keyof T]: T[K]; // снимаем readonly
};
type Stringify<T> = {
  [K in keyof T]: string;         // все значения — string
};
```

Модификаторы `+/-` включают и выключают `readonly` и `?`. На mapped types построены `Partial`, `Readonly`, `Record` и возможность описывать целые доменные модели парой строк.

## Как работают встроенные утилитные типы Partial, Required, Pick, Omit, Record?

Это генераторы типов из стандартной библиотеки на mapped/conditional types.

```ts
interface User { id: number; name: string; email: string }

type UpdateUser = Partial<User>;          // все поля опциональны
type FullUser = Required<UpdateUser>;     // все поля обязательны
type UserPreview = Pick<User, "id" | "name">;   // подмножество полей
type UserNoEmail = Omit<User, "email">;        // всё, кроме email
type UsersById = Record<number, User>;     // словарь id → User
```

`Partial` — для PATCH-обновлений, `Pick/Omit` — для DTO и API-ответов, `Record` — для кешей и индексов.

## Как извлекать типы из значений: typeof, ReturnType, Parameters, Awaited?

`typeof value` — тип значения (в типовой позиции). `ReturnType<F>` — тип возврата функции. `Parameters<F>` — кортеж параметров. `Awaited<P>` — разворачивает промис до итогового типа.

```ts
function createUser(name: string, age: number) { return { name, age }; }

type User = ReturnType<typeof createUser>;      // { name: string; age: number }
type Args = Parameters<typeof createUser>;       // [string, number]
type Data = Awaited<ReturnType<typeof fetchUser>>; // User (из Promise<User>)
```

Приём «single source of truth»: типы выводятся из реальных значений, а не дублируются руками.

## Что такое шаблонные литеральные типы?

Строковые типы, собранные из union-частей: `` `on${EventName}` ``.

```ts
type Event = "click" | "focus";
type HandlerName = `on${Capitalize<Event>}`; // "onClick" | "onFocus"

type Route = `/${string}`; // любая строка, начинающаяся с /
```

Внутри можно использовать `Uppercase/Lowercase/Capitalize/Uncapitalize`. Хорошо подходит для генерации согласованных имён: `set + fieldName`, `on + eventType`.

## Что такое satisfies и чем он лучше as?

`satisfies T` проверяет соответствие типу, сохраняя конкретный выведенный тип (литералы, ключи). `as T` просто заставляет замолчать компилятор, теряя информацию.

```ts
const themes = {
  dark: { bg: "#000", color: "#fff" },
} satisfies Record<string, { bg: string; color: string }>;

themes.dark.bg;  // ок, тип "#000" сохранён
// С as Record<...>: themes.dark.bg всё ещё ок,
// но с опечаткой themes.dark.bq прошло бы на as (нет проверки структуры)
```

`satisfies` — «проверь, но не расширяй»: и валидация, и точные литеральные типы.

## Что такое дискриминированные объединения (discriminated unions)?

Union объектов с общим полем-тэгом, по которому компилятор сужает вариант.

```ts
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: User[] };

function render(state: State) {
  switch (state.status) {
    case "error": return state.error;  // error доступен
    case "success": return state.data;  // data доступен
  }
}
```

Это идиоматичный способ моделировать состояния async-запросов и альтернатив, исключая невалидные комбинации полей на уровне типов.

## Что такое index signature и когда она вредна?

`[key: string]: T` — объект с любыми строковыми ключами и значениями `T`. Вредит точности: теряется знание конкретных ключей, автодополнение и защита от опечаток.

```ts
interface Bad { [key: string]: string }  // всё — string
interface Config { host: string; port: number } // точно

// Лучше для словарей:
type Dict = Record<string, string>;
// Лучше для известных полей — явные поля или mapped types
```

Альтернативы: `Record<K, V>` с конечным union ключей, mapped types по `keyof` другого типа, `Map` в рантайме. Index signature оправдана на настоящих словарях с динамическими ключами.
