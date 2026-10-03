## Подсказка 1
`carDetails.getName()` — `this = carDetails`, вернёт `"Ford Mustang"`. `.call({})` — `this = {}`, `this.name` = `undefined`.

## Подсказка 2
`.bind({})` фиксирует `this = {}` навсегда. Последующий `.call(carDetails)` не может его переопределить. Результат — `undefined`.
