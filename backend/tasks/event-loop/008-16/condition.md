# Event Loop: MutationObserver, fetch, requestAnimationFrame

Определите порядок вывода в консоль (задача с собеседования #мосбиржа):

```ts
async function queue() {
  console.log(1);

  setTimeout(() => console.log(2), 0);

  const targetNode = document.createElement('div');
  document.body.appendChild(targetNode);

  const observer = new MutationObserver(() => {
    console.log(6);
    Promise.resolve().then(() => console.log(7));
  });

  observer.observe(targetNode, { attributes: true });

  let a = new Promise((resolve) => {
    console.log(3);
    resolve();
  });

  a.then(() => {
    console.log(5);
    fetch('https://jsonplaceholder.typicode.com/todos/1')
      .then(response => response.json())
      .then(data => console.log(9));

    targetNode.setAttribute('data-test', 'value');
  });

  console.log(4);

  requestAnimationFrame(() => {
    console.log(8);
  });

  await a;
}

queue();
console.log(10);
```

Реализуйте функцию `getOrder()`, возвращающую массив строк в порядке вывода.
