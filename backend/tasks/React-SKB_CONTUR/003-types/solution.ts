export type Api = {
  saveList: (products: Product[]) => Promise<Response>;
};

export type Product = {
  name: string;
  id: string;
};

export type Errors = Array<{ id: string; text: string }>;

export type Response =
  | { ok: false; errors: Errors }
  | { ok: true };
