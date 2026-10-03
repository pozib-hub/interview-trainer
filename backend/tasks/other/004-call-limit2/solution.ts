export const runonce = (callback: () => void) => {
  let isCalled = false;

  return function () {
    if (isCalled) {
      return;
    }

    isCalled = true;
    callback();
  };
};