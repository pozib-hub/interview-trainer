export type TObjectInfer<T> = T extends { [key: string]: infer U } ? U : never;

export const data = {
  x: 1,
  y: "2",
  z: function () {},
};

export type IData = TObjectInfer<typeof data>;
export const d: IData = function () {};