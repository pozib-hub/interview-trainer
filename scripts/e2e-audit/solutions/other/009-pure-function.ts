export const add = async (
  params: { value: number },
  y: number,
  width: number,
  fetchData: () => Promise<number>
) => {
  const data = await fetchData();
  return 2 + data + width;
};
