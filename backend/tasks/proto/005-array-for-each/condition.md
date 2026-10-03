# Array.prototype.forEach: своя реализация

Напишите метод массивов `forEach`, который можно вызвать на любом массиве: `array.forEach(callback, context)`. Метод выполняет функцию `callback` для каждого элемента массива и ничего не возвращает.

`callback` принимает параметры:
- `value` — значение текущего элемента
- `index` — индекс текущего элемента
- `array` — сам массив

`context` — объект, который должен быть `this` внутри `callback`.

Реализуйте метод **без** использования встроенных методов массивов (включая нативный `forEach`).

```ts
const arr = [1, 2, 3];
const callback = (val: number, i: number, a: number[]) => (a[i] = val * 2);
const context = { context: true };
arr.forEach(callback, context);
console.log(arr); // [2, 4, 6]
```

## Требования

- Метод должен быть доступен на **любом** массиве (через прототип).
- Не использовать встроенные методы массивов.

## Пример 1

```ts
arr = [1, 2, 3];
callback = (val, i, arr) => (arr[i] = val * 2);
context = { context: true };
arr.forEach(callback, context);
console.log(arr); // [2, 4, 6]
```

## Пример 2

```ts
arr = [true, true, false, false];
callback = (val, i, arr) => (arr[i] = this);
context = { context: false };
arr.forEach(callback, context);
console.log(arr); // [{"context":false},{"context":false},{"context":false},{"context":false}]
```
`this` внутри `callback` ссылается на `context`.

## Пример 3

```ts
arr = [true, true, false, false];
callback = (val, i, arr) => (arr[i] = !val);
context = { context: 5 };
arr.forEach(callback, context);
console.log(arr); // [false, false, true, true]
```

## Ограничения

- `arr` — допустимый массив JSON.
- `context` — допустимый JSON-объект.
- `fn` — функция.
- `0 <= arr.length <= 10^5`

## Как реализовать

В решении назначьте `Array.prototype.forEach` свою реализацию. Для TypeScript добавьте `declare global` при необходимости. Тесты импортируют решение для побочного эффекта.
