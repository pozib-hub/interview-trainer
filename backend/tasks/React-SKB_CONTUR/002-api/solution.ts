export type Product = { id: string; name: string };
export type Error = { id: string; text: string };
export type Errors = Error[];
export type Response = { ok: boolean; errors?: Errors };

export async function saveList(products: Product[]): Promise<Response> {
  const errors: Errors = [];

  products.forEach((p, index) => {
    if (p.name === "") {
      errors.push({ id: p.id, text: "Имя должно быть заполнено" });
    }
    if (p.name.length > 0 && p.name.length < 3) {
      errors.push({ id: p.id, text: "Имя должно быть длиннее двух символов" });
    }
    if (p.name.match(/\W|_/g)) {
      errors.push({ id: p.id, text: "Имя не должно содержать спецсимволы" });
    }
    if (products.length === 0) {
      errors.push({ id: "all", text: "Список не должен быть пустым" });
    }
  });

  if (errors.length) {
    return { ok: false, errors };
  }
  return { ok: true };
}

export const Api = {
  saveList,
};
