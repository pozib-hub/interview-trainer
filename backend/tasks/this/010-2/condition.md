# This: наследование и super

Что выведется в консоль при создании `new Bar()`?

```ts
class Foo {
  constructor() {
    this.id = "foo";
    this.print();
  }

  print() {
    console.log("foo " + this.id);
  }
}

class Bar extends Foo {
  constructor() {
    super();
    this.id = "bar";
    this.print();
    super.print();
  }

  print() {
    console.log("bar " + this.id);
  }
}

new Bar();
```

Реализуйте функцию `getResult()`, возвращающую массив строк: сначала вывод консоли, затем объяснение построчно (начиная с `"Объяснение:"`).
