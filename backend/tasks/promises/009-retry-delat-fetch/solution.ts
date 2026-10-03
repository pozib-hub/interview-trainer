export function test(): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error("Failed"));
    }, 2000);
  });
}

export const retry = (
  callback: (...args: any[]) => Promise<void>,
  config: { count: number; delay: (count: number) => number }
): Promise<void> => {
  let attempt = 0;

  return new Promise((resolve, reject) => {
    const request = () => {
      callback()
        .then(resolve)
        .catch((err) => {
          attempt++;
          if (attempt <= config.count) {
            const delay = config.delay(attempt);
            setTimeout(request, delay);
          } else {
            reject("Max retries reached");
          }
        });
    };

    request();
  });
};

retry(test, { count: 5, delay: (retryCount) => retryCount * 1000 })
  .then((res) => console.log("res", res))
  .catch((err) => console.log("err", err));