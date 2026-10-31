# Хуки

## Как работает useState?

`useState` возвращает пару `[значение, сеттер]` и сохраняет значение между рендерами. Сеттер запускает ре-рендер; значение обновится на следующем рендере.

```tsx
const [count, setCount] = useState(0);

<button onClick={() => setCount(count + 1)}>+1</button>
<button onClick={() => setCount((c) => c + 1)}>+1</button> // функциональный апдейт
```

Функциональная форма обязательна, когда новое состояние зависит от предыдущего (особенно в асинхронных колбэках и быстрых сериях обновлений — React батчит и может отдать устаревшее значение).

## Как работает useEffect и когда очищать?

`useEffect` выполняет побочные эффекты после коммита рендера: подписки, таймеры, fetch. Возврат функции — очистка перед следующим эффектом и размонтированием.

```tsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // cleanup
}, []);
```

Массив зависимостей: `[]` — один раз при монтировании; `[a, b]` — при изменении `a`/`b`; без массива — каждый рендер (почти всегда ошибка). Неочищённые подписки и таймеры — утечки и «зомби»-апдейты.

## Почему нельзя вызывать хуки условно?

Хуки хранятся в порядке вызова (по индексу в списке волокон компонента). Условие или цикл меняет порядок между рендерами — React связывает состояние не с именем, а с позицией.

```tsx
if (ready) {
  const [x, setX] = useState(0); // ❌ ошибка правил хуков
}
```

Правила: только на верхнем уровне компонента/кастомного хука, только из React-функций. Проверяется линтером `eslint-plugin-react-hooks`. Если нужна условная логика — ранний return выше вызова хука или вынос в отдельный компонент.

## Когда useMemo и useCallback действительно нужны?

`useMemo` кеширует вычисление, `useCallback` — функцию (для стабильности ссылок). Нужны: тяжёлые вычисления, ссылки в deps других хуков, пропсы мемоизированным компонентам.

```tsx
const sorted = useMemo(
  () => [...items].sort(compare), // тяжёлая сортировка
  [items]
);
const onChange = useCallback(handleChange, [id]); // стабильная ссылка
```

Анти-паттерн — оборачивать всё подряд: мемоизация имеет цену (память, сравнение deps) и код хуже читается. По умолчанию — без хуков, профайлер покажет узкие места.

## Для чего useRef?

`useRef` — коробка, переживающая рендеры: `ref.current` можно менять без ре-рендера. Основные применения: доступ к DOM и хранение «не-рендерных» значений (id таймера, предыдущее значение, флаг монтирования).

```tsx
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => inputRef.current?.focus(), []);

const timerRef = useRef<number>();
timerRef.current = setInterval(tick, 1000); // не триггерит рендер
```

Чтение/запись `ref.current` в теле рендера — запрещено (кроме инициализации): это делает рендер нечистым.

## Как работает useContext и когда его применять?

Контекст пробрасывает данные глубоко по дереву без пропс-прокидывания (prop drilling). Поставщик сверху, потребители через `useContext` ниже.

```tsx
const ThemeContext = createContext<"dark" | "light">("dark");

<ThemeContext.Provider value={theme}>
  <DeepTree /> {/* любые уровни ниже */}
</ThemeContext.Provider>

const theme = useContext(ThemeContext);
```

Ограничение: смена значения провайдера ре-рендерит всех потребителей. Контекст — для редко меняющихся вещей (тема, локаль, текущий пользователь), а не для высокочастотного состояния.

## Что такое кастомные хуки и зачем они?

Кастомный хук — функция с `use`, использующая другие хуки: способ вынуть переиспользуемую логику из компонентов.

```tsx
function useDebouncedValue<T>(value: T, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}
```

Каждый вызов хука — изолированное состояние. Кастомные хуки — главный инструмент переиспользования в React (вместо HOC и render-props прошлого).

## Когда useState, а когда useReducer?

`useState` — независимые простые значения. `useReducer` — состояние с несколькими связанными частями или сложными переходами: (state, action) → state.

```tsx
type Action = { type: "start" } | { type: "done"; data: User[] } | { type: "fail"; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start": return { status: "loading", data: [], error: null };
    case "done":  return { status: "success", data: action.data, error: null };
    case "fail":  return { ...state, status: "error", error: action.error };
  }
}
```

Редьюсер держит переходы атомарными и тестируемыми — хорош при «состоянии-автомате» (loading/success/error), где поля нельзя рассинхронизировать.
