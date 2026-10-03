export function modifyBondData(
  price: { rub: number },
  bondType: string,
  isEditable: boolean
): () => { price: { rub: number }; bondType: string; isEditable: boolean } {
  price.rub = 1200;
  bondType = "fixed";
  isEditable = true;

  function printBondData() {
    return { price, bondType, isEditable };
  }

  return printBondData;
}

export function getResult() {
  let price: { rub: number } | { usd: number } = { rub: 1000 };
  let bondType = "floating";
  let isEditable: boolean | null = false;

  const printFn = modifyBondData(
    price as { rub: number },
    bondType,
    isEditable as boolean
  );

  const afterModify = {
    price: { ...price },
    bondType,
    isEditable,
  };

  price = { usd: 10 };
  bondType = "amortization";
  isEditable = null;

  const afterReassign = printFn();

  return { afterModify, afterReassign };
}
