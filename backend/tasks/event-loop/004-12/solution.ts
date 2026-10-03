export function getOrder(): Promise<string[]> {
  return new Promise((resolve) => {
    const order: string[] = [];
    const log = (v: any) => order.push(String(v));

    async function test() {
      log("1");
      await log("2");
      log("6");
      await log("7");
    }

    test();
    setTimeout(() => log("3"));

    new Promise((res) => {
      log("4");
      res("");
    }).then(() => log("5"));

    setTimeout(() => {
      resolve(order);
    }, 50);
  });
}
