export function getOrder(): Promise<string[]> {
  return new Promise((resolve) => {
    const order: string[] = [];
    const log = (v: any) => order.push(String(v));

    setTimeout(function timeout() {
      log(1);
    }, 0);

    const p = new Promise(function (resolve) {
      log(2);
      resolve("");
    });

    p.then(function () {
      log(5);
    }).then(function () {
      log(6);
    });

    p.then(function () {
      log(7);
    }).then(function () {
      log(8);
    });

    log(4);

    setTimeout(() => {
      resolve(order);
    }, 50);
  });
}
