export type NegativeNumber<T extends number> = `${T}` extends `-${number}` ? T : never;

// 🔥 Примеры использования:
export type A = NegativeNumber<-10>; // -10 ✅
export type B = NegativeNumber<5>; // never ❌
export type C = NegativeNumber<-100>; // -100 ✅
export type D = NegativeNumber<0>; // never ❌