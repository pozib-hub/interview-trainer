export function task1(): number {
  let a = 2;
  const addFour = () => {
    a += 4;
  };
  addFour();
  return a;
}

const currentCity = "Екатеринбург";

export function sayWelcome(): string {
  return `Welcome to${currentCity}`;
}

export function testClosure(): string {
  const innerCity = "Сингапур";
  return sayWelcome();
}

export function truthyCount(): number {
  const values = [1, "a", [], {}, "0", true, -1, "false", 0, "", null, undefined, NaN, false];
  return values.filter(Boolean).length;
}

export function testLet(): number {
  let x = 1;
  x = 2;
  return x;
}

export function doAsync(x: any): Promise<number> {
  return x ? Promise.resolve(2) : Promise.reject(1);
}

export function testDoAsync(): Promise<{ syncValue: number; asyncValue: number }> {
  const syncValue = 0;
  let asyncValue = 0;
  return doAsync(false)
    .catch(() => {
      asyncValue = 1;
    })
    .then(() => ({ syncValue, asyncValue }));
}

export function showFullName(firstName: string, lastName: string, ...rest: string[]): string {
  if (rest.length === 0) {
    return `${firstName} ${lastName}`;
  }
  return `${firstName} ${lastName} - ${rest.join(",")}`;
}
