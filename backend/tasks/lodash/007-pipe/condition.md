# Необходимо реализовать функцию pipe, которая принимает несколько функций в ка...

Необходимо реализовать функцию pipe, которая принимает несколько функций в качестве аргументов и возвращает новую функцию. 
  При вызове эта функция применяет переданные функции слева направо, передавая результат каждой функции как аргумент следующей.

  const times = (y: number) => (x: number) => x * y;
  const plus = (y: number) => (x: number) => x + y;
  const subtract = (y: number) => (x: number) => x - y;
  const divide = (y: number) => (x: number) => x / y;

  const calculationOne = pipe([times(2), times(3)]); // -> (2 * 2) -> * 3
  console.log(calculationOne(2)); => 12
