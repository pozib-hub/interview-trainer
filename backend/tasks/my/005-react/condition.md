# My: хук useCounter

Реализуйте хук `useCounter(intervalMs)` — счётчик, который увеличивается каждый `intervalMs` миллисекунд, но ставится на паузу при наведении мыши:

- `count` — текущее значение;
- `start()` — запускает интервал;
- `stop()` — останавливает интервал;
- `onMouseEnter()` — ставит на паузу: внутренний счётчик продолжает расти, но `count` не обновляется;
- `onMouseLeave()` — снимает с паузу и обновляет `count` до актуального значения.

Также реализуйте компонент `App`, использующий этот хук:

```tsx
export function App() {
  const { count, start, stop, onMouseEnter, onMouseLeave } = useCounter(1000);
  return (
    <div data-testid="counter-area" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <span data-testid="count">{count}</span>
      <button onClick={start}>start</button>
      <button onClick={stop}>stop</button>
    </div>
  );
}
```

Требования к `App`:
- значение счётчика отображается в элементе с `data-testid="count"`;
- обработчики `onMouseEnter`/`onMouseLeave` повешены на элемент с `data-testid="counter-area"`;
- кнопки запуска и остановки вызывают `start`/`stop`.

Это React-задача: решение пишется с JSX, тесты рендерят хук и компонент в jsdom
(`@testing-library/react`, `renderHook`, `fireEvent`, fake timers).
