'use client';

import React, { createContext, useContext, useState, useEffect, useSyncExternalStore } from 'react';
import { CartItem, Product, Coupon } from '@/types';
import { validateCoupon } from '@/lib/db';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: string, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  shippingFee: number;
  tax: number;
  grandTotal: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'keyaar_cart_items_v1';
const COUPON_STORAGE_KEY = 'keyaar_cart_coupon_v1';
const WISHLIST_STORAGE_KEY = 'keyaar_wishlist_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Load from local storage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) setItems(JSON.parse(storedCart));

        const storedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
        if (storedCoupon) setAppliedCoupon(JSON.parse(storedCoupon));

        const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
      } catch (e) {
        console.warn('Error loading cart state from localStorage:', e);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Error saving cart to localStorage:', e);
    }
  }, [items, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Error saving coupon to localStorage:', e);
    }
  }, [appliedCoupon, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Error saving wishlist to localStorage:', e);
    }
  }, [wishlist, isMounted]);

  const addItem = (product: Product, size: string, quantity = 1) => {
    const sizeOption = product.sizes_prices.find((s) => s.size === size) || product.sizes_prices[0];
    const itemId = `${product.id}-${size}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          size: sizeOption.size,
          price: sizeOption.price,
          quantity,
          image: product.images[0] || '/images/spices/cardamom.jpg',
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Calculations
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const freeShippingThreshold = 999;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;

  let discount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (subtotal >= appliedCoupon.min_order_value) {
      if (appliedCoupon.discount_type === 'percentage') {
        discount = Math.round(((subtotal * appliedCoupon.discount_value) / 100) * 100) / 100;
      } else {
        discount = Math.min(appliedCoupon.discount_value, subtotal);
      }
    }
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * 0.05 * 100) / 100; // 5% GST
  const grandTotal = Math.round((taxableAmount + tax + shippingFee) * 100) / 100;

  const applyCoupon = async (code: string) => {
    if (!code.trim()) {
      return { success: false, message: 'Please enter a coupon code' };
    }
    const result = await validateCoupon(code, subtotal);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        totalItems,
        subtotal,
        discount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        shippingFee,
        tax,
        grandTotal,
        freeShippingThreshold,
        freeShippingRemaining,
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
