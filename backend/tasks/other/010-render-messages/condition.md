# Написать функцию, которая рендерит сообщения в порядке возрастания message.id...

Написать функцию, которая рендерит сообщения в порядке возрастания message.id. Айди сообщения начинаются с 1.
  Сообщения могут приходит в неправильном порядке.
  Задача: вывести сообщения как можно скорее в верном порядке.

  subscribe((onMessage) => {
    setTimeout(() => onMessage({ id: 1, message: "One" }), 20);
    setTimeout(() => onMessage({ id: 2, message: "Two" }), 30);
    setTimeout(() => onMessage({ id: 3, message: "Three" }), 10);
    setTimeout(() => onMessage({ id: 4, message: "Four" }), 20);
  }, console.log);
