# This: реализация myBind

Реализуйте аналог `Function.prototype.bind` — метод `myBind`:

```ts
const obj = {
  a: 1,
  say(arg1, arg2) {
    if (arg1 !== undefined && arg2 !== undefined) {
      console.log(this.a + arg1 + arg2);
    } else {
      console.log(this.a);
    }
  },
};

const bound = obj.say.myBind(obj, 10);
bound(20); // 31
```

Метод должен поддерживать каррирование (частичное применение аргументов).

Реализуйте `myBind` и функцию `getResult()`, возвращающую `true`.
