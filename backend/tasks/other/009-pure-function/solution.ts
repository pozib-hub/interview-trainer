export const add = async (
  params: { value: number },
  y: number,
  width: number,
  fetchData: () => Promise<number>
) => {
  const updatedY = y * 2;
  const data = await fetchData();
  return updatedY + data + width;
};
