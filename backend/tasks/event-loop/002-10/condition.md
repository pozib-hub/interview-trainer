# Event Loop: async/await

Определите порядок вывода в консоль:

```ts
async function f() {
  console.log(1);

  const promise = new Promise((resolve) => {
    console.log(2);

    setTimeout(() => {
      console.log(3);
      resolve("гOTOBO!");
      console.log(4);
    });
  });

  console.log(5);

  const result = await promise;

  console.log(6);
  console.log(result);

  return "Result";
}

f();

console.log(7);
```

Реализуйте функцию `getOrder()`, возвращающую `Promise<string[]>` — порядок вывода.
