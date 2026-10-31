# Асинхронность и event loop

## Что такое event loop и как он работает?

Event loop — механизм, позволяющий однопоточному JavaScript выполнять неблокирующие операции. Цикл: выполнить весь синхронный код из стека вызовов → взять микрозадачи из очереди (все до последней) → при необходимости взять одну макрозадачу и связанные с ней микрозадачи → повторить.

```ts
setTimeout(() => console.log("macrotask"));
Promise.resolve().then(() => console.log("microtask"));
console.log("sync");
// sync → microtask → macrotask
```

Такой порядок — самый частый вопрос на собеседованиях: синхронный код, затем микрозадачи, затем макрозадачи.

## Чем микрозадачи отличаются от макрозадач?

Микрозадачи — колбэки промисов (`.then/catch/finally`), `queueMicrotask`, `MutationObserver`. Макрозадачи — `setTimeout`, `setInterval`, I/O-события, события UI. Между макрозадачами браузер успевает отрисовать кадр, а микрозадачи выполняются все подряд без перерыва.

```ts
setTimeout(() => console.log(1));
Promise.resolve().then(() => console.log(2));
// 2, затем 1
```

Бесконечная очередь микрозадач заблокирует рендер — поэтому в них нельзя вкладывать тяжёлую работу.

## Что такое Promise и какие состояния у него есть?

Promise — объект-представление результата асинхронной операции. Три состояния: `pending` (ожидание), `fulfilled` (успех), `rejected` (ошибка). Переход возможен только один раз, из `pending` в одно из финальных.

```ts
const p = fetch(url)
  .then((res) => res.json())   // возвращает новый промис
  .catch((e) => fallback(e))   // ловит ошибки цепочки
  .finally(() => hideLoader());
```

Промисы решают проблему «ада колбэков»: цепочки плоские, ошибки централизованно ловятся `catch`.

## Чем async/await отличается от промисов?

`async/await` — синтаксический сахар над промисами: пишет асинхронный код в синхронном стиле. `await` приостанавливает функцию, а не поток; ошибки ловятся обычным `try/catch`.

```ts
async function load() {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (e) {
    console.error(e);
  }
}
```

Важно помнить: `await` в цикле выполняет запросы последовательно — для независимых операций лучше `Promise.all`.

## Чем Promise.all отличается от allSettled, race и any?

`Promise.all` — ждёт все; падает при первой ошибке, теряя остальные результаты. `allSettled` — ждёт все и возвращает статусы `{status, value/reason}`. `race` — завершается с первым (успехом или ошибкой). `any` — первым успешным, игнорирует ошибки.

```ts
await Promise.all([a(), b()]);          // [ra, rb] или throw первой ошибки
await Promise.allSettled([a(), b()]);   // [{status:"fulfilled", value}, …]
await Promise.race([fetch(x), timeout]); // первый выполненный
```

Выбор метода — вопрос семантики: «все или ничего» → `all`, «кто быстрее» → `race`, «всё что смогли» → `allSettled`.

## Как обрабатывать ошибки в асинхронном коде?

Ошибки промисов ловятся `.catch()` или `try/catch` вокруг `await`. Непойманная ошибка промиса даёт `unhandledrejection`. В `fetch` сетевые ошибки — это `TypeError`, а HTTP 404/500 — не ошибка: нужно проверять `res.ok`.

```ts
async function safe() {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

Частая ловушка: `forEach` с `async`-колбеком не ждёт выполнения — используйте `for...of` + `await` или `Promise.all(map(...))`.

## Что выведет этот код?

```ts
console.log("start");
setTimeout(() => console.log("timeout"));
Promise.resolve().then(() => console.log("promise"));
console.log("end");
```

Вывод: `start`, `end`, `promise`, `timeout`. Сначала весь синхронный код (`start`, `end`), затем микрозадача (колбэк промиса), и только потом макрозадача `setTimeout`.

Логика не зависит от порядка объявления — только от типа задачи и момента постановки в очередь.

## Как реализовать задержку (delay) и таймаут для промиса?

`delay` — промис, который резолвится по `setTimeout`. Таймаут — комбинация с `Promise.race`: кто раньше, тот и выиграл.

```ts
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function withTimeout(p, ms) {
  return Promise.race([
    p,
    delay(ms).then(() => { throw new Error("timeout"); }),
  ]);
}
```

`AbortController` — более правильный способ для `fetch`: он реально отменяет сетевой запрос, а не просто перестаёт ждать результат.
