## Подсказка 1
`Promise.allSettled` ждёт все promises, даже если некоторые reject. Возвращает массив `{status, value/reason}`.

## Подсказка 2
В отличие от `Promise.all`, никогда не reject сам. Каждое значение: `{status: "fulfilled", value}` или `{status: "rejected", reason}`.
