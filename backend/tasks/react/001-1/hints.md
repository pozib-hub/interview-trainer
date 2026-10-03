## Подсказка 1
`Widget()` — это прямой вызов функции. React не знает о существовании этого компонента в дереве. Результат вызова рендерится как обычный JSX, но без React-контекста.

## Подсказка 2
`<Widget />` — это `React.createElement(Widget, null)`. React создаёт элемент в дереве. Компонент участвует в lifecycle, re-render, reconciliation.

## Подсказка 3
Ключевые отличия:
- **Hooks:** `Widget()` — hooks не работают (нет React fiber). `<Widget />` — hooks работают.
- **Context:** `Widget()` — не видит React context. `<Widget />` — видит.
- **Re-render:** `Widget()` — не перерендеривается при изменении state/props. `<Widget />` — перерендеривается.
- **DevTools:** `Widget()` — не виден в React DevTools. `<Widget />` — виден.
