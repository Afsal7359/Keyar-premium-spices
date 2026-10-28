import { supabase, isSupabaseConfigured } from './supabase';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_ORDERS, INITIAL_REVIEWS } from './mock-data';
import { Product, Coupon, Order, Review, SiteSettings } from '@/types';

const STORAGE_KEYS = {
  PRODUCTS: 'keyaar_products_v1',
  COUPONS: 'keyaar_coupons_v1',
  ORDERS: 'keyaar_orders_v1',
  REVIEWS: 'keyaar_reviews_v1',
  SITE_SETTINGS: 'keyaar_site_settings_v1',
};

// Safe LocalStorage helpers
function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading localStorage ${key}:`, e);
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing localStorage ${key}:`, e);
  }
}

// ---------------- PRODUCTS ----------------
export async function getProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch (err) {
      console.warn('Supabase fetch products error, using fallback:', err);
    }
  }

  // Fallback to local storage or initial seed
  return getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        return data as Product;
      }
    } catch (err) {
      console.warn('Supabase getProductBySlug error, using fallback:', err);
    }
  }

  const products = await getProducts();
  return products.find((p) => p.slug === slug) || null;
}

export async function saveProduct(product: Partial<Product>): Promise<Product> {
  const isNew = !product.id;
  const newProduct: Product = {
    id: product.id || `prod-${Date.now()}`,
    name: product.name || 'Untitled Spice',
    slug: product.slug || (product.name ? product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `spice-${Date.now()}`),
    scientific_name: product.scientific_name || '',
    short_description: product.short_description || '',
    description: product.description || '',
    category: product.category || 'Whole Spices',
    origin: product.origin || 'Kerala, India',
    grade: product.grade || 'Grade A+ Bold',
    harvest_year: product.harvest_year || '2026 Reserve',
    aroma_notes: product.aroma_notes || ['Warm', 'Aromatic'],
    sizes_prices: product.sizes_prices || [
      { size: '50g', price: 250, stock: 50 },
      { size: '100g', price: 450, stock: 50 },
      { size: '250g', price: 1000, stock: 25 },
      { size: '500g', price: 1900, stock: 15 },
      { size: '1kg', price: 3600, stock: 10 },
    ],
    images: product.images && product.images.length > 0 ? product.images : ['/images/spices/cardamom.jpg'],
    is_featured: product.is_featured ?? true,
    stock_status: product.stock_status || 'In Stock',
    rating: product.rating || 5.0,
    review_count: product.review_count || 0,
    created_at: product.created_at || new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      if (isNew) {
        const { data, error } = await supabase.from('products').insert([newProduct]).select().single();
        if (!error && data) return data as Product;
      } else {
        const { data, error } = await supabase.from('products').update(newProduct).eq('id', newProduct.id).select().single();
        if (!error && data) return data as Product;
      }
    } catch (err) {
      console.warn('Supabase saveProduct error, falling back to local storage:', err);
    }
  }

  // Update local storage
  const current = getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const index = current.findIndex((p) => p.id === newProduct.id);
  if (index >= 0) {
    current[index] = newProduct;
  } else {
    current.unshift(newProduct);
  }
  setLocalItem(STORAGE_KEYS.PRODUCTS, current);

  return newProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase deleteProduct error, falling back to local storage:', err);
    }
  }

  const current = getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updated = current.filter((p) => p.id !== id);
  setLocalItem(STORAGE_KEYS.PRODUCTS, updated);
  return true;
}

// ---------------- COUPONS ----------------
export async function getCoupons(): Promise<Coupon[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as Coupon[];
    } catch (err) {
      console.warn('Supabase getCoupons error:', err);
    }
  }
  return getLocalItem<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
}

export async function validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; coupon?: Coupon; discount: number; message: string }> {
  const cleanCode = code.trim().toUpperCase();
  const coupons = await getCoupons();
  const coupon = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.is_active);

  if (!coupon) {
    return { valid: false, discount: 0, message: 'Invalid or expired coupon code' };
  }

  if (subtotal < coupon.min_order_value) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum order value of ₹${coupon.min_order_value} required for coupon ${coupon.code}`,
    };
  }

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (subtotal * coupon.discount_value) / 100;
  } else {
    discount = Math.min(coupon.discount_value, subtotal);
  }

  return {
    valid: true,
    coupon,
    discount: Math.round(discount * 100) / 100,
    message: `Coupon ${coupon.code} applied successfully!`,
  };
}

export async function saveCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
  const newCoupon: Coupon = {
    id: coupon.id || `c-${Date.now()}`,
    code: coupon.code?.toUpperCase().trim() || `SAVE${Date.now()}`,
    discount_type: coupon.discount_type || 'percentage',
    discount_value: coupon.discount_value || 10,
    min_order_value: coupon.min_order_value || 0,
    is_active: coupon.is_active ?? true,
    usage_count: coupon.usage_count || 0,
    expires_at: coupon.expires_at,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('coupons').insert([newCoupon]).select().single();
      if (!error && data) return data as Coupon;
    } catch (err) {
      console.warn('Supabase saveCoupon error:', err);
    }
  }

  const current = getLocalItem<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  current.unshift(newCoupon);
  setLocalItem(STORAGE_KEYS.COUPONS, current);
  return newCoupon;
}

// ---------------- ORDERS ----------------
export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as Order[];
    } catch (err) {
      console.warn('Supabase getOrders error:', err);
    }
  }
  return getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (!error && data) return data as Order;
    } catch (err) {
      console.warn('Supabase getOrderById error:', err);
    }
  }

  const orders = await getOrders();
  return orders.find((o) => o.id === id) || null;
}

export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  const newOrder: Order = {
    id: orderData.id || `KYR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    customer_name: orderData.customer_name || 'Valued Customer',
    customer_email: orderData.customer_email || '',
    customer_phone: orderData.customer_phone || '',
    shipping_address: orderData.shipping_address || {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    items: orderData.items || [],
    subtotal: orderData.subtotal || 0,
    discount: orderData.discount || 0,
    coupon_code: orderData.coupon_code || '',
    shipping_fee: orderData.shipping_fee || 0,
    tax: orderData.tax || 0,
    total: orderData.total || 0,
    payment_method: orderData.payment_method || 'razorpay',
    payment_status: orderData.payment_status || 'paid',
    razorpay_order_id: orderData.razorpay_order_id,
    razorpay_payment_id: orderData.razorpay_payment_id,
    order_status: 'Processing',
    tracking_number: `KEYAAR-${Math.floor(10000000 + Math.random() * 90000000)}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('orders').insert([newOrder]).select().single();
      if (!error && data) return data as Order;
    } catch (err) {
      console.warn('Supabase createOrder error, falling back to local storage:', err);
    }
  }

  const current = getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  current.unshift(newOrder);
  setLocalItem(STORAGE_KEYS.ORDERS, current);

  return newOrder;
}

export async function updateOrderStatus(orderId: string, status: Order['order_status']): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('orders').update({ order_status: status }).eq('id', orderId);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase updateOrderStatus error:', err);
    }
  }

  const current = getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const order = current.find((o) => o.id === orderId);
  if (order) {
    order.order_status = status;
    setLocalItem(STORAGE_KEYS.ORDERS, current);
    return true;
  }
  return false;
}

// ---------------- REVIEWS ----------------
export async function getReviews(productSlug: string): Promise<Review[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_slug', productSlug)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as Review[];
    } catch (err) {
      console.warn('Supabase getReviews error:', err);
    }
  }

  const allReviews = getLocalItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  return allReviews.filter((r) => r.product_slug === productSlug);
}

export async function addReview(review: Partial<Review>): Promise<Review> {
  const newReview: Review = {
    id: review.id || `rev-${Date.now()}`,
    product_slug: review.product_slug || '',
    author_name: review.author_name || 'Anonymous Epicurean',
    rating: review.rating || 5,
    title: review.title || '',
    comment: review.comment || '',
    verified: true,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('reviews').insert([newReview]).select().single();
      if (!error && data) return data as Review;
    } catch (err) {
      console.warn('Supabase addReview error:', err);
    }
  }

  const current = getLocalItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  current.unshift(newReview);
  setLocalItem(STORAGE_KEYS.REVIEWS, current);
  return newReview;
}

// ---------------- ORDERS (DELETE / FULL UPDATE) ----------------
export async function deleteOrder(orderId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase deleteOrder error:', err);
    }
  }

  const current = getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const updated = current.filter((o) => o.id !== orderId);
  setLocalItem(STORAGE_KEYS.ORDERS, updated);
  return true;
}

// ---------------- SITE SETTINGS & CONTENT CMS ----------------
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcement_bar: 'Complimentary Nitrogen-Shield Freshness Pouch on all orders across India',
  free_shipping_threshold: 999,
  hero_badge: 'Direct Terroir Sourcing • Kerala, India',
  hero_title: 'Single-Origin Whole Spices, Graded by Hand & Sealed Fresh',
  hero_subtitle: 'We source exclusively from micro-plantations in the High Ranges of Kerala. Each spice is harvested mature, cold-graded, and hermetically sealed to preserve volatile essential oils.',
  contact_email: 'concierge@keyaarspices.com',
  contact_phone: '+91 98470 12345',
  contact_address: 'Keyaar Plantations, Vandanmedu, Idukki District, Kerala 685551',
  craft_step_1_title: 'Picked Ripe',
  craft_step_1_desc: 'Pods, berries and buds are harvested exclusively when their essential oils and terpenes are at absolute seasonal saturation.',
  craft_step_2_title: 'Graded by Eye & Sieve',
  craft_step_2_desc: 'Every batch is mechanically vibrated through calibrated sieves (e.g. 8mm+ for cardamom) then visually inspected by heritage graders.',
  craft_step_3_title: 'Sun-Dried & Flushed',
  craft_step_3_desc: 'Slowly dried at regulated moisture levels and sealed with pure food-grade nitrogen to eliminate volatile oxidation.',
  craft_step_4_title: 'Direct from Kerala',
  craft_step_4_desc: 'No middle auctions, no sitting in damp warehouses for months. Dispatched straight from estate packing houses to your door.',
};

export async function getSiteSettings(): Promise<SiteSettings> {
  return getLocalItem<SiteSettings>(STORAGE_KEYS.SITE_SETTINGS, DEFAULT_SITE_SETTINGS);
}

export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const updated: SiteSettings = { ...current, ...settings };
  setLocalItem(STORAGE_KEYS.SITE_SETTINGS, updated);
  return updated;
}

