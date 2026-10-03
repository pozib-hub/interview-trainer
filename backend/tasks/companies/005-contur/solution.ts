export function task1(): number {
  const values = [1, 2, 5, 10];
  let result = 0;

  if (values.every(item => item > 0)) {
    result += values.filter(item => item > 5).length;
  }

  if (values.some(item => item > 5)) {
    values.forEach((item, index) => {
      if (index > 1 && index < 3) {
        result += item;
      }
    });
  }

  return result;
}

export function sayWelcome(): string {
  const currentCity = "Екатеринбург";
  return "Welcome to" + currentCity;
}

export function testClosure(): string {
  const currentCity = "Екатеринбург";

  function sayWelcome() {
    return "Welcome to" + currentCity;
  }

  const innerCity = "Москва";
  return sayWelcome();
}

export function truthyCount(): number {
  const whatIsTruthy = [1, 'dfd', "0", {}, '', function () { }, NaN, true, false, 0, [], Infinity, null, undefined];
  return whatIsTruthy.filter(item => item).length;
}

export function testLet(): number {
  let a = 1;
  a = 2;
  return a;
}

export function doAsync(x: any): Promise<number> {
  return new Promise((resolve, reject) => {
    if (x) {
      resolve(2);
    } else {
      reject(1);
    }
  });
}

export async function testDoAsync(): Promise<{ syncValue: number; asyncValue: number | null }> {
  let a = 0;
  const syncValue = a;

  try {
    const result = await doAsync(false);
    return { syncValue, asyncValue: result };
  } catch (e) {
    return { syncValue, asyncValue: e as number };
  }
}

export function showFullName(firstName: string, lastName: string, ...rest: string[]): string {
  return `${firstName} ${lastName}${rest.length ? ` - ${rest}` : ""}`;
}
