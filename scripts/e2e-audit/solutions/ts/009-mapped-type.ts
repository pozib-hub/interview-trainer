export type ExampleType = {
  Field1: string;
  Field2: string;
  Field3: number;
  Field4: boolean;
};

export type T1<S, T> = {
  [K in keyof S]: S[K] extends T ? K : never;
}[keyof S];

export type StringKeys = T1<ExampleType, string>;
export type NumberKeys = T1<ExampleType, number>;
export type BooleanKeys = T1<ExampleType, boolean>;
