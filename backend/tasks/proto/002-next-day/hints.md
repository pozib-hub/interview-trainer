## Подсказка 1
Метод нужно назначить напрямую на `Date.prototype.nextDay` на уровне модуля — так он будет доступен на любом объекте `Date` сразу после импорта решения.

## Подсказка 2
Чтобы получить следующий день: создайте копию даты (`new Date(this.valueOf())`), вызовите `setDate(getDate() + 1)`, затем отформатируйте в `YYYY-MM-DD`.

## Подсказка 3
`date.toISOString().slice(0, 10)` даёт строку в формате `YYYY-MM-DD`. Для TypeScript не забудьте `declare global { interface Date { nextDay(): string } }`.
