export const goods = [
  { id: "ab", name: "Mя-01", type: "чyгун", weight: 1 },
  { id: "bc", name: "MA-02", type: "чyгун", weight: 4 },
  { id: "cd", name: "Mя-03", type: "сталь", weight: 6 },
  { id: "de", name: "Mя-04", type: "черный", weight: 3 },
  { id: "ef", name: "Mя-05", type: "черный", weight: 2 },
  { id: "fg", name: "Mя-06", type: "сталь", weight: 1 },
  { id: "ek", name: "Mя-05", type: "черный", weight: 2 },
  { id: "em", name: "Mя-05", type: "черный", weight: 2 },
];

// type TGood = {
//   id: string;
//   name: string;
//   type: string;
//   weight: number;
// };

// const goods: TGood[] = [
//   { id: "ab", name: "Mя-01", type: "чyгун", weight: 1 },
//   { id: "bc", name: "MA-02", type: "чyгун", weight: 4 },
//   { id: "cd", name: "Mя-03", type: "сталь", weight: 6 },
//   { id: "de", name: "Mя-04", type: "черный", weight: 3 },
//   { id: "ef", name: "Mя-05", type: "черный", weight: 2 },
//   { id: "fg", name: "Mя-06", type: "сталь", weight: 1 },
//   { id: "ek", name: "Mя-05", type: "черный", weight: 2 },
//   { id: "em", name: "Mя-05", type: "черный", weight: 2 },
// ];

// type TMapGood = {
//   [key in TGood["type"]]: { ids: string[]; totalWeight: number };
// };

// const mapGoods = goods.reduce<TMapGood>((acc, item) => {
//   if (acc[item.type]) {
//     acc[item.type] = {
//       ...acc[item.type],
//       ids: [...acc[item.type].ids, item.id],
//       totalWeight: item.weight + acc[item.type].totalWeight,
//     };
//   } else {
//     acc[item.type] = { ids: [item.id], totalWeight: item.weight };
//   }

//   return acc;
// }, {});