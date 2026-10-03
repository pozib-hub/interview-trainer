export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getOrder(): Promise<string[]> {
  return new Promise((resolve) => {
    const order: string[] = [];
    const log = (v: any) => order.push(String(v));

    setTimeout(() => {
      log("setTimeout 100");
      sleep(1000).then(() => log("sleep 1000 then"));
    }, 100);

    const promise = new Promise((resolve) => {
      log("in promise");
      resolve("Promise then");
    });

    sleep(2000)
      .then(() => log("sleep 2000 then"))
      .finally(() => {
        log("sleep 2000 finally");
        setTimeout(() => log("finally setTimeout 1000"), 1000);
      });

    log("log1");

    promise.then((res) => log(res));

    setTimeout(() => {
      resolve(order);
    }, 3500);
  });
}
