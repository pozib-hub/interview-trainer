export function getResult(): string[] {
  return [
    "ответ",
    "1) fn() до объявления функции — работает (hoisting): 1) OK, 2) TypeError: fn is not a function (var fn ещё undefined), 3) ReferenceError (TDZ const).",
    "2) a.hasOwnProperty('__proto__') — false; a.__proto__.hasOwnProperty('__proto__') — true (Object.prototype).",
    "3) obj.child.b() — undefined и window/global (стрелка берёт this снаружи); obj.child.c() — 10 и obj.child.",
    "4) Порядок: 1, 3, 8, micro, micro1, micro2, 6, 2, 4, 5, 7.",
    "5) Цепочка: 'a2' -> 'a2b' -> 'a2bс' -> 'a2bсd1' -> 'a2bсd1' (then('d2') пропущен) -> 'a2bсd1d3' -> finally -> 'a2bсd1d3'.",
  ];
}
