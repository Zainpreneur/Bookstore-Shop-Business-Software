import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import api, { getErrorMessage } from "../api/client";
import type { CartItem } from "../types";
import { useAuth } from "./AuthContext";

interface CartContextValue {
  items: CartItem[];
  total: number;
  count: number;
  loading: boolean;
  addToCart: (bookId: string, quantity?: number) => Promise<void>;
  updateQuantity: (bookId: string, quantity: number) => Promise<void>;
  removeFromCart: (bookId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setItems(data.items);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  async function addToCart(bookId: string, quantity = 1) {
    try {
      await api.post("/cart", { bookId, quantity });
      await refreshCart();
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }

  async function updateQuantity(bookId: string, quantity: number) {
    try {
      await api.put(`/cart/${bookId}`, { quantity });
      await refreshCart();
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }

  async function removeFromCart(bookId: string) {
    await api.delete(`/cart/${bookId}`);
    await refreshCart();
  }

  async function clearCart() {
    await api.delete("/cart");
    await refreshCart();
  }

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, total, count, loading, addToCart, updateQuantity, removeFromCart, clearCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
