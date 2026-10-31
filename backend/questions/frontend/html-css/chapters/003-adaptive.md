# Адаптивность и особенности браузеров

## Что такое media queries и как их использовать?

Условия применения стилей по характеристикам устройства: ширине viewport, prefers-reduced-motion, orientation и др.

```css
.sidebar { display: none; }

@media (min-width: 768px) {
  .sidebar { display: block; }
}
```

Точки перелома выбираются по контенту, а не по списку устройств: где вёрстка ломается — там и брейкпоинт.

## Что такое mobile-first подход?

Базовые стили пишутся для мобильных, а усложнения — через `min-width` media queries. Отсюда — растущий каскад: каждый следующий экран добавляет, а не переписывает.

```css
.grid { display: grid; gap: 16px; grid-template-columns: 1fr; }

@media (min-width: 640px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); } }
```

Преимущества: мобильная версия гарантированно получает минимум, база не «дозакрывается» десктопными фиксами. Desktop-first с `max-width` — каскад наоборот, чаще конфликтует.

## Чем rem отличается от em и px?

`px` — абсолют. `em` — относительно font-size родителя (компаунды при вложенности). `rem` — относительно font-size корня (`<html>`), единая база масштаба.

```css
html { font-size: 16px; }
.card { padding: 1rem; }     /* 16px */
.badge { font-size: 0.75rem; padding: 0.5em; } /* em — от локального шрифта */
```

rem — для типографики и отступов, чтобы работала настройка размера шрифта браузером; em — для вещей, привязанных к размеру собственного текста; px — для границ и мелких деталей.

## Что такое viewport и meta viewport?

Viewport — видимая область страницы. Meta-тег управляет её поведением на мобильных: `width=device-width` — ширина = ширина устройства, `initial-scale=1` — масштаб без странностей.

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

Без тега мобильный браузер отдаёт виртуальные 980px и уменьшает: flex-вёрстка не спасает, весь адаптив ломается.

## Что такое retina и units vw/vh/dvh?

Retina-экраны имеют плотность пикселей 2-3x: для чёткости картинки дают в N-кратном размере или в SVG. `vw/vh` — проценты от viewport: 100vh на мобильных прыгает из-за адресной строки, поэтому появился `dvh` (dynamic viewport height).

```css
.hero { height: 100dvh; } /* учитывает появление/скрытие браузерного UI */
img { max-width: 100%; }   /* и srcset для плотностей */
```

Для иконок и логотипов — SVG всегда (масштабируется без потерь); для фото — `srcset/sizes`.

## Что такое критический CSS?

Минимальный набор стилей для отрисовки первого экрана, инлайном в `<head>`: страница получает видимый контент до загрузки основного файла стилей.

```html
<head>
  <style>/* hero, header, шрифты — первый экран */</style>
  <link rel="preload" as="style" href="main.css">
</head>
```

Инструменты (critical, Penthouse) вырезают его автоматически. Проблема решает FOUC/белые кадры на медленных сетях; в Next.js за это отвечает встроенная оптимизация.

## Как работает prefers-color-scheme и другие пользовательские предпочтения?

Media query по системным настройкам пользователя: тёмная тема, уменьшение анимаций, контраст.

```css
:root { --bg: #fff; --text: #111; }

@media (prefers-color-scheme: dark) {
  :root { --bg: #111; --text: #eee; }
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none; transition: none; }
}
```

`prefers-reduced-motion` — не украшательство, а доступность: часть пользователей физически плохо переносит анимации. Токены на CSS-переменных делают тему управляемой и из JS (data-theme).

## Что такое кроссбраузерность и как её поддерживать?

Одинаково корректная работа в Chrome, Firefox, Safari, Edge. Основные инструменты: фичи по поддержке (caniuse), автопрефиксер, полифилы для JS, прогрессивное улучшение.

```css
/* Фолбэк до flex-«гридов»: старые браузеры игнорируют grid */
.layout { display: flex; flex-direction: column; }
@supports (display: grid) {
  .layout { display: grid; grid-template-columns: 260px 1fr; }
}
```

Практика: Safari — главный источник сюрпризов на маке (даты, scroll, sticky); целевые браузеры фиксируются в browserslist/.browserslistrc, сборка догоняет автопрефиксером.
