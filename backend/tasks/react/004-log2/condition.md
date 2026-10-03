# React: порядок useEffect родителя и ребёнка

Определите порядок вывода в консоль:

```tsx
function Parent({ children }) {
  useEffect(() => {
    console.log("Parent useEffect");
    return () => console.log("Parent useEffect cleanup");
  }, []);

  return children;
}

function App() {
  const [count, setCount] = useState(0);

  console.log("App render");

  useEffect(() => {
    console.log("App useEffect");
    return () => console.log("App useEffect cleanup");
  }, [count]);

  // setCount вызывает повторный рендер
  return <Parent />;
}
```

Реализуйте функцию `getOrder()`, возвращающую массив строк в порядке вывода.
