export const expect = (val: number) => {
  return {
    toBe(valueToBe: number) {
      if (val === valueToBe) {
        return { value: true };
      }

      throw Error("Not Equal");
    },

    notToBe(valueNotToBe: number) {
      if (val !== valueNotToBe) {
        return { value: true };
      }

      throw Error("Equal");
    },
  };
};
