export const expect = (val: any) => {
  return {
    toBe(other: any) {
      if (val === other) return { value: true };
      throw new Error("Not Equal");
    },
    notToBe(other: any) {
      if (val !== other) return { value: true };
      throw new Error("Equal");
    },
  };
};
