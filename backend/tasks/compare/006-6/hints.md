## Подсказка 1
`true == "true"` → `false` (true→1, "true"→NaN, 1==NaN→false). `["x"] == "x"` → `true` (["x"].toString()="x").

## Подсказка 2
`"number" + 15 + 3` → `"number153"` (строка + число = строка). `15 + 3 + "number"` → `"18number"` (сложение чисел, потом конкатенация). `"" + null` → `"null"`.
