# GIL, асинхронность и экосистема

## Что такое GIL и зачем он?

Global Interpreter Lock — глобальный замок CPython, разрешающий только одному потоку исполнять байткод одновременно. Упрощает управление памятью (счётчик ссылок потокобезопасен) и делает однопоточный код быстрым.

```python
# CPU-bound в двух потоках — не ускорится:
def crunch(n): sum(i * i for i in range(n))

# Оба потока по очереди держат GIL — суммарное время то же
```

GIL не делает язык однопоточным: I/O-операции освобождают замок. Но CPU-параллелизм требует процессов, а не тредов. В Python 3.13+ есть экспериментальный free-threaded режим без GIL.

## Как GIL влияет на выбор: threading, multiprocessing или asyncio?

CPU-bound → multiprocessing (отдельные интерпретаторы с GIL у каждого). I/O-bound с небольшим числом соединений → threading (замок освобождается на I/O). Много сетевых операций → asyncio (тысячи конкурентных задач без тредов).

```python
# I/O-bound: потоки — GIL не мешает, пока ждём сеть
results = [fetch(url) for url in urls]                 # последовательно
results = [wait(threading.Thread(target=fetch, args=(u,))) for u in urls]

# CPU-bound: процессы
with multiprocessing.Pool(4) as pool:
    pool.map(crunch, data)
```

Ошибка «ускорить вычисления тредами» — классика провала на собеседовании и в бенчмарке.

## Что такое asyncio и event loop?

Библиотека кооперативной многозадачности: один поток, event loop переключает корутины в точках `await`. Пока одна задача ждёт I/O, исполняется другая.

```python
import asyncio

async def fetch(name: str) -> str:
    await asyncio.sleep(0.1)   # имитация I/O: контроль отдан лупу
    return name

async def main():
    results = await asyncio.gather(   # конкурентно, а не последовательно
        fetch("a"), fetch("b"), fetch("c")
    )
    print(results)  # ~0.1 сек, не 0.3

asyncio.run(main())
```

Ключевое отличие от тредов: переключение — только в `await` (кооперативно), нет вытеснения. Блокирующий вызов (`time.sleep`, requests) замораживает весь луп — нужны асинхронные версии (aiohttp, httpx).

## Что такое async/await и корутины?

`async def` создаёт корутину — объект «отложенного вычисления». `await` — точка, где корутина приостанавливается и ждёт результат другой awaitable-сущности.

```python
async def get_user(uid: int) -> dict:
    async with httpx.AsyncClient() as client:
        res = await client.get(f"/users/{uid}")
        return res.json()

# корутину нельзя просто вызвать:
user = get_user(1)      # ничего не выполнилось — это объект
user = await get_user(1)  # внутри event loop
```

`asyncio.gather` — параллельный запуск, `asyncio.sleep` — асинхронное ожидание. `await` в цикле — последовательное выполнение: для параллельности собирайте задачи и gather.

## Что такое venv и зачем виртуальное окружение?

Изолированный набор пакетов проекта: свои версии зависимостей, отдельные от системы и других проектов.

```bash
python -m venv .venv
source .venv/bin/activate   # .venv\Scripts\activate на Windows

pip install fastapi        # только в это окружение
pip freeze > requirements.txt
```

Без venv — конфликт версий между проектами и порча системного интерпретатора. Современная альтернатива — uv/poetry: менеджмент окружения + lock-файлы в одном инструменте.

## Как управлять зависимостями: requirements, pip-tools, poetry/uv?

Базовый путь — `requirements.txt` + `pip install -r`. Проблема: версии не зафиксированы точно → «у меня работает». Решения: pip-tools (compile → lock), poetry/uv (pyproject.toml + lock).

```toml
# pyproject.toml — современный стандарт метаданных
[project]
dependencies = ["fastapi>=0.110", "httpx"]

# uv: быстрый менеджер с lock-файлом
# uv lock → uv sync → .venv точно воспроизводим
```

Lock-файл — единственный способ получить воспроизводимую сборку: CI и тиммейты получают одни и те же версии транзитивных зависимостей.

## Как тестировать Python-код: unittest и pytest?

unittest — стандартная библиотека (классы, self.assertEqual). pytest — функции-тесты, fixtures, параметризация, читаемые падения.

```python
# pip install pytest
def split_pairs(data: list[int]) -> list[tuple[int, int]]:
    ...

@pytest.mark.parametrize("inp,expected", [
    ([1, 2, 3], [(1, 2)]),
    ([], []),
])
def test_pairs(inp, expected):
    assert split_pairs(inp) == expected   # assert — без boilerplate

def test_with_fixture(client):    # фикстура — подготовка контекста
    assert client.get("/health").status_code == 200
```

pytest стал де-факто стандартом: меньше церемоний, плагины (pytest-asyncio, pytest-cov). unittest живёт в легаси и stdlib.

## Как устроена упаковка и публикация пакета?

Метаданные — в `pyproject.toml`; сборка — `python -m build` (wheel + sdist); публикация — `twine upload` в PyPI.

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "my-lib"
version = "1.0.0"
```

```bash
python -m build          # dist/*.whl + *.tar.gz
twine check dist/*
twine upload dist/*      # PyPI
```

Wheel — скомпилированный формат установки без выполнения setup-логики: быстрее и безопаснее sdist. Для внутренних пакетов — приватный индекс (devpi, GitLab/Artifactory registry).
