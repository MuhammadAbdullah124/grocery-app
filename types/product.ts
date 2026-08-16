export interface Product {
  id: string;
  barcode: string | null;
  name: string;
  brand: string;
  description: string;
  /** Category display name — categories are user-managed, not a fixed list. */
  category: string;
  categoryId: string;
  /** What this product cost to acquire. Optional — older products may not have one set. */
  purchasePrice?: number | null;
  price: number;
  discountPrice: number | null;
  discountPercentage: number | null;
  image: string;
  stock: number;
  /** Unit display name (e.g. "kg", "250ml") — units are user-managed, not a fixed list. */
  unit: string;
  unitId: string;
}

export interface ProductInput {
  barcode?: string;
  name: string;
  brand: string;
  description: string;
  categoryId: string;
  purchasePrice?: number | null;
  price: number;
  discountPrice: number | null;
  stock: number;
  unitId: string;
  image?: string;
}
