export type Product = { id: string; name: string };
export type Error = { id: string; text: string };
export type Errors = Error[];
export type Response = { ok: boolean; errors?: Errors };

export function saveList(products: Product[]): Promise<Response> {
  const errors: Errors = [];
  for (const product of products) {
    if (product.name === "") {
      errors.push({ id: product.id, text: "Имя должно быть заполнено" });
    } else if (product.name.length <= 2) {
      errors.push({ id: product.id, text: "Имя должно быть длиннее двух символов" });
    }
    if (/\W|_/.test(product.name)) {
      errors.push({ id: product.id, text: "Имя не должно содержать спецсимволы" });
    }
  }
  if (products.length === 0) {
    errors.push({ id: "", text: "Список не должен быть пустым" });
  }
  if (errors.length > 0) {
    return Promise.resolve({ ok: false, errors });
  }
  return Promise.resolve({ ok: true });
}

export const Api = { saveList };
