"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  salePrice?: number | null;
  image: string;
  size?: string;
  colour?: string;
  quantity: number;
  stock: number;
  slug: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, size?: string, colour?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, colour?: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "tts-cart";

function itemKey(id: string, size?: string, colour?: string) {
  return `${id}|${size || ""}|${colour || ""}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      setItems((prev) => {
        const key = itemKey(item.productId, item.size, item.colour);
        const existing = prev.find(
          (i) => itemKey(i.productId, i.size, i.colour) === key
        );
        if (existing) {
          const newQty = Math.min(
            existing.quantity + (item.quantity || 1),
            item.stock
          );
          return prev.map((i) =>
            itemKey(i.productId, i.size, i.colour) === key
              ? { ...i, quantity: newQty }
              : i
          );
        }
        return [
          ...prev,
          { ...item, quantity: Math.min(item.quantity || 1, item.stock) },
        ];
      });
    },
    []
  );

  const removeItem = useCallback(
    (productId: string, size?: string, colour?: string) => {
      setItems((prev) =>
        prev.filter(
          (i) => itemKey(i.productId, i.size, i.colour) !== itemKey(productId, size, colour)
        )
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, size?: string, colour?: string) => {
      if (quantity <= 0) {
        removeItem(productId, size, colour);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          itemKey(i.productId, i.size, i.colour) === itemKey(productId, size, colour)
            ? { ...i, quantity: Math.min(quantity, i.stock) }
            : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce(
    (s, i) => s + (i.salePrice ?? i.price) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
