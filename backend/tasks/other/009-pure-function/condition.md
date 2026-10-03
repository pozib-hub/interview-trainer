# дана функция, нужно сделать ее чистой

дана функция, нужно сделать ее чистой

  let x = 2;

  const add = async (params, y) => {
    params.value = y;
    y += y + Math.random(params.value);
    x += y;

    console.log('doubling', x);

    const { data } = await axios({ method: 'get', url: '/' });

    const elem = document.getElementById('elem');
    const width = elem.getBoundingClientRect().width;

    return x + data + width;
  };

  add({ value: 4 }, 1);

## Что нужно сделать

Перепишите `add` как чистую функцию с зависимостями, передаваемыми через аргументы:

```ts
export const add = async (
  params: { value: number },
  y: number,
  width: number,
  fetchData: () => Promise<number>
): Promise<number> => { ... };
```

Правила:
- никакого общего состояния (`x`) и мутации `params` — стартовое значение `2` берётся внутри каждого вызова;
- сеть и DOM выносятся в аргументы: `width` передаётся числом, запрос — колбэком `fetchData`;
- результат: `2 + (await fetchData()) + width`;
- одинаковые аргументы дают одинаковый результат.
