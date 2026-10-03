# This: статический метод конструктора

Что произойдёт при выполнении кода?

```ts
function Person(firstName, lastName) {
  this.firstName = firstName;
  this.lastName = lastName;
}

const member = new Person("Example1", "Example2");

Person.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

console.log(member.getFullName());
```

Какую ошибку вызовет код и почему? Как исправить?
