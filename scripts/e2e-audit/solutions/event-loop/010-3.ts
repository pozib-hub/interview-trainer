export function getSyncOrder(): string[] {
  return ["1", "4"];
}

export function infiniteRecursion(): never {
  const rec = (): never => rec();
  return rec();
}

export function getOrder() {
  return {
    sync: ["1", "4", "5"],
    error: "Maximum call stack size exceeded (RangeError)",
  };
}
