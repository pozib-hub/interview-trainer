# Многопоточность и JVM

## Как создать поток и чем Thread отличается от Runnable?

Runnable — задача (что делать), Thread — исполнитель (кто). Разделение позволяет один Runnable гонять в пулах, а не создавать Thread на каждую задачу.

```java
Runnable task = () -> System.out.println("работаю");
new Thread(task).start(); // в лоб

executor.submit(task);    // правильно: пул переиспользует потоки
```

Тред — дорогой ресурс (~1 МБ стека): создание на задачу не масштабируется. ExecutorService — дефолтный способ работы с потоками.

## Что делает synchronized и как устроен монитор?

`synchronized` — взаимоисключение + happens-before: метод/блок выполняется одним потоком, изменения видны другим после выхода из блока. Каждая JVM-монитора связана с заголовком объекта.

```java
class Counter {
    private int count;
    public synchronized void inc() { count++; } // атомарно
}

synchronized (lock) { /* блок — монитор объекта lock */ }
```

`count++` без синхронизации — потерянные обновления: чтение-инкремент-запись не атомарны. Минус synchronized — пессимизм и цена переключения; для счётчиков — AtomicXxx.

## Зачем нужен volatile?

Гарантирует видимость изменений между потоками (запись сразу видна всем) и запрещает переупорядочение. Атомарность составных операций НЕ гарантирует.

```java
volatile boolean running = true;

// поток A:
while (running) { work(); }
// поток B:
running = false; // A увидит и выйдет
```

Без volatile JIT может закешировать `running` в регистре — вечный цикл. Для счётчика volatile не хватит: `x++` всё ещё три операции — нужен Atomic или synchronized.

## Что такое AtomicInteger и CAS?

Atomic-классы — потокобезопасные операции на атомарных инструкциях процессора через Compare-And-Swap: «если значение == ожидаемое, записать новое».

```java
AtomicInteger count = new AtomicInteger();
count.incrementAndGet();  // атомарный ++ без блокировок
count.compareAndSet(0, 1);
```

CAS оптимистичен: без блокировок и переключений контекста, но при конкуренции — повторы. На высокой конкуренции LongAdder эффективнее (шардирование счётчика).

## Что такое ExecutorService и какие бывают пулы?

Абстракция пула потоков: `submit` задач, переисполнение тредов, очереди, shutdown. Фабрика Executors: `fixed` (N потоков), `cached` (растущий), `single` (один), `scheduled` (отложенные и периодические).

```java
ExecutorService pool = Executors.newFixedThreadPool(8);
Future<Integer> f = pool.submit(() -> compute());

// Правильное завершение:
pool.shutdown();
if (!pool.awaitTermination(1, TimeUnit.MINUTES)) {
    pool.shutdownNow();
}
```

В production против `Executors.newXxx` — явный `ThreadPoolExecutor` с настроенными очередями и политикой отказа, иначе OOM из-за неограниченной очереди.

## Что такое CompletableFuture?

Композиция асинхронных операций: цепочки thenApply/thenCompose/thenCombine + исключения exceptionally/handle, без блокировок.

```java
CompletableFuture<Order> order = CompletableFuture
    .supplyAsync(() -> fetchUser(id), pool)      // async
    .thenCompose(user -> fetchOrder(user))       // flatMap
    .thenApply(o -> enrich(o))
    .exceptionally(e -> fallbackOrder(e));

order.thenAccept(this::render);
```

`thenApply` — map, `thenCompose` — flatMap, `allOf` — ждать всё. Указывайте свой пул в `*Async`-вариантах: дефолт — общий ForkJoinPool.

## Как устроена память JVM и поколения?

Куча делится на поколения: Young (Eden + Survivor S0/S1) — новые объекты, Old — пережившие сборки. Минорные сборки чистят Young часто и быстро; мажорные/Full GC — всю кучу.

```
[ Eden ][ S0 | S1 ] → [ Old ]   [ Metaspace — классы, вне кучи ]
```

Объект рождается в Eden, переживает сборку — переезжает в Survivor, накапливает возраст — в Old. Большие объекты могут попасть в Old сразу. Настройка -Xmx/-Xms и выбор сборщика (G1 — дефолт, ZGC — низкие паузы) — часть эксплуатации.

## Как работают сборщики мусора и что такое OutOfMemoryError?

GC находит недостижимимые объекты (по достижимости от GC-roots) и освобождает память. Достижимость — от корней: стеки потоков, static-поля, JNI. Циклы из «мертвых» объектов собираются нормально.

```java
// Утечка: static кеш без инвалидации
static final Map<Long, User> cache = new HashMap<>();

// OOM: куча кончилась
byte[] huge = new byte[Integer.MAX_VALUE]; // OutOfMemoryError: Java heap space
```

OOM — не всегда утечка: может быть и «слишком маленький -Xmx», и load без ограничения. Диагностика — heap dump + анализаторы (MAT, VisualVM): кто держит ссылки на растущие объекты.
