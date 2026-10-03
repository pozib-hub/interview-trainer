# React: порядок useEffect и useLayoutEffect

Определите порядок вывода в консоль при рендере компонента с `useLayoutEffect` и `useEffect`:

```tsx
function App() {
  console.log("App");

  useLayoutEffect(() => {
    console.log("useLayoutEffect");
    return () => console.log("useLayoutEffect cleanup");
  }, []);

  useEffect(() => {
    console.log("useEffect 1");
    return () => console.log("useEffect 1 cleanup");
  }, []);

  useEffect(() => {
    console.log("useEffect 2");
    return () => console.log("useEffect 2 cleanup");
  }, []);

  return null;
}
```

Учтите повторный рендер. Реализуйте функцию `getOrder()`, возвращающую массив строк в порядке вывода.
