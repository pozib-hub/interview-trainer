# Event Loop: setTimeout 0, microtasks, requestAnimationFrame, MutationObserver

Определите порядок вывода в консоль:

```ts
console.log("1");

setTimeout(function () {
  console.log("2");

  Promise.resolve().then(function () {
    console.log("3");

    setTimeout(function () {
      console.log("6");
    }, 0);
  });
}, 0);

Promise.resolve().then(function () {
  console.log("4");

  setTimeout(function () {
    console.log("5");
  }, 0);
});

requestAnimationFrame(function () {
  console.log("7");

  Promise.resolve().then(function () {
    console.log("8");
  });

  setTimeout(function () {
    console.log("9");
  }, 0);
});

setTimeout(function () {
  console.log("10");

  Promise.resolve().then(function () {
    console.log("11");
  });
}, 0);

const observer = new MutationObserver(function () {
  console.log("12");
});
observer.observe(document.body, { childList: true });

Promise.resolve().then(function () {
  console.log("13");
});

setTimeout(function () {
  console.log("14");
}, 0);

console.log("15");

queueMicrotask(() => {
  console.log("16");
});
```

Реализуйте функцию `getResult()`, возвращающую массив строк в порядке вывода.
