# Реализуйте асинхронную функцию с использованием AbortController,

Реализуйте асинхронную функцию с использованием AbortController,
  которая симулирует долгий процесс. 
  Если функция не завершится за 5 секунд, она должна быть отменена.

  async function fetchData() {
    // Симуляция долгого процесса
    const longProcess = new Promise<string>((resolve, reject) => {
      setTimeout(() => resolve("Процесс завершён"), 6000);
    });

    try {
      //   const result = await ...;
      //   console.log(result);
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Процесс отменен");
      } else {
        console.error("Ошибка:", err);
      }
    }
  }

  fetchData();
