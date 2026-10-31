# Оптимизация и производительность

## Что вызывает лишние ре-рендеры в React?

Ре-рендер происходит при изменении state/props родителя или изменении контекста. Лишние — когда компонент рендерится, хотя его данные не изменились: родитель перерисовался и «потянул» всех детей.

```tsx
function Parent() {
  const [count, setCount] = useState(0); // меняется только count
  return (
    <>
      <ExpensiveList items={items} />   // но ре-рендерится тоже
      <button onClick={() => setCount(count + 1)}>+1</button>
    </>
  );
}
```

Ремарка: ре-рендер — не значит манипуляции с DOM (diff может не найти изменений), но работа рендер-функций всё равно выполняется. «Лишность» меряется профайлером, не на глаз.

## Когда нужен React.memo?

`React.memo` пропускает ре-рендер, если props поверхностно равны. Оправдан для тяжёлых компонентов, которые часто рендерятся с одинаковыми props.

```tsx
const ExpensiveList = React.memo(function ExpensiveList({ items }: Props) {
  return <ul>{items.map(/* … */)}</ul>;
});
```

Условие работы: props должны быть стабильны. Если родитель каждый рендер создаёт новый объект `options={{...}}` или новую функцию `onX={() => …}` — memo бесполезен (ссылка всегда новая). Нужен набор: memo + useCallback/useMemo для ссылочных типов.

## Почему объекты и функции в props ломают мемоизацию?

Поверхностное сравнение сравнивает ссылки. Литерал объекта или инлайн-стрелка в JSX — новая ссылка на каждый рендер родителя.

```tsx
// ❌ каждый рендер Parent — новые options и onClick
<Child options={{ deep: 1 }} onClick={() => save(id)} />

// ✅ стабильные ссылки
const options = useMemo(() => ({ deep: 1 }), []);
const onClick = useCallback(() => save(id), [id]);
```

Это же правило для зависимостей эффектов: нестабильная ссылка в deps = эффект на каждый рендер.

## Что такое виртуализация длинных списков?

Виртуализация (react-window, TanStack Virtual) рендерит только видимые строки + запас, а не все 10 000 элементов. Список длиннее пары сотен строк — кандидат.

```tsx
import { FixedSizeList } from "react-window";

<FixedSizeList height={600} itemCount={rows.length} itemSize={40} width="100%">
  {({ index, style }) => <Row key={index} style={style} data={rows[index]} />}
</FixedSizeList>
```

DOM остаётся маленьким, память и время первого рендера — предсказуемыми. Цена: сложнее измерение, скролл-контейнеры и доступность.

## Что такое code splitting и React.lazy?

Разбиение бандла на чанки, которые грузятся по мере надобности. `React.lazy` + `Suspense` — динамический импорт компонентов прямо в JSX.

```tsx
const AdminPanel = React.lazy(() => import("./AdminPanel"));

<Suspense fallback={<Spinner />}>
  <AdminPanel /> {/* чанк грузится при первом обращении */}
</Suspense>
```

Классические цели: маршруты (роут-левел сплиттинг), тяжёлые виджеты (редактор, графики), admin-панели. Бонус-уровень — `import()` для тяжёлых утилит по событию.

## Что такое Suspense и границы ошибок (Error Boundaries)?

`Suspense` — декларативная «загрузка»: показывает fallback, пока дети (lazy-компонент или данные через библиотеку) не готовы. Error Boundary — класс-компонент с `getDerivedStateFromError`/`componentDidCatch`, ловит ошибки рендера детей.

```tsx
<Suspense fallback={<Skeleton />}>
  <ErrorBoundary fallback={<ErrorView />}>
    <LazyFeature />
  </ErrorBoundary>
</Suspense>
```

Один Suspense на дерево — «водопад» загрузок; Suspense ближе к точке данных — параллельная загрузка. Error Boundary оборачивает «единицу отказа», а не всё приложение.

## Как профилировать React-приложение?

Инструменты: React DevTools Profiler (что ре-рендерилось и почему — «Why did this render?» в v18+), Performance-панель браузера, замер метрик Lighthouse/Web Vitals.

```tsx
// Точки входа для замера UX-метрик
import { useReportWebVitals } from "next/web-vitals";
useReportWebVitals((metric) => analytics.track(metric.name, metric.value));
```

Алгоритм: сначала метрики (INP — главная в v18+), затем Profiler по дереву, точечная мемоизация найденных узких мест. Слепая мемоизация всего — анти-паттерн.

## Что такое списки с пагинацией/бесконечным скроллом и когда что выбрать?

Пагинация — предсказуемая навигация, кешируемые страницы, работает без JS-состояния. Инфинит-скролл — плавное потребление ленты (соцсети), но сложнее: IntersectionObserver, виртуализация, восстановление позиции.

```tsx
// Триггер подгрузки
const sentinelRef = useRef(null);
useEffect(() => {
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && hasNextPage) fetchNextPage();
  });
  if (sentinelRef.current) io.observe(sentinelRef.current);
  return () => io.disconnect();
}, [hasNextPage, fetchNextPage]);
```

Выбор по продукту: справочники/таблицы — пагинация, ленты — инфинит. Гибрид — «кнопка загрузить ещё» на мобильных: инфинит-скролл мешает добраться до футера.
