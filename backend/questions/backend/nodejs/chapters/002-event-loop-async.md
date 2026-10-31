# Event loop и асинхронность

## Какие фазы у event loop в Node.js?

Шесть фаз цикла: timers → pending callbacks → poll (I/O) → check (setImmediate) → close callbacks; между фазами обрабатывается очередь микрозадач (process.nextTick, промисы).

```js
setTimeout(() => console.log("timer"));     // фаза timers
setImmediate(() => console.log("check"));   // фаза check
Promise.resolve().then(() => console.log("microtask"));
console.log("sync");

// sync → microtask → timer/check (порядок зависит от контекста)
```

Порядок «синхронный код → все микрозадачи → одна макрозадача» — база ответа; фазы объясняют, почему setImmediate и setTimeout(0) могут меняться местами.

## Что такое libuv и пул потоков?

libuv — кроссплатформенная библиотека I/O: event loop, сокеты, файловая система. Для операций без асинхронного API ОС использует пул из 4 потоков (по умолчанию) через UV_THREADPOOL_SIZE.

```js
const fs = require("node:fs/promises");

// fs.* — выполняется в пуле libuv, не в JS-потоке
const data = await fs.readFile("big.json", "utf8");

// crypto.pbkdf2, dns.lookup, zlib — тоже пул
```

Следствие: тяжёлые fs/crypto операции «параллелятся» только на 4 потока — при 10 конкурентных чтениях большие файлы встают в очередь. Решение — UV_THREADPOOL_SIZE или worker_threads.

## Как nextTick отличается от setImmediate?

`process.nextTick` — микрозадача: выполняется сразу после текущей операции, до продолжения event loop. `setImmediate` — макрозадача фазы check: на следующей итерации цикла.

```js
setImmediate(() => console.log("immediate"));
Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("nextTick"));
console.log("sync");

// sync → nextTick → promise → immediate
```

nextTick имеет приоритет даже над промисами и может «зависить вечно» при рекурсивном порождении — использовать для завершения текущей операции, не для планирования.

## Как обрабатывать ошибки в асинхронном коде?

Промисы/`await` + try/catch; глобальные обработчики как страховка. Незакрытая ошибка — unhandledRejection → процесс падает.

```js
async function handler() {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (e) {
    logger.error(e);
    throw e;            // пробрасываем дальше или преобразуем
  }
}

process.on("unhandledRejection", (e) => {
  logger.fatal(e);
  process.exit(1);
});
```

Классические ловушки: try/catch вокруг промиса без await (не ловит); возврат ошибки колбэку вместо throw; пустой catch, съедающий диагностику.

## Что делает child_process и чем отличается от worker_threads?

`child_process` — отдельный процесс ОС: изоляция, свой V8, связь через IPC/stdout. `worker_threads` — поток внутри процесса: общий сегмент памяти (SharedArrayBuffer), дешевле, каналы сообщений.

```js
// CPU-bound выносим из event loop:
const { Worker } = require("node:worker_threads");
const worker = new Worker("./crunch.js", { workerData: { n: 1e9 } });
worker.on("message", resolve);
```

Правило: тяжёлые вычисления — worker_threads (параллелизм внутри приложения), внешние утилиты и изоляция — child_process (spawn/exec), масштабирование на ядра — cluster.

## Что такое cluster-модуль?

Встроенный способ поднять N процессов-воркеров, разделяющих один порт: мастер распределяет соединения.

```js
const cluster = require("node:cluster");

if (cluster.isPrimary) {
  const cpus = require("node:os").cpus().length;
  for (let i = 0; i < cpus; i++) cluster.fork();
  cluster.on("exit", (w) => cluster.fork()); // рестарт упавшего
} else {
  require("./server"); // воркер — обычный HTTP-сервер
}
```

Один Node-процесс = одно ядро для JS; cluster использует все. Graceful shutdown: воркер ловит SIGTERM, завершает соединения. PM2 делает то же самое в обёртке.

## Как не заблокировать event loop?

Синхронные тяжёлые операции (JSON.parse гигантского файла, вложенные циклы, crypto синхронный) замораживают все запросы. Приёмы: асинхронные версии API, дробление, вынос в worker.

```js
// ❌ блокирует loop на секунды
const data = JSON.parse(fs.readFileSync("huge.json", "utf8"));

// ✅ асинхронно + стриминг
const records = [];
fs.createReadStream("huge.json")
  .pipe(jsonParser)                 // по частям
  .on("data", (r) => records.push(r));
```

Диагностика: `--event-loop-monitor` предупреждения в новых версиях Node, clinic/0x — flamegraph блокировок. Синхронные методы fs/exec — только на старте приложения.
