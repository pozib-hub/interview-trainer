# Obj: IIFE и мутация объекта

Что выведется в консоль?

```ts
var o = {};
var i = 0;

(function () {
  o.a = "a";
  i++;
})();

console.log(o, i);

(function (o, i) {
  o.b = "b";
  i++;
})(o, i);

console.log(o, i);
```

Реализуйте функцию `getResult()`, возвращающую массив строк с выводом консоли.
