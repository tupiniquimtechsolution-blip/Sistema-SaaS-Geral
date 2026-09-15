import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Machine } from "../data/machines";

const FAVS_KEY = "tf:favs";
const CMP_KEY = "tf:cmp";
const MAX_COMPARE = 3;

function load(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

interface AppState {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  compare: string[];
  inCompare: (id: string) => boolean;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  compareOpen: boolean;
  setCompareOpen: (v: boolean) => void;
  quoteMachine: Machine | null;
  quoteLabel: string;
  openQuote: (m: Machine | null, label?: string) => void;
  closeQuote: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => load(FAVS_KEY));
  const [compare, setCompare] = useState<string[]>(() => load(CMP_KEY));
  const [compareOpen, setCompareOpen] = useState(false);
  const [quoteMachine, setQuoteMachine] = useState<Machine | null>(null);
  const [quoteLabel, setQuoteLabel] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(FAVS_KEY, JSON.stringify(favorites));
    } catch {
      /* storage indisponível — segue sem persistir */
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(CMP_KEY, JSON.stringify(compare));
    } catch {
      /* noop */
    }
  }, [compare]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setCompare((c) => {
      if (c.includes(id)) return c.filter((x) => x !== id);
      if (c.length >= MAX_COMPARE) return [...c.slice(1), id];
      return [...c, id];
    });
  }, []);

  const value = useMemo<AppState>(
    () => ({
      favorites,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite,
      compare,
      inCompare: (id) => compare.includes(id),
      toggleCompare,
      clearCompare: () => setCompare([]),
      compareOpen,
      setCompareOpen,
      quoteMachine,
      quoteLabel,
      openQuote: (m, label) => {
        setQuoteMachine(m);
        setQuoteLabel(label ?? (m ? `${m.model} — ${m.brand} (${m.code})` : ""));
      },
      closeQuote: () => {
        setQuoteMachine(null);
        setQuoteLabel("");
      },
    }),
    [favorites, compare, compareOpen, quoteMachine, quoteLabel, toggleFavorite, toggleCompare],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp deve ser usado dentro de <AppProvider>");
  return ctx;
}
