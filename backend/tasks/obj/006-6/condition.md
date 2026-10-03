# Obj: замыкание и мутация параметров

Что выведется в консоль?

```ts
function modifyBondData(price, bondType, isEditable) {
  price.rub = 1200;
  bondType = "fixed";
  isEditable = true;

  function printBondData() {
    console.log(price);
    console.log(bondType);
    console.log(isEditable);
    return printBondData;
  }

  return printBondData;
}

let price = { rub: 1000 };
let bondType = "floating";
let isEditable = false;

const printItemData = modifyBondData(price, bondType, isEditable);

console.log(price);
console.log(bondType);
console.log(isEditable);

price = { usd: 10 };
bondType = "amortization";
isEditable = null;

printItemData();
```

Реализуйте функцию `getResult()`, возвращающую объект с результатами `afterModify` и `afterReassign`.
