'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface AddItemOptions {
  selectedSize: string;
  selectedSizeLabel: string;
  selectedMaterial: string;
  selectedMaterialLabel: string;
  materialColor: string;
  unitPrice: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, options: AddItemOptions) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, options) => {
        const id = `${product.id}__${options.selectedSize}__${options.selectedMaterial}`;
        set(state => {
          const existing = state.items.find(item => item.id === id);
          if (existing) {
            return {
              items: state.items.map(item =>
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            };
          }
          return { items: [...state.items, { id, product, ...options, quantity: 1 }] };
        });
      },

      removeItem: (id) => {
        set(state => ({ items: state.items.filter(item => item.id !== id) }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) { get().removeItem(id); return; }
        set(state => ({
          items: state.items.map(item => item.id === id ? { ...item, quantity } : item),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      subtotal: () => get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    }),
    { name: 'framio-cart' }
  )
);
