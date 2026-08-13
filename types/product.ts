export type ProductCategory =
  | 'fruits'
  | 'vegetables'
  | 'dairy'
  | 'bakery'
  | 'beverages'
  | 'snacks'
  | 'household'
  | 'personal_care';

export type ProductUnit = 'pc' | 'kg' | 'g' | 'l' | 'ml' | 'dozen' | 'pack';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  description: string;
  category: ProductCategory;
  price: number;
  discountPrice: number | null;
  discountPercentage: number | null;
  image: string;
  stock: number;
  unit: ProductUnit;
}

export interface ProductCategoryMeta {
  id: ProductCategory;
  label: string;
  icon: string;
}
