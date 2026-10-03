# This: прототипы и замыкания

Что выведется в консоль?

```ts
function SomeFuncFirst(firstVar) {
  this.firstVar = firstVar;
  this.SecondVar = firstVar;

  var a = "var";
  const c = 1;

  this.getA = function () {
    (function a() {
      console.log(a);
      console.log(c);
    })();

    return a;
  };
}

SomeFuncFirst.prototype.consoleLogTextFirst = function () {
  console.log("text");
};

function SomeFuncSecond(firstVar, SecondVar) {
  SomeFuncFirst.call(this, firstVar);
  this.SecondVar = SecondVar;
}

SomeFuncSecond.prototype = Object.create(SomeFuncFirst.prototype);
SomeFuncSecond.prototype.constructor = SomeFuncSecond;

const mySomeFunc = new SomeFuncSecond("firstVar", "SecondVar");

console.log(mySomeFunc.getA());
console.log(mySomeFunc.firstVar);
console.log(mySomeFunc.SecondVar);
```

Реализуйте функцию `getResult()`, возвращающую массив строк с выводом консоли (начиная с `"ответ"`).
