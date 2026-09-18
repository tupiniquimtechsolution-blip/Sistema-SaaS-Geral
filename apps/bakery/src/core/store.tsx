/* ============================================================
   ESTADO GLOBAL — carrinho, pedidos, admin overrides, toasts
   Persistência local por tenant (multi-tenant ready).
   ============================================================ */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AdminOverrides, BusinessConfig, CartItem, Order, Product } from "../business/types";
import { businessConfig } from "../business/config";
import { products as catalog } from "../business/products";
import { applyTheme } from "./theme";
import { cartItemTotal, cartItemUnit, track, uid } from "./utils";

interface Toast { id: string; message: string; tone?: "default" | "success" }

interface AppState {
  business: BusinessConfig;
  products: Product[];
  getProduct: (slug: string) => Product | undefined;
  cart: CartItem[];
  cartCount: number;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  addToCart: (item: Omit<CartItem, "key">) => void;
  updateQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  setItemNote: (key: string, note: string) => void;
  clearCart: () => void;
  subtotal: number;
  coupon: { code: string; value: number } | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  cartBump: number;
  orders: Order[];
  createOrder: (order: Omit<Order, "code" | "createdAt" | "status">) => Order;
  admin: AdminOverrides;
  setAdmin: (patch: Partial<AdminOverrides>) => void;
  resetAdmin: () => void;
  toasts: Toast[];
  notify: (message: string, tone?: Toast["tone"]) => void;
  flySignal: { from: DOMRect; id: string } | null;
  registerFly: (from: DOMRect) => void;
}

const Ctx = createContext<AppState | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage indisponível — segue sem persistir */
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const tenant = businessConfig.tenantId;

  const [cart, setCart] = useState<CartItem[]>(() => load(`${tenant}.cart`, []));
  const [coupon, setCoupon] = useState<{ code: string; value: number } | null>(() =>
    load(`${tenant}.coupon`, null)
  );
  const [orders, setOrders] = useState<Order[]>(() => load(`${tenant}.orders`, []));
  const [admin, setAdminState] = useState<AdminOverrides>(() => load(`${tenant}.admin`, {}));
  const [cartOpen, setCartOpen] = useState(false);
  const [cartBump, setCartBump] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [flySignal, setFlySignal] = useState<{ from: DOMRect; id: string } | null>(null);

  useEffect(() => save(`${tenant}.cart`, cart), [cart, tenant]);
  useEffect(() => save(`${tenant}.coupon`, coupon), [coupon, tenant]);
  useEffect(() => save(`${tenant}.orders`, orders), [orders, tenant]);
  useEffect(() => save(`${tenant}.admin`, admin), [admin, tenant]);

  /* ---------- Config mesclada com overrides do admin ---------- */
  const business = useMemo<BusinessConfig>(() => {
    const b: BusinessConfig = JSON.parse(JSON.stringify(businessConfig));
    if (admin.name) b.name = admin.name;
    if (admin.tagline) b.tagline = admin.tagline;
    if (admin.announcement !== undefined) b.announcement = admin.announcement;
    if (admin.whatsapp) {
      b.contact.whatsapp = admin.whatsapp;
      b.integrations.whatsapp.number = admin.whatsapp;
    }
    if (admin.integrations) {
      if (admin.integrations.whatsapp !== undefined) b.integrations.whatsapp.enabled = admin.integrations.whatsapp;
      if (admin.integrations.ifood !== undefined) b.integrations.ifood.enabled = admin.integrations.ifood;
      if (admin.integrations.ifoodUrl) b.integrations.ifood.url = admin.integrations.ifoodUrl;
      if (admin.integrations.keeta !== undefined) b.integrations.keeta.enabled = admin.integrations.keeta;
      if (admin.integrations.food99 !== undefined) b.integrations.food99.enabled = admin.integrations.food99;
    }
    if (admin.palette) b.branding.palette = admin.palette;
    return b;
  }, [admin]);

  /* ---------- Tema dinâmico ---------- */
  useEffect(() => {
    applyTheme(business.branding.palette, {
      headingFont: business.branding.headingFont,
      bodyFont: business.branding.bodyFont,
    });
  }, [business]);

  /* ---------- Catálogo com overrides ---------- */
  const products = useMemo<Product[]>(
    () =>
      catalog.map((p) => {
        const ov = admin.products?.[p.id];
        if (!ov) return p;
        return {
          ...p,
          available: ov.available ?? p.available,
          price: ov.price ?? p.price,
          promotionalPrice: ov.promotionalPrice !== undefined ? (ov.promotionalPrice ?? undefined) : p.promotionalPrice,
        };
      }),
    [admin.products]
  );

  const getProduct = useCallback((slug: string) => products.find((p) => p.slug === slug), [products]);

  /* ---------- Toasts ---------- */
  const notify = useCallback((message: string, tone: Toast["tone"] = "default") => {
    const id = uid();
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  /* ---------- Carrinho ---------- */
  const addToCart = useCallback(
    (item: Omit<CartItem, "key">) => {
      setCart((prev) => {
        const same = prev.find(
          (i) =>
            i.productId === item.productId &&
            JSON.stringify(i.variations) === JSON.stringify(item.variations) &&
            JSON.stringify(i.extras) === JSON.stringify(item.extras) &&
            (i.note ?? "") === (item.note ?? "")
        );
        if (same) {
          return prev.map((i) => (i.key === same.key ? { ...i, qty: i.qty + item.qty } : i));
        }
        return [...prev, { ...item, key: uid() }];
      });
      setCartBump((b) => b + 1);
      track("add_to_cart", { product: item.name, qty: item.qty, price: cartItemUnit(item as CartItem) });
      notify(`${item.name} no carrinho`, "success");
    },
    [notify]
  );

  const updateQty = useCallback((key: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.key !== key));
      track("remove_from_cart", { key });
      return;
    }
    setCart((prev) => prev.map((i) => (i.key === key ? { ...i, qty } : i)));
  }, []);

  const removeItem = useCallback((key: string) => {
    setCart((prev) => prev.filter((i) => i.key !== key));
    track("remove_from_cart", { key });
  }, []);

  const setItemNote = useCallback((key: string, note: string) => {
    setCart((prev) => prev.map((i) => (i.key === key ? { ...i, note } : i)));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCoupon(null);
  }, []);

  const applyCoupon = useCallback(
    (code: string) => {
      const found = business.coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
      if (!found) return false;
      setCoupon({ code: found.code, value: found.value });
      notify(`Cupom ${found.code} aplicado`, "success");
      return true;
    },
    [business.coupons, notify]
  );

  const removeCoupon = useCallback(() => setCoupon(null), []);

  const subtotal = useMemo(() => cart.reduce((s, i) => s + cartItemTotal(i), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  /* ---------- Pedidos ---------- */
  const createOrder = useCallback((order: Omit<Order, "code" | "createdAt" | "status">) => {
    const full: Order = {
      ...order,
      code: `FO-${String(Date.now()).slice(-6)}`,
      createdAt: new Date().toISOString(),
      status: "Novo",
    };
    setOrders((prev) => [full, ...prev]);
    track("purchase", { code: full.code, total: full.total, fulfillment: full.fulfillment });
    return full;
  }, []);

  /* ---------- Admin ---------- */
  const setAdmin = useCallback((patch: Partial<AdminOverrides>) => {
    setAdminState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetAdmin = useCallback(() => {
    setAdminState({});
    notify("Configurações restauradas", "success");
  }, [notify]);

  /* ---------- Fly to cart ---------- */
  const registerFly = useCallback((from: DOMRect) => {
    setFlySignal({ from, id: uid() });
  }, []);

  const value: AppState = {
    business,
    products,
    getProduct,
    cart,
    cartCount,
    cartOpen,
    setCartOpen,
    addToCart,
    updateQty,
    removeItem,
    setItemNote,
    clearCart,
    subtotal,
    coupon,
    applyCoupon,
    removeCoupon,
    cartBump,
    orders,
    createOrder,
    admin,
    setAdmin,
    resetAdmin,
    toasts,
    notify,
    flySignal,
    registerFly,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}

/* Hook utilitário: totals com desconto e frete */
export function useCartTotals() {
  const { cart, subtotal, coupon, business } = useApp();
  return useMemo(() => {
    const discount = coupon
      ? Math.min(
          subtotal,
          business.coupons.find((c) => c.code === coupon.code)?.type === "percent"
            ? (subtotal * coupon.value) / 100
            : coupon.value
        )
      : 0;
    const afterDiscount = subtotal - discount;
    const fee =
      business.delivery.enabled && subtotal > 0
        ? afterDiscount >= business.delivery.freeAbove
          ? 0
          : business.delivery.fee
        : 0;
    const total = afterDiscount + fee;
    return { discount, fee, total, count: cart.reduce((s, i) => s + i.qty, 0) };
  }, [cart, subtotal, coupon, business]);
}

export function useFlyTarget() {
  const targetRef = useRef<HTMLButtonElement | null>(null);
  return targetRef;
}
