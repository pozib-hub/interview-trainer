export const debounce = (callback: Function, wait: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: any[]) => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      callback(...args);
    }, wait);
  };
};
export const debounced = debounce(() => {}, 300);
