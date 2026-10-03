export type ExampleType = {
  Field1: string;
  Field2: string;
  Field3: number;
  Field4: boolean;
};

// prettier-ignore
export type T1<S, T> = { [K in keyof S]: S[K] extends T ? K : never }[keyof S];

export type StringKeys = T1<ExampleType, string>;
// Оставит только ключи, где значение типа string
// type StringKeys = "Field1" | "Field2"

export type NumberKeys = T1<ExampleType, number>;
// type NumberKeys = "Field3"

export type BooleanKeys = T1<ExampleType, boolean>;
// type BooleanKeys = "Field4"