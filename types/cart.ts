import type { Product } from './product';

export interface CartItem {
  productId: string;
  barcode: string | null;
  name: string;
  image: string;
  brand: string;
  price: number;
  discountPrice: number | null;
  quantity: number;
  unit: Product['unit'];
  stock: number;
}
