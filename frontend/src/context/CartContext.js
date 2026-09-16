import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { track } from '../components/site/Pixels';
import { trackCart } from '../lib/api';

const CartContext = createContext(null);
const STORAGE_KEY = 'cs_cart';
const EMAIL_KEY = 'sculptiva_email';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const syncTimer = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const email = localStorage.getItem(EMAIL_KEY);
    if (!email) return;
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      trackCart(email, items.map((i) => ({
        handle: i.handle, title: i.title, price: i.price, qty: i.qty,
        image: i.image || null, size: i.size || null, colour: i.colour || null,
      }))).catch(() => {});
    }, 2000);
    return () => clearTimeout(syncTimer.current);
  }, [items]);

  const addItem = (product, size, qty = 1, colour = null) => {
    track('AddToCart', {
      content_ids: [product.handle],
      content_name: product.title,
      content_type: 'product',
      value: (product.price || 0) * qty,
      currency: product.currency || 'GBP',
    });
    const key = `${product.handle}-${size}-${colour || ''}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...prev,
        {
          key,
          handle: product.handle,
          title: product.title,
          price: product.price,
          image: product.images?.[0],
          size,
          colour,
          qty,
          variant_id: product.variant_id || null,
        },
      ];
    });
    setDrawerOpen(true);
  };

  const updateQty = (key, qty) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.key !== key));
    } else {
      setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty } : i)));
    }
  };

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));

  const { count, subtotal } = useMemo(() => {
    return {
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: items.reduce((s, i) => s + i.qty * i.price, 0),
    };
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQty, removeItem, count, subtotal, drawerOpen, setDrawerOpen }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
