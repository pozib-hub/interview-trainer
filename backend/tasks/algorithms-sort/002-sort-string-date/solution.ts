//Отсортировать массив объектов по дате
export let arr = [
  { date: "10.01.2017" },
  { date: "01.12.2002" },
  { date: "11.02.2021" },
  { date: "05.11.2016" },
];

export const sortDates = (arr: { date: string }[]) => {
  return [...arr].sort((a, b) => {
    const dateA = new Date(a.date.split(".").reverse().join("-"));
    const dateB = new Date(b.date.split(".").reverse().join("-"));
    return dateA - dateB;
  });
};

console.log(sortDates(arr));