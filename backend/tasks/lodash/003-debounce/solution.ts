export const debounce = (callback: Function, wait: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: any) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      callback(...args);
    }, wait);
  };
};

export const debounced = debounce(() => {}, 500);

debounced("asdasdasd");