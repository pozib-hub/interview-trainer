export function getResult(): string[] {
  return [
    "1-я: стрелочные vs обычные функции — this внутри bar (стрелка) и baz (обыная)",
    "2-я: __proto__ и hasOwnProperty",
    "3-я: this в стрелочной и обычной функции внутри объекта",
    "4-я: event loop — setTimeout, Promise, микрозадачи",
    "5-я: цепочка Promise.reject().then().catch().finally()",
  ];
}
