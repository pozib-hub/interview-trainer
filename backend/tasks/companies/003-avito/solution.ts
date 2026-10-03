export const logger = {
    mode: 'Dev',
    check() {
        return `This is ${this.mode} mode`;
    }
};

export const loggerCheck = logger.check.bind(logger);

export function execute(fn: () => any) {
    return fn();
}

export function testLogger() {
    return {
        check1: logger.check(),
        check2: loggerCheck(),
    };
}

export function testModifyItemData() {
    function modifyItemData(price: any, platform: any) {
        price.rub = 5000;
        platform = 'iOS';
        isModified = true;

        function printItemData() {
            return { price, platform, isModified };
        }

        return printItemData;
    }

    let price = { rub: 3500 };
    let platform = 'Android';
    let isModified: any = false;

    const printItemData = modifyItemData(price, platform);

    const afterModify = {
        price: { ...price },
        platform,
        isModified,
    };

    price = { usd: 100 };
    platform = 'Web';
    isModified = null;

    const closureResult = printItemData();

    return { afterModify, closureResult };
}

export function checkOrder(): Promise<string[]> {
    const order: string[] = [];

    return new Promise((resolve) => {
        order.push('1');

        async function asyncFn() {
            order.push('2');
            await Promise.resolve(null);
            order.push('3');
        }

        asyncFn();

        new Promise((resolve) => {
            setTimeout(() => {
                resolve();
                order.push('4');
            }, 0);
        }).then(() => {
            order.push('5');
            resolve(order);
        });

        order.push('6');
    });
}
