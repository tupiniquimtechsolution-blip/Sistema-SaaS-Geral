import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import type { ReactNode } from "react";
import { business, priceOf, variationLabel } from "../config/business";
import type { Coupon, Product } from "../config/business";

/* ================= ANALYTICS ================= */
type AnalyticsEvent =
  | "view_product" | "add_to_cart" | "remove_from_cart" | "begin_checkout"
  | "purchase" | "book_service" | "click_whatsapp" | "view_service"
  | "search" | "reorder" | "view_location" | "apply_coupon" | "pet_created";

export function track(event: AnalyticsEvent, data?: Record<string, unknown>) {
  const payload = { event, ...data, ts: Date.now() };
  (window as unknown as { dataLayer?: unknown[] }).dataLayer = (
    (window as unknown as { dataLayer?: unknown[] }).dataLayer ?? []
  ).concat(payload);
  if (import.meta.env.DEV) console.debug("[amora:track]", payload);
}

/* ================= FORMATADORES ================= */
export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const whatsLink = (phone: string, message: string) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

export function buildOrderWhatsApp(lines: { name: string; variation?: string | null; qty: number; total: number }[], total: number, fulfillment: string, customerName: string, notes: string) {
  const items = lines
    .map((l) => `${l.qty}x ${l.name}${l.variation ? ` (${l.variation})` : ""} — ${brl(l.total)}`)
    .join("\n");
  return `Olá! Gostaria de fazer um pedido na ${business.name}. 🐾\n\nProdutos:\n${items}\n\nTotal estimado: ${brl(total)}\n\n${fulfillment}\n\nNome: ${customerName}\n\nObservações: ${notes || "—"}`;
}

export function buildBookingWhatsApp(petName: string, serviceName: string, date: string, time: string, professional: string, notes: string) {
  return `Olá! Gostaria de confirmar um agendamento na ${business.name}. 🐾\n\nPet: ${petName}\nServiço: ${serviceName}\nData: ${date}\nHorário: ${time}\nProfissional: ${professional}\n\nObservações: ${notes || "—"}`;
}

/* ================= HORÁRIOS ================= */
const DAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

export function openStatus(): { open: boolean; label: string } {
  const loc = business.locations[0];
  const now = new Date();
  const today = loc.hours[now.getDay()];
  if (today) {
    const [oh, om] = today.open.split(":").map(Number);
    const [ch, cm] = today.close.split(":").map(Number);
    const mins = now.getHours() * 60 + now.getMinutes();
    if (mins >= oh * 60 + om && mins < ch * 60 + cm) return { open: true, label: "Aberto agora" };
    if (mins < oh * 60 + om) return { open: false, label: `Abre hoje às ${today.open}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (now.getDay() + i) % 7;
    const h = loc.hours[d];
    if (h) {
      const when = i === 1 ? "amanhã" : DAYS[d];
      return { open: false, label: `Abre ${when} às ${h.open}` };
    }
  }
  return { open: false, label: "Horários sob consulta" };
}

/* ================= TIPOS DE ESTADO ================= */
export interface CartLine {
  productId: string;
  variationId?: string;
  qty: number;
}
export interface Pet {
  id: string;
  name: string;
  species: "caes" | "gatos";
  breed: string;
  birthDate: string;
  sex: "macho" | "femea";
  weight: string;
  size: "P" | "M" | "G";
  notes: string;
  photo?: string;
  createdAt: number;
}
export type OrderStatus = "novo" | "confirmado" | "separando" | "pronto" | "entrega" | "entregue" | "cancelado";
export interface Order {
  id: string;
  createdAt: number;
  lines: CartLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon?: string;
  fulfillment: "delivery" | "pickup";
  address?: string;
  locationId?: string;
  customer: { name: string; phone: string };
  payment: "pix" | "cartao" | "loja";
  status: OrderStatus;
}
export type BookingStatus = "requested" | "confirmed" | "in_progress" | "completed" | "cancelled";
export interface Booking {
  id: string;
  createdAt: number;
  petId: string;
  petName: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string;
  professional: string;
  size: "P" | "M" | "G";
  price: number;
  notes: string;
  status: BookingStatus;
}

interface AppState {
  cart: CartLine[];
  pets: Pet[];
  orders: Order[];
  bookings: Booking[];
  coupon: Coupon | null;
  customer: { name: string; phone: string; cep: string; address: string; complement: string; reference: string };
  loyaltyPoints: number;
  cartOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  addToCart: (p: Product, variationId?: string, qty?: number, flyFrom?: HTMLElement | null) => void;
  setQty: (productId: string, variationId: string | undefined, qty: number) => void;
  removeLine: (productId: string, variationId?: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  saveCustomer: (c: Partial<AppState["customer"]>) => void;
  savePet: (p: Pet) => void;
  removePet: (id: string) => void;
  placeOrder: (o: Omit<Order, "id" | "createdAt" | "status">) => Order;
  addBooking: (b: Omit<Booking, "id" | "createdAt" | "status">) => Booking;
  cancelBooking: (id: string) => void;
  reorder: (orderId: string) => void;
  totals: {
    subtotal: number; discount: number; shipping: number; total: number; count: number;
    lines: { line: CartLine; product: Product; variation?: string | null; unit: number; total: number }[];
  };
  toast: (t: { title: string; desc?: string; actionLabel?: string; href?: string }) => void;
  toasts: { id: number; title: string; desc?: string; actionLabel?: string; href?: string }[];
}

const Ctx = createContext<AppState | null>(null);
const LS_KEY = "amorapet.state.v1";

function loadPersisted() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as {
      cart: CartLine[]; pets: Pet[]; orders: Order[]; bookings: Booking[];
      coupon: Coupon | null; customer: AppState["customer"]; loyaltyPoints: number;
    };
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const persisted = useMemo(loadPersisted, []);
  const [cart, setCart] = useState<CartLine[]>(persisted?.cart ?? []);
  const [pets, setPets] = useState<Pet[]>(persisted?.pets ?? []);
  const [orders, setOrders] = useState<Order[]>(persisted?.orders ?? []);
  const [bookings, setBookings] = useState<Booking[]>(persisted?.bookings ?? []);
  const [coupon, setCoupon] = useState<Coupon | null>(persisted?.coupon ?? null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(persisted?.loyaltyPoints ?? 0);
  const [customer, setCustomer] = useState<AppState["customer"]>(
    persisted?.customer ?? { name: "", phone: "", cep: "", address: "", complement: "", reference: "" }
  );
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<AppState["toasts"]>([]);

  useEffect(() => {
    const data = { cart, pets, orders, bookings, coupon, customer, loyaltyPoints };
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch { /* storage cheio/offline */ }
  }, [cart, pets, orders, bookings, coupon, customer, loyaltyPoints]);

  const toast = useCallback((t: { title: string; desc?: string; actionLabel?: string; href?: string }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, ...t }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  const totals = useMemo(() => {
    const lines = cart.flatMap((line) => {
      const product = business.products.find((p) => p.id === line.productId);
      if (!product) return [];
      const variation = variationLabel(product, line.variationId);
      const unit = priceOf(product, line.variationId);
      return [{ line, product, variation, unit, total: unit * line.qty }];
    });
    const subtotal = lines.reduce((acc, l) => acc + l.total, 0);
    let discount = 0;
    if (coupon?.kind === "percent") discount = (subtotal * coupon.value) / 100;
    if (coupon?.kind === "amount" && subtotal >= 150) discount = coupon.value;
    const afterDiscount = subtotal - discount;
    const freeShip = (coupon?.kind === "freeship") || afterDiscount >= business.delivery.freeAbove;
    const shipping = lines.length === 0 ? 0 : freeShip ? 0 : business.delivery.fee;
    const count = lines.reduce((acc, l) => acc + l.line.qty, 0);
    return { subtotal, discount, shipping, total: afterDiscount + shipping, count, lines };
  }, [cart, coupon]);

  const flyToCart = useCallback((from?: HTMLElement | null) => {
    if (!from) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = document.getElementById("cart-target");
    if (!target) return;
    const a = from.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const dot = document.createElement("div");
    dot.className = "fly-dot";
    dot.style.left = `${a.left + a.width / 2 - 8}px`;
    dot.style.top = `${a.top + a.height / 2 - 8}px`;
    document.body.appendChild(dot);
    requestAnimationFrame(() => {
      dot.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(0.25)`;
      dot.style.opacity = "0.25";
    });
    window.setTimeout(() => dot.remove(), 750);
  }, []);

  const addToCart = useCallback((p: Product, variationId?: string, qty = 1, flyFrom?: HTMLElement | null) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === p.id && l.variationId === variationId);
      if (existing) {
        return prev.map((l) => (l === existing ? { ...l, qty: Math.min(l.qty + qty, 99) } : l));
      }
      return [...prev, { productId: p.id, variationId, qty }];
    });
    flyToCart(flyFrom);
    track("add_to_cart", { product: p.slug, price: priceOf(p, variationId) });
    toast({ title: `${p.name} no carrinho`, actionLabel: "Ver carrinho", href: "/carrinho" });
  }, [flyToCart, toast]);

  const setQty = useCallback((productId: string, variationId: string | undefined, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.productId === productId && l.variationId === variationId))
        : prev.map((l) => (l.productId === productId && l.variationId === variationId ? { ...l, qty: Math.min(qty, 99) } : l))
    );
  }, []);

  const removeLine = useCallback((productId: string, variationId?: string) => {
    setCart((prev) => prev.filter((l) => !(l.productId === productId && l.variationId === variationId)));
    track("remove_from_cart", { product: productId });
  }, []);

  const clearCart = useCallback(() => { setCart([]); setCoupon(null); }, []);

  const applyCoupon = useCallback((code: string) => {
    const found = business.coupons.find((c) => c.code === code.trim().toUpperCase());
    if (found) {
      setCoupon(found);
      track("apply_coupon", { code: found.code });
      return true;
    }
    return false;
  }, []);

  const removeCoupon = useCallback(() => setCoupon(null), []);

  const saveCustomer = useCallback((c: Partial<AppState["customer"]>) => {
    setCustomer((prev) => ({ ...prev, ...c }));
  }, []);

  const savePet = useCallback((p: Pet) => {
    setPets((prev) => {
      const exists = prev.some((x) => x.id === p.id);
      return exists ? prev.map((x) => (x.id === p.id ? p : x)) : [...prev, p];
    });
    track("pet_created", { name: p.name });
  }, []);

  const removePet = useCallback((id: string) => {
    setPets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const placeOrder = useCallback((o: Omit<Order, "id" | "createdAt" | "status">) => {
    const order: Order = {
      ...o,
      id: `AM-${String(Math.floor(1000 + Math.random() * 9000))}`,
      createdAt: Date.now(),
      status: "novo",
    };
    setOrders((prev) => [order, ...prev]);
    setLoyaltyPoints((prev) => prev + Math.floor(order.total / 10));
    track("purchase", { order: order.id, total: order.total });
    return order;
  }, []);

  const addBooking = useCallback((b: Omit<Booking, "id" | "createdAt" | "status">) => {
    const booking: Booking = {
      ...b,
      id: `AG-${String(Math.floor(100 + Math.random() * 900))}`,
      createdAt: Date.now(),
      status: "requested",
    };
    setBookings((prev) => [booking, ...prev]);
    track("book_service", { service: b.serviceName, date: b.date });
    return booking;
  }, []);

  const cancelBooking = useCallback((id: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as BookingStatus } : b)));
  }, []);

  const reorder = useCallback((orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    setCart((prev) => {
      const next = [...prev];
      order.lines.forEach((line) => {
        const existing = next.find((l) => l.productId === line.productId && l.variationId === line.variationId);
        if (existing) existing.qty += line.qty;
        else next.push({ ...line });
      });
      return next;
    });
    track("reorder", { order: orderId });
    toast({ title: "Itens adicionados novamente", desc: "Seu pedido anterior voltou para o carrinho.", actionLabel: "Ver carrinho", href: "/carrinho" });
  }, [orders, toast]);

  const value: AppState = {
    cart, pets, orders, bookings, coupon, customer, loyaltyPoints,
    cartOpen, searchOpen, setCartOpen, setSearchOpen,
    addToCart, setQty, removeLine, clearCart, applyCoupon, removeCoupon,
    saveCustomer, savePet, removePet, placeOrder, addBooking, cancelBooking, reorder,
    totals, toast, toasts,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore precisa estar dentro de StoreProvider");
  return ctx;
}

/* ================= HOOKS DE MOVIMENTO ================= */
export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) { setInView(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${inView ? "is-in" : ""} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

export function useParallax(speed = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const off = (r.top + r.height / 2 - window.innerHeight / 2) * speed;
        el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => { window.removeEventListener("scroll", update); cancelAnimationFrame(raf); };
  }, [speed]);
  return ref;
}

/* ================= SEO POR PÁGINA ================= */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }
  }, [title, description]);
}

export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatDateBR(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}
