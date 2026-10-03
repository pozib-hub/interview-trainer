export async function fetchData() {
  // Создаём контроллер для управления асинхронной операцией
  const controller = new AbortController();
  const signal = controller.signal;

  // Симуляция долгого процесса
  const longProcess = new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => resolve("Процесс завершён"), 6000);

    // Если сигнал был абортирован, отклоняем промис
    signal.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Процесс отменен", "AbortError"));
    });
  });

  // Таймер для отмены через 5 секунд
  setTimeout(() => controller.abort(), 5000);

  try {
    const result = await longProcess;
    console.log(result);
  } catch (err: any) {
    if (err.name === "AbortError") {
      console.log("Процесс отменен");
    } else {
      console.error("Ошибка:", err);
    }
  }
}

fetchData();