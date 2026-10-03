export type Product = { id: string; name: string };
export type Error = { id: string; text: string };
export type Errors = Error[];

export function addProduct(products: Product[]): Product[] {
  return [...products, { id: Date.now().toString(), name: "" }];
}

export function removeProduct(products: Product[], id: string): Product[] {
  return products.filter((p) => p.id !== id);
}

export function updateProduct(products: Product[], id: string, name: string): Product[] {
  return products.map((p) => (p.id === id ? { ...p, name } : p));
}

export function canSend(products: Product[], loading: boolean): boolean {
  return !loading && products.length > 0;
}

export function App() {
  return null;
}

export default App;
