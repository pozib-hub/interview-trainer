# Необходимо реализовать генератор TraverseGenerator,

Необходимо реализовать генератор TraverseGenerator,
  который принимает вложенный массив (Number[][]) и поочерёдно возвращает его элементы при вызове .next().value.

  const generatorOne = TraverseGenerator([1, [2, 3]]);
  console.log(generatorOne.next().value); // 1
  console.log(generatorOne.next().value); // 2
  console.log(generatorOne.next().value); // 3

  const generatorTwo = TraverseGenerator([[[6]], [1, 3], []]);
  console.log(generatorTwo.next().value); // 6
  console.log(generatorTwo.next().value); // 1
  console.log(generatorTwo.next().value); // 3

  const generatorThree = TraverseGenerator([]);
  console.log(generatorThree.next().value); // undefined
