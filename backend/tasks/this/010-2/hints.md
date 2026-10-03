## Подсказка 1
`new Bar()` → `super()` → конструктор `Foo`. `this.id = "foo"`, затем `this.print()` — но `this` = экземпляр `Bar`, вызывается `Bar.print()`.

## Подсказка 2
`super.print()` вызывает `Foo.print()`, но `this` — экземпляр `Bar`. Значения: `bar foo`, `bar bar`, `foo bar`.
