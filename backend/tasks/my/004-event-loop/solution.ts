export function getOrder(): Promise<string[]> {
  return new Promise((resolve) => {
    const order: number[] = [];

    setTimeout(function timeout() {
      order.push(1);
      resolve(order.map(String));
    }, 0);

    const p = new Promise(function (resolve) {
      order.push(2);
      resolve(undefined);
    });

    p.then(function () {
      order.push(5);
    }).then(function () {
      order.push(6);
    });

    p.then(function () {
      order.push(7);
    }).then(function () {
      order.push(8);
    });

    order.push(4);

    setTimeout(() => {
      resolve(order.map(String));
    }, 50);
  });
}
