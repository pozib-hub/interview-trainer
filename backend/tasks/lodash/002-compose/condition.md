# Необходимо реализовать функцию compose, которая принимает несколько функций в...

Необходимо реализовать функцию compose, которая принимает несколько функций в качестве аргументов и возвращает новую функцию. 
  Эта функция при вызове применяет переданные функции справа налево, передавая результат одной функции как аргумент следующей.

  const square = (x: number) => x * x;
  const times2 = (x: number) => x * 2;

  const sum = (a: number, b: number) => a + b;

  console.log(compose1(square, times2)(2) === square(times2(2)));
  console.log(compose2(square, times2, sum)(3, 4) === square(times2(sum(3, 4))));
