## Подсказка 1
React 18 StrictMode двойно-вызывает рендер и эффекты при mount. Рендеры выполняются до эффектов.

## Подсказка 2
Порядок: render ×2 → layout effect mount/cleanup/remount → passive effect mount/cleanup/remount. Cleanup в обратном порядке.
