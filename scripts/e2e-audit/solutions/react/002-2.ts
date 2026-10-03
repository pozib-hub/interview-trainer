export function getResult(): string[] {
  return [
    "ответ",
    "typeof (<Widget />) вернёт \"object\":",
    "JSX компилируется в React.createElement(Widget, ...),",
    "который возвращает обычный объект (описание элемента), поэтому typeof — \"object\".",
  ];
}
