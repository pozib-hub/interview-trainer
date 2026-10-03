export type NegativeNumber<T extends number> = `${T}` extends `-${string}` ? T : never;

export type A = NegativeNumber<-10>;
export type B = NegativeNumber<5>;
export type C = NegativeNumber<-100>;
export type D = NegativeNumber<0>;
