# This: статический метод vs прототип

Что произойдёт при выполнении кода?

```ts
function Dog(name) {
  this.name = name;
}
Dog.bark = function () {
  console.log(this.name + " says woof");
};
let fido = new Dog("fido");

fido.bark();
```

Какую ошибку вызовет код и почему? Как исправить?
