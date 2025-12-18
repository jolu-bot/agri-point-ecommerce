import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  promoPrice?: number;
  image: string;
  quantity: number;
  variant?: string;
  maxStock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string, variant?: string) => void;
  updateQuantity: (id: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const items = get().items;
        const existingItemIndex = items.findIndex(
          (item) => item.id === newItem.id && item.variant === newItem.variant
        );

        if (existingItemIndex > -1) {
          // Item existe déjà, augmenter la quantité
          const updatedItems = [...items];
          const currentQuantity = updatedItems[existingItemIndex].quantity;
          
          if (currentQuantity < newItem.maxStock) {
            updatedItems[existingItemIndex].quantity += 1;
            set({ items: updatedItems });
          }
        } else {
          // Nouvel item
          set({ items: [...items, { ...newItem, quantity: 1 }] });
        }
      },

      removeItem: (id, variant) => {
        set({
          items: get().items.filter(
            (item) => !(item.id === id && item.variant === variant)
          ),
        });
      },

      updateQuantity: (id, quantity, variant) => {
        if (quantity <= 0) {
          get().removeItem(id, variant);
          return;
        }

        const items = get().items;
        const updatedItems = items.map((item) => {
          if (item.id === id && item.variant === variant) {
            return {
              ...item,
              quantity: Math.min(quantity, item.maxStock),
            };
          }
          return item;
        });

        set({ items: updatedItems });
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.promoPrice || item.price;
          return total + price * item.quantity;
        }, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'agripoint-cart',
    }
  )
);
