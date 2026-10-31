# Основы Node.js

## Что такое Node.js и чем отличается от браузерного JavaScript?

Node.js — рантайм JavaScript на движке V8 вне браузера: доступ к файловой системе, процессу, сети. Общего с браузером — язык; различны — API (нет window/DOM, есть process/fs) и модульная система.

```js
const fs = require("fs");           // CJS
import fs from "node:fs";           // ESM

fs.readFileSync("config.json");     // API, недоступный в браузере
process.env.NODE_ENV;               // переменные окружения
```

Node.js исполняет один JS-поток на процесс, а неблокирующий I/O обеспечивает libuv — отсюда событийная, однопоточная (по JS) модель с пулом потокей для системных операций.

## Чем CommonJS отличается от ES-модулей?

CJS (`require`/`module.exports`) — синхронная загрузка, динамический require, кеш по пути. ESM (`import`/`export`) — статические связи, парсинг до исполнения, tree-shaking и top-level await.

```js
// CJS
const { sum } = require("./math");

// ESM
import { sum } from "./math.js";
export const total = sum(1, 2);
```

Тип определяет `"type": "module"` в package.json или расширение `.mjs`/`.cjs`. ESM — современный стандарт и необходим для top-level await; CJS — наследие с огромным ecosystem-заделом.

## Что содержит package.json и зачем lock-файл?

Скрипты, метаданные, зависимости. `package-lock.json` фиксирует точное дерево пакетов (включая транзитивные) для воспроизводимой установки.

```json
{
  "scripts": {
    "dev": "node scripts/dev.mjs",
    "start": "node server.js"
  },
  "dependencies": { "express": "^4.19.0" },
  "devDependencies": { "vitest": "^2.1.0" }
}
```

`^` в dependencies + lock = «обновляемые в пределах минорки, но зафиксированные для установки». Без lock-файла CI и коллеги получают разные версии. `npm ci` (вместо install) — установка строго по lock.

## Что такое event-driven архитектура в Node.js?

Ядро Node.js — цикл событий + emitter-паттерн: сущности испускают события, подписчики реагируют. `EventEmitter` — базовый механизм.

```js
const EventEmitter = require("node:events");

class Job extends EventEmitter {}
const job = new Job();

job.on("progress", (pct) => console.log(`Готово ${pct}%`));
job.on("done", () => console.log("Завершено"));

job.emit("progress", 50);
job.emit("done");
```

Сервер — тоже эмиттер: `server.on("request", handler)`. Ошибки в emitter-мире — события `error`: без слушателя процесс падает.

## Как работать с окружением и конфигурацией?

Переменные окружения через `process.env`; конфигурация — по принципу «12-factor»: окружение, а не файл в репозитории.

```js
const config = {
  port: Number(process.env.PORT) || 3000,
  dbUrl: process.env.DATABASE_URL,
  isProd: process.env.NODE_ENV === "production",
};

if (!config.dbUrl) throw new Error("DATABASE_URL обязателен");
```

`.env` — только для локальной разработки (dotenv); секреты не коммитятся. Валидация конфига на старте (zod/envalid) превращает опечатку в понятную ошибку запуска, а не в загадочный падеж на 20-м запросе.

## Что такое process и какие у него ключевые события?

`process` — глобальный объект текущего процесса: argv, env, exit, сигналы.

```js
process.on("SIGTERM", shutdown);  // graceful shutdown
process.on("uncaughtException", (e) => { log(e); process.exit(1); });
process.on("unhandledRejection", (e) => { log(e); process.exit(1); });

process.exitCode = 1;  // код выхода
process.argv;          // аргументы командной строки
```

`uncaughtException` — последняя линия: залогировать и выйти, не «продолжать работу». SIGTERM — точка корректного завершения: закрыть соединения, сбросить буферы.

## Что такое Buffer?

Бинарные данные фиксированной длины — работа с файлами, сетью, криптографией. Uint8Array-подобная структура вне wasm/typed arrays мира.

```js
const buf = Buffer.from("hello");
buf.length;    // 5 байт
buf.toString("hex");
buf[0];        // 104

Buffer.concat([buf, Buffer.from(" world")]);
```

Строки — для текста, Buffer — для байтов. Потоки файлов и сокетов оперируют буферами; сериализация `JSON.stringify` — уже строки. Кодировки: Buffer.from(s, "utf8") vs buf.toString("base64").

## Как устроен npm-скрипты и зачем они?

Поле scripts — сокращения команд: локальные бинарники node_modules/.bin доступны без пути, композиция через `&&` и `pre`/`post`-хуки.

```json
{
  "scripts": {
    "test": "vitest run",
    "predeploy": "npm run build",
    "deploy": "npm-run-all deploy:*"
  }
}
```

Скрипты — единая точка входа для CI и людей: `npm test` одинаков везде. Кроссплатформенность — учитывайте: `rm -rf` не работает на Windows без shell-utils (rimraf, shx).
