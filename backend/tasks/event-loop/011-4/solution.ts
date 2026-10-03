export function getOrder(): Promise<string[]> {
  return new Promise((resolve) => {
    const order: string[] = [];
    const log = (v: any) => order.push(String(v));

    function ILovePromise() {
      log("before promise");
      return new Promise((resolve) => {
        log("in Promise");
        resolve("");
      });
    }

    setTimeout(() => log("setTimeout 0"), 0);

    ILovePromise().then(() => log("Promise then-1"));

    log("log1");

    new Promise((resolve) => resolve("Promise then 2")).then((v) => log(v));

    setTimeout(() => {
      resolve(order);
    }, 50);
  });
}
