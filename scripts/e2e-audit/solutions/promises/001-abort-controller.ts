export async function fetchData() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  const longProcess = new Promise<string>((resolve, reject) => {
    controller.signal.addEventListener("abort", () => {
      reject(Object.assign(new Error("The operation was aborted"), { name: "AbortError" }));
    });
    setTimeout(() => resolve("Процесс завершён"), 6000);
  });

  try {
    const result = await longProcess;
    clearTimeout(timer);
    console.log(result);
  } catch (err: any) {
    if (err.name === "AbortError") {
      console.log("Процесс отменен");
    } else {
      console.error("Ошибка:", err);
    }
  }
}
