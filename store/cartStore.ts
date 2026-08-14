import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((item) => item.productId === product.id);

          if (existing) {
            const nextQuantity = Math.min(existing.quantity + quantity, product.stock);
            return {
              items: state.items.map((item) =>
                item.productId === product.id ? { ...item, quantity: nextQuantity } : item,
              ),
            };
          }

          const newItem: CartItem = {
            productId: product.id,
            barcode: product.barcode,
            name: product.name,
            image: product.image,
            brand: product.brand,
            price: product.price,
            discountPrice: product.discountPrice,
            quantity: Math.min(quantity, product.stock),
            unit: product.unit,
            stock: product.stock,
          };
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),

      increaseQuantity: (productId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
              : item,
          ),
        })),

      decreaseQuantity: (productId) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item,
            )
            .filter((item) => item.quantity > 0),
        })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.productId !== productId)
              : state.items.map((item) =>
                  item.productId === productId
                    ? { ...item, quantity: Math.min(quantity, item.stock) }
                    : item,
                ),
        })),

      clearCart: () => set({ items: [] }),

      getSubtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getDiscount: () =>
        get().items.reduce(
          (sum, item) =>
            sum + (item.discountPrice !== null ? (item.price - item.discountPrice) * item.quantity : 0),
          0,
        ),

      getTotal: () => get().getSubtotal() - get().getDiscount(),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'freshcart-cart',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
