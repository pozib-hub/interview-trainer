# Необходимо реализовать функцию promiseRace, которая принимает массив промисов...

Необходимо реализовать функцию promiseRace, которая принимает массив промисов и возвращает новый промис.

  Завершается значением первого выполненного промиса (независимо от того, выполнен он успешно или отклонён).
  Остальные промисы игнорируются после завершения первого.

  const promise1 = new Promise((resolve) => setTimeout(() => resolve(5), 500));
  const promise2 = new Promise((resolve) => setTimeout(() => resolve(3), 200));
  const promise3 = new Promise((resolve) => setTimeout(() => resolve(7), 1000));

  promiseRace([promise1, promise2, promise3]).then(result => {
    console.log(result);
  });
