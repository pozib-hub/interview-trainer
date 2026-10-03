export function getOrder(): Promise<string[]> {
  return new Promise((resolve) => {
    const order: string[] = [];
    const log = (v: any) => order.push(String(v));

    async function f() {
      log(1);

      const promise = new Promise((resolve) => {
        log(2);

        setTimeout(() => {
          log(3);
          resolve("гOTOBO!");
          log(4);
        });
      });

      log(5);

      const result = await promise;

      log(6);
      log(result);

      return "Result";
    }

    f();
    log(7);

    setTimeout(() => {
      resolve(order);
    }, 50);
  });
}
