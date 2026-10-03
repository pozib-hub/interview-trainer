# Необходимо реализовать функцию promiseAll,

Необходимо реализовать функцию promiseAll, 
  которая принимает массив промисов и возвращает новый промис. Этот промис должен:
  - Выполниться успешно, если все переданные промисы выполнены успешно. 
  - Результат должен быть массивом с результатами выполнения всех промисов в том порядке, в котором они были переданы.
  - Выполниться с ошибкой, если хотя бы один из промисов завершился с ошибкой.

  const promise1 = Promise.resolve(3);
  const promise2 = Promise.resolve(5);
  const promise3 = Promise.resolve(7);

  promiseAll([promise1, promise2, promise3]).then(results => {
    console.log(results); // [3, 5, 7]
  }).catch(error => {
    console.log(error);
  });
