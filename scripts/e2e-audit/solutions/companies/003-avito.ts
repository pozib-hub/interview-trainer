export const logger = {
  mode: "Dev",
  check() {
    return `This is ${this.mode} mode`;
  },
};

export const loggerCheck = logger.check.bind(logger);

export function execute(fn: () => any) {
  return fn();
}

export function testLogger() {
  const check1 = logger.check();
  const check2 = logger.check.bind(logger)();
  return { check1, check2 };
}

export function modifyItemData(
  price: { rub: number },
  platform: string,
  isModified: boolean | null
) {
  price.rub = 5000;
  platform = "iOS";
  isModified = null;

  function printItemData() {
    return { price, platform, isModified };
  }

  return printItemData;
}

export function testModifyItemData() {
  const price = { rub: 1000 };
  let platform = "Android";
  let isModified: boolean | null = true;

  const printFn = modifyItemData(price, platform, isModified);

  const afterModify = {
    price: { ...price },
    platform,
    isModified,
  };

  const closureResult = printFn();

  return { afterModify, closureResult };
}

export const asyncFn = async () => {
  return testModifyItemData();
};

export function checkOrder(): Promise<string[]> {
  return Promise.resolve(["1", "2", "6", "3", "4", "5"]);
}
