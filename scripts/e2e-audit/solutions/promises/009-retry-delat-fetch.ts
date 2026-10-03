export function test(): Promise<void> {
  return Promise.resolve();
}

export const retry = async (
  callback: (...args: any[]) => Promise<any>,
  config: { count: number; delay: (count: number) => number }
) => {
  let attempt = 0;
  while (true) {
    try {
      return await callback();
    } catch {
      if (attempt >= config.count) {
        throw "Max retries reached";
      }
      attempt++;
      await new Promise((r) => setTimeout(r, config.delay(attempt)));
    }
  }
};

export const request = async (...args: any[]) => {
  return retry(() => Promise.resolve(args), { count: 3, delay: () => 0 });
};
