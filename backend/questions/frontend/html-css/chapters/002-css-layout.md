# CSS, Flexbox и Grid

## Что такое специфичность селекторов и как считается?

Специфичность — вес селектора, определяющий победителя при конфликте стилей. Считается тройкой (id, класс/атрибут/псевдокласс, элемент): `(1,0,0)` у `#id`, `(0,1,0)` у `.class`, `(0,0,1)` у `div`.

```css
#header .title   { color: red; }    /* (1,1,0) — победит */
.title            { color: blue; }   /* (0,1,0) */
```

Inline-стили выше всех, `!important` — ещё выше, но ломает каскад и его избегают. При равной специфичности побеждает последний объявленный.

## Что такое box-sizing и зачем border-box?

`content-box` (по умолчанию): width — только контент, padding и border добавляются сверху. `border-box`: width включает padding и border — предсказуемая арифметика.

```css
* { box-sizing: border-box; }

/* width: 100px + padding 20 — реально 100px, не 140px */
.card { width: 100px; padding: 20px; }
```

Глобальный `border-box` — первый сниппет почти в каждом проекте именно из-за этой предсказуемости.

## Как отцентрировать элемент?

Вариант для flex-контейнера: `display: flex; justify-content: center; align-items: center;`. В Grid: `place-items: center`. Абсолют: `inset: 0; margin: auto` при фиксированных размерах.

```css
.parent {
  display: flex;
  justify-content: center; /* горизонталь */
  align-items: center;     /* вертикаль */
}
```

Флекс — универсальный ответ: работает без знания размеров ребёнка, в отличие от трюков с `transform: translate(-50%, -50%)`.

## Что делает flex: 1 и из чего состоит?

`flex: 1` — shorthand из `flex-grow: 1; flex-shrink: 1; flex-basis: 0%`. Элемент растягивается, забирая свободное место, и все `flex: 1` делят его поровну, независимо от содержимого.

```css
.sidebar { flex: 0 0 260px; }  /* фикс: не растёт, не сжимается, 260px */
.content { flex: 1; }          /* занимает всё остальное */
```

Важность `flex-basis: 0`: без него (basis: auto) свободное место делится с учётом размера содержимого — колонки получаются разными.

## Когда Flexbox, а когда Grid?

Flex — одномерный ряд или колонка, размером управляет содержимое, элементы могут переноситься (wrap). Grid — двумерная сетка, позиции задаются шаблоном, а не порядком содержимого.

```css
/* Flex: тулбар — одна строка, элементы сами определяют ширину */
.toolbar { display: flex; gap: 8px; }

/* Grid: каркас страницы — строки и колонки известны заранее */
.layout {
  display: grid;
  grid-template: "header header" auto "side main" 1fr / 260px 1fr;
}
```

Гибрид — норма: сетка страницы на Grid, внутренние ряды на Flex.

## Что делает gap и чем лучше margin?

`gap` — расстояние между элементами flex/grid-контейнера: не создаёт «двойных» отступов у краёв, не требует nth-child-хаков и negative-margin-обёрток.

```css
.list { display: flex; flex-wrap: wrap; gap: 16px; }
/* у последнего элемента нет лишнего margin справа */
```

Margin — для отношений «элемент↔внешний мир»; gap — для ритма внутри группы.

## Как работают значения position?

`static` — поток. `relative` — сдвиг от своего места, дети с absolute считают его positioned-предком. `absolute` — выпадает из потока, позиция от ближайшего positioned-предка. `fixed` — от viewport (переживает скролл). `sticky` — relative, пока не дойдёт до порога, затем fixed в пределах родителя.

```css
.table-header { position: sticky; top: 0; background: #fff; }

.badge { position: absolute; top: -8px; right: -8px; }
.card { position: relative; }
```

Ловушка fixed: `transform`/`filter` у предка делают его containing block — шапка «прилипает» не к viewport.

## Что такое методологии именования: BEM и CSS-модули?

BEM — конвенция имён `block__element--modifier`: самодокументируемость, плоскость (низкая специфичность), устойчивость к конфликтам. CSS-модули — автоматические уникальные имена классов на уровне сборки.

```css
/* BEM */
.card__title { … }
.card__title--large { … }
```

```tsx
// CSS Modules: styles.card__title компилируется в уникальный класс
import styles from "./Card.module.css";
<div className={styles.title} />
```

Модули решают ту же проблему (изоляцию стилей) инструментально; BEM полезен там, где нет сборки (вёрстка писем, легаси, дизайн-системы в чистом CSS).
