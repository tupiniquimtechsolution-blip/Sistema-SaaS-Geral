import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getItemById, getExtrasPrice } from "../config/menu";

export interface CartLine {
  key: string;
  itemId: string;
  qty: number;
  extras: string[];
  note?: string;
}

interface CartApi {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  add: (itemId: string, extras?: string[], note?: string, qty?: number) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartApi | null>(null);
const STORAGE_KEY = "portoblack.cart.v1";

function loadCart(): CartLine[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed.filter((l) => getItemById(l.itemId)) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadCart);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* armazenamento indisponível — segue sem persistência */
    }
  }, [lines]);

  const add = useCallback((itemId: string, extras: string[] = [], note?: string, qty = 1) => {
    const key = `${itemId}|${[...extras].sort().join("+")}`;
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, qty: Math.min(l.qty + qty, 20) } : l));
      }
      return [...prev, { key, itemId, qty, extras, note }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, 20) } : l)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const { count, subtotal } = useMemo(() => {
    let c = 0;
    let s = 0;
    for (const line of lines) {
      const item = getItemById(line.itemId);
      if (!item) continue;
      c += line.qty;
      s += (item.price + getExtrasPrice(item, line.extras)) * line.qty;
    }
    return { count: c, subtotal: s };
  }, [lines]);

  const value = useMemo(
    () => ({ lines, count, subtotal, isOpen, setOpen, add, remove, setQty, clear }),
    [lines, count, subtotal, isOpen, add, remove, setQty, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
