# This: методы объекта

Что выведется в консоль?

```ts
const carDetails = {
  name: "Ford Mustang",
  yearBought: 2005,
  getName() {
    return this.name;
  },
  isRegistered: true,
};

console.log(carDetails.getName());
console.log(carDetails.getName.call({}));
console.log(carDetails.getName.bind({}).call(carDetails));
```

Реализуйте функцию `getResult()`, возвращающую массив строк с выводом консоли (начиная с `"ответ"`).
