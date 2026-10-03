export type TObjectInfer<T> = T extends object ? T[keyof T] : never;

export const data = {
  x: 1,
  y: "2",
  z: function () {},
};

export type IData = TObjectInfer<typeof data>;
