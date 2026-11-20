'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type DeliveryType = 'standard' | 'window' | 'exact' | 'courier';

export interface CartItem {
  key: string;
  slug: string;
  name: string;
  image: string;
  variantId: string;
  tier: string;
  unitPriceCents: number;
  quantity: number;
  addons: string[];
  cardMessage: string;
}

export interface DeliveryHint {
  postcode: string;
  date: string;
  type: DeliveryType;
  slot?: string;
}

interface CartState {
  items: CartItem[];
  delivery: DeliveryHint | null;
}

interface CartApi extends CartState {
  count: number;
  add: (item: Omit<CartItem, 'key'>) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  setDelivery: (delivery: DeliveryHint | null) => void;
  clear: () => void;
}

const STORAGE_KEY = 'rf-cart';
const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({ items: [], delivery: null });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as CartState);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const add = useCallback((item: Omit<CartItem, 'key'>) => {
    setState((s) => ({
      ...s,
      items: [...s.items, { ...item, key: `${item.variantId}-${Date.now()}` }],
    }));
  }, []);
  const remove = useCallback(
    (key: string) => setState((s) => ({ ...s, items: s.items.filter((i) => i.key !== key) })),
    [],
  );
  const setQuantity = useCallback(
    (key: string, quantity: number) =>
      setState((s) => ({
        ...s,
        items: s.items.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, quantity) } : i)),
      })),
    [],
  );
  const setDelivery = useCallback(
    (delivery: DeliveryHint | null) => setState((s) => ({ ...s, delivery })),
    [],
  );
  const clear = useCallback(() => setState({ items: [], delivery: null }), []);

  const value = useMemo<CartApi>(
    () => ({
      ...state,
      count: state.items.reduce((n, i) => n + i.quantity, 0),
      add,
      remove,
      setQuantity,
      setDelivery,
      clear,
    }),
    [state, add, remove, setQuantity, setDelivery, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
