export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getOrder(): Promise<string[]> {
  return new Promise((resolve) => {
    const order: string[] = [];
    const log = (v: any) => order.push(String(v));

    (function () {
      log(1);
      setTimeout(() => log(2), 1000);
      Promise.resolve().then(() => {
        sleep(1000).then(() => log(3));
        log(4);
      });
      log(5);
    })();

    setTimeout(() => {
      resolve(order);
    }, 2500);
  });
}
