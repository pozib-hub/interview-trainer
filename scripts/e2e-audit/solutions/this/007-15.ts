export function getResult(): string[] {
  return [
    "ответ",
    "TypeError: member.getFullName is not a function",
    "Объяснение: getFullName назначен на сам конструктор Person (статический метод),",
    "а не на Person.prototype, поэтому экземпляр member его не видит.",
    "Исправление: Person.prototype.getFullName = function () { ... }",
  ];
}
