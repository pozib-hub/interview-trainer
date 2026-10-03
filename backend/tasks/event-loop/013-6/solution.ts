export function getOrder(): Promise<string[]> {
  return new Promise((resolve) => {
    const order: string[] = [];
    const log = (v: any) => order.push(String(v));

    const run = () => {
      setTimeout(() => log("timeout"), 0);

      log(1);

      new Promise((resolve) => {
        log("Promise");
        setTimeout(() => {
          log("777");
          resolve("");
        }, 0);
      })
        .then(() => log("then1"))
        .then(() => log("then2"));

      log(4);

      setTimeout(() => log("timeout2"), 0);
    };

    run();

    setTimeout(() => {
      resolve(order);
    }, 50);
  });
}
