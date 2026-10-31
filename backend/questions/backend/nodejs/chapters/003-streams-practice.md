# Потоки и производительность

## Что такое Stream и какие виды бывают?

Stream — абстракция обработки данных по частям, без загрузки всего в память. Четыре вида: Readable (чтение), Writable (запись), Duplex (и то и другое, раздельно), Transform (преобразование «на лету»).

```js
const fs = require("node:fs");
const zlib = require("node:zlib");

fs.createReadStream("huge.log")           // Readable
  .pipe(zlib.createGzip())                 // Transform
  .pipe(fs.createWriteStream("huge.gz")); // Writable
```

Файл в гигабайты обрабатывается с константной памятью: данные текут чанками (по умолчанию 64 КБ).

## Что делает pipe и как обрабатывать в нём ошибки?

`pipe` соединяет readable → writable, управляя backpressure и завершением. Слабое место: ошибки pipe не пробрасываются автоматически.

```js
const pipeline = require("node:stream/promises").pipeline;

// ✅ промисифицированный pipeline ловит всё
await pipeline(
  fs.createReadStream("in.log"),
  zlib.createGzip(),
  fs.createWriteStream("out.gz")
);
```

Обычный `.pipe()` без обработки `'error'` на каждом потоке — утечка и uncaughtException. `stream.promises.pipeline` — стандартный безопасный способ.

## Что такое backpressure?

Сигнализация «получатель не успевает»: writable возвращает false из write(), readable приостанавливается (pause) до drain.

```js
// Так работает pipe внутри:
readable.on("data", (chunk) => {
  const ok = writable.write(chunk);
  if (!ok) readable.pause();              // притормозили источник
});
writable.on("drain", () => readable.resume()); // освободился — продолжили
```

Без backpressure данные копятся в памяти при быстрой записи (получатель медленный — сеть). pipe/pipeline обрабатывают это автоматически; ручная запись в stream — обязаны учитывать.

## Как читать и писать большие файлы?

Только стримами: readFile ждёт весь файл в памяти, createReadStream отдаёт частями.

```js
// По строкам
const readline = require("node:readline");

const rl = readline.createInterface({
  input: fs.createReadStream("access.log"),
});

for await (const line of rl) {
  if (line.includes("ERROR")) count++;
}
```

`for await...of` по stream — удобный современный синтаксис: async-итерация по чанкам с автоматическим backpressure.

## Что такое Buffer и как он связан со стримами?

Buffer — сегмент байтов, единица обмена стримов. Чанки в событиях `data` — Buffer (для binary stream) или строки (с setEncoding).

```js
readable.on("data", (chunk) => {
  chunk.length;          // байт в чанке
  chunk.toString("utf8");
});

// Декодирование потоково — через StringDecoder (корректные границе UTF-8)
const { StringDecoder } = require("node:string_decoder");
const decoder = new StringDecoder("utf8");
readable.on("data", (c) => text += decoder.write(c));
```

Многобайтовые символы могут резаться на границе чанков — StringDecoder буферизует недописанный символ, в отличие от chunk.toString().

## Как отлаживать утечки памяти в Node.js?

Симптом: RSS растёт со временем/запросами. Инструменты: heap snapshot (Chrome DevTools через --inspect), --heapsnapshot-signal, clinic, process.memoryUsage() метрики.

```js
// Снять снапшот при сигнале SIGUSR2
process.on("SIGUSR2", () => {
  require("node:v8").writeHeapSnapshot();
});

// Сравнение двух снапшотов в DevTools → что растёт:
// чаще всего: слушатели событий, кеши без лимита, замыкания в setInterval
```

Типовые виновники: неочищенные setInterval, event listener'ы на долгоживущих объектах, глобальные кеши без инвалидации. Снапшоты до/после нагрузки показывают разницу удерживаемых объектов.

## Какие приёмы кеширования применяют в Node.js?

In-memory кеш (Map с TTL) — для одиночного процесса; Redis — для нескольких воркеров; HTTP-кеширование (Cache-Control, ETag) — на уровне клиента/CDN.

```js
// Простой TTL-кеш
const cache = new Map();
async function getUser(id) {
  if (cache.has(id)) return cache.get(id);
  const user = await db.users.findById(id);
  cache.set(id, user);
  setTimeout(() => cache.delete(id), 60_000).unref();
  return user;
}
```

Правила: кешируйте по ключу с версионированием, инвалидация — событием (запись → del), кеш под Pressure — с лимитом (LRU). cluster-воркеры НЕ делят память: общий кеш — только внешний.

## Как измерять производительность Node.js-приложения?

Уровни: метрики приложения (p95 latency, RPS), event loop lag, память/GC, профилирование CPU.

```js
// Event loop lag — главный индикатор «тормозит ли loop»
const { monitorEventLoopDelay } = require("node:perf_hooks");
const h = monitorEventLoopDelay();
h.enable();
setInterval(() => {
  console.log("loop p99:", h.percentile(99) / 1e6, "ms");
}, 10_000).unref();

// Простое измерение участка:
const { performance } = require("node:perf_hooks");
const t0 = performance.now();
await work();
console.log(performance.now() - t0, "ms");
```

Auto-GC-метрики: `--trace-gc`, perf_hooks GC observer. Классическая ошибка оптимизации — мерить без нагрузки и без warm-up: JIT прогревается после первых итераций.
