export const request = async (...args: any[]) => args;

export const fetchData = (url: string, attempt: number = 1): Promise<any> => {
  return fetch(url).catch(() => {
    if (attempt >= 5) {
      return Promise.reject("Не удалось получить данные");
    }
    return fetchData(url, attempt + 1);
  });
};
