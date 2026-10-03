export const goods = [
  { id: 1, title: "Товар 1", price: 100 },
  { id: 2, title: "Товар 2", price: 200 },
];

export const goodsById = goods.reduce<Record<number, { id: number; title: string; price: number }>>(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {}
);
