export function getOrder(): { sync: string[]; error: string } {
  return {
    sync: ["1", "4", "5"],
    error: "Maximum call stack size exceeded",
  };
}

export function getSyncOrder(): string[] {
  const order: string[] = [];
  order.push("1");
  setTimeout(() => order.push("2"), 0);
  Promise.resolve().then(() => order.push("3"));
  order.push("4");
  return order;
}

export function infiniteRecursion(): never {
  return infiniteRecursion();
}
