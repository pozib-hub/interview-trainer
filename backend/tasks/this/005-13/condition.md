# This: call, apply, bind, стрелочные функции

Что выведется в консоль?

```ts
const obj = {
  name: "Colin",
  prop: {
    name: "Rox",
    getname: function () {
      return this.name;
    },
    arrow: () => this.name,
    arrowInsideFunction: function () {
      return () => console.log(this.name);
    },
  },
};

console.log(obj.prop.getname());

const test = obj.prop.getname;
console.log(test());

console.log(test.call(obj.prop));
console.log(test.apply(obj));
console.log(test.bind(obj));
console.log(test.bind(obj).bind(obj.prop)());
console.log(obj.prop.arrow());

obj.prop.arrowInsideFunction()();
```

Реализуйте функцию `getResult()`, возвращающую массив строк с выводом консоли (начиная с `"ответ"`).
