## Подсказка 1
JSX компилируется Babel/SWC в вызов `React.createElement(Widget, null)` (или `jsx(Widget, null)` в новом transform).

## Подсказка 2
`React.createElement` возвращает обычный JS-объект — React-элемент. Это объект с полями `type`, `props`, `key`, `ref`.

## Подсказка 3
Ответ: `"object"`. `typeof (<Widget />)` → `typeof React.createElement(Widget, null)` → `typeof { type: Widget, props: {} }` → `"object"`.
