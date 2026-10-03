# String.prototype.replicate: повторение строки

Напишите код, реализующий строковый метод `str.replicate(times)`, который возвращает строку, повторённую `times` раз.

Постарайтесь реализовать это **без** использования встроенного метода `String.prototype.repeat`.

```ts
"hello".replicate(2); // "hellohello"
"code".replicate(3); // "codecodecode"
"js".replicate(1); // "js"
```

## Требования

- Метод должен быть доступен на **любой** строке (через прототип).
- `times` — количество повторений.

## Пример 1

```ts
str = "hello", times = 2;
str.replicate(times); // "hellohello"
```
`"hello"` повторяется 2 раза.

## Пример 2

```ts
str = "code", times = 3;
str.replicate(times); // "codecodecode"
```
`"code"` повторяется 3 раза.

## Пример 3

```ts
str = "js", times = 1;
str.replicate(times); // "js"
```
`"js"` повторён 1 раз.

## Ограничения

- `1 <= times <= 10^5`
- `1 <= str.length <= 1000`

## Продвинутый уровень

Можно ли написать алгоритм со временной сложностью O(log n) повторений (используя бинарное возведение в степень), если предположить, что конкатенация — O(1)?

## Как реализовать

В решении назначьте `String.prototype.replicate` напрямую. Для TypeScript добавьте `declare global` с расширением интерфейса `String`. Тесты импортируют решение для побочного эффекта.
