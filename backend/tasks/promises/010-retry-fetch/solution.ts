export const fetchData = (url: string) => {
  let repeat = 5 - 1;

  return new Promise((res, rej) => {
    function request() {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Bad response");
          }
          res(response);
        })
        .catch((err) => {
          if (repeat > 0) {
            --repeat;
            request();
          } else {
            rej("Не удалось получить данные");
          }
        });
    }

    request();
  });
};

fetchData("https://lel.com").then(console.log).catch(console.log);