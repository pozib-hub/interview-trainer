# Необходимо реализовать функцию promiseAny, которая принимает массив промисов ...

Необходимо реализовать функцию promiseAny, которая принимает массив промисов и возвращает новый промис.

  Если хотя бы один промис выполнится успешно, promiseAny завершается этим значением.
  Если все промисы отклонены, promiseAny завершается с ошибкой, содержащей массив всех причин отказа.

  const promise1 = Promise.reject("Error 1");
  const promise2 = Promise.resolve(5);
  const promise3 = Promise.resolve(7);

  promiseAny([promise1, promise2, promise3]).then(result => {
    console.log(result);
  });
