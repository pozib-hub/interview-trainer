export type Product = { id: string; name: string };
export type Error = { id: string; text: string };
export type Errors = Error[];

export function addProduct(products: Product[]): Product[] {
  return [...products, { id: String(Date.now() + Math.random()), name: "" }];
}

export function removeProduct(products: Product[], id: string): Product[] {
  return products.filter((p) => p.id !== id);
}

export function updateProduct(products: Product[], id: string, name: string): Product[] {
  return products.map((p) => (p.id === id ? { ...p, name } : p));
}

export function canSend(products: Product[], loading: boolean): boolean {
  return products.length > 0 && !loading;
}

export function App() {
  return null;
}
