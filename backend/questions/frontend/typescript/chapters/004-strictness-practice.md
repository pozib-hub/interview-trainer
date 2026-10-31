# Строгость и практика

## Что включает strict mode в tsconfig?

Флаг `strict` включает семейство проверок: `strictNullChecks` (null/undefined — отдельные типы), `noImplicitAny` (запрет неявного any), `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization` и другие. Каждый флаг можно включать отдельно.

```json
{ "compilerOptions": { "strict": true } }
```

`strictNullChecks` — самый влиятельный: без него `null` можно присвоить чему угодно, и половина рантайм-ошибок «Cannot read property of null» не ловится. Новый проект без strict — красный флаг.

## Что такое type narrowing (сужение типов)?

Процесс, когда компилятор из широго типа выводит узкий по контрольному потоку: проверкам `if`, `typeof`, `instanceof`, `in`, раннему `return`, exhaustive switch.

```ts
function format(value: string | number) {
  if (typeof value === "string") {
    return value.trim();  // здесь value: string
  }
  return value.toFixed(2); // здесь value: number
}
```

Сужение — главный механизм, заменяющий касты `as`: если тип можно сузить проверкой, проверяйте, а не кастуйте.

## Что такое type guards и как писать свои?

Type guard — функция-предикат, сообщающая компилятору тип: `x is Type`.

```ts
function isUser(x: unknown): x is User {
  return (
    typeof x === "object" && x !== null &&
    "id" in x && "name" in x
  );
}

if (isUser(data)) {
  data.name; // User
}
```

Рантайм-проверка остаётся вашей ответственностью — сигнатура лишь обещание. Для внешних данных честнее валидаторы вроде zod: и проверка, и тип из одной схемы.

## Когда допустимы приведения as и двойное утверждение?

`as` — «поверь мне»: компилятор перестаёт проверять. Допустимо для DOM API (`e.target as HTMLInputElement`), когда вы точно знаете больше системы типов, и на границах legacy-кода.

```ts
const input = e.target as HTMLInputElement;
const x = "a" as unknown as number; // двойное — почти всегда код-смел
```

Проблема `as`: не проверяет ничего ни в compile-time, ни в run-time. Если данные приходят извне — валидация, а не `as`.

## Как типизировать ответы API и внешние данные?

На границе системы — `unknown` + валидация. Внутри — точные типы, выведенные из схемы или API-функции.

```ts
const res = await fetch("/api/user");
const data: unknown = await res.json();
if (isUser(data)) return data;        // свой guard или zod
throw new Error("Некорректный ответ");
```

Зачем: API может изменить контракт, вернуть ошибку вместо данных или null. `as User` превратит это в падение в глубине UI; валидация — в понятную ошибку на границе.

## Как устроена типизация событий в React/TS?

События — дженерик-типы: `React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLButtonElement>`. Параметр дженерика — тип элемента, к которому привязан обработчик.

```ts
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value); // target типизирован как input
};
```

Частая ошибка — `e: any` или `as HTMLInputElement` без оснований. Правильный тип даёт и `e.target.value`, и проверку, что обработчик висит на правильном элементе.

## Как мигрировать JavaScript-проект на TypeScript?

Стратегия «gradual adoption»: `allowJs: true` в tsconfig → переименование файлов по одному (или JSDoc-типы в .js) → строгие флаги по нарастающей → сначала типизировать публичные API и границы модулей.

```json
{ "compilerOptions": { "allowJs": true, "strict": true } }
```

Практика: начать с новых файлов и горячих точек, `any`-долги гасить точечно через `unknown` + narrowing. Полностью «чистого» момента можно не ждать — TS прощает поэтапность.

## Что такое declaration merging и ambient-объявления?

Declaration merging — компилятор склеивает одноимённые `interface`/`namespace`. Ambient (`declare`) — описание типов для кода без типов: глобальные переменные, CDN-скрипты, модули без @types.

```ts
// globals.d.ts
declare const APP_VERSION: string;
declare module "legacy-lib" {
  export function init(config: object): void;
}
```

`@types/*`-пакеты — готовые ambient-описания. Свои `declare` нужны для легаси, инжекций из сборки и расширения прототипов.
