# Var: массив и setTimeout

Что выведется в консоль?

```ts
for (var i = []; i.length < 3; i.push(1)) {
  setTimeout(() => {
    console.log(i);
  }, 1000);
}

for (var i = []; i.length < 3; i.push(1)) {
  let val = [...i];
  setTimeout(() => {
    console.log(val);
  }, i.length * 1000);
}
```

Реализуйте функцию `getResult()`, возвращающую массив строк с описанием вывода (начиная с `"ответ"`).
