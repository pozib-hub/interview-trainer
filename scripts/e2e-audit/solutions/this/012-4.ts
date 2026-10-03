export function getResult(): string[] {
  return [
    "ответ",
    "TypeError: fido.bark is not a function",
    "Объяснение: bark назначен на конструктор Dog (статический метод), а не на Dog.prototype.",
    "Экземпляр fido не наследует статические методы.",
    "Исправление: Dog.prototype.bark = function () { ... }",
  ];
}
