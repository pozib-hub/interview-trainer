## Подсказка 1
React 18 StrictMode двойно-вызывает рендер и эффекты. Child-эффекты выполняются раньше parent-эффектов.

## Подсказка 2
Порядок: render ×2 → child mount/cleanup/remount → parent mount/cleanup/remount. `useEffect` с deps `[count]` перевыполняется при изменении count.
