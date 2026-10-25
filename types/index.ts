export type PackSize = '50g' | '100g' | '250g' | '500g' | '1kg';

export interface SizePriceOption {
  size: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  scientific_name?: string;
  description: string;
  short_description?: string;
  category: string;
  origin: string;
  grade: string;
  harvest_year: string;
  aroma_notes: string[];
  sizes_prices: SizePriceOption[];
  images: string[];
  is_featured: boolean;
  stock_status?: string;
  rating: number;
  review_count: number;
  created_at?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  is_active: boolean;
  usage_count?: number;
  expires_at?: string;
}

export interface ShippingAddress {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  discount: number;
  coupon_code?: string;
  shipping_fee: number;
  tax: number;
  total: number;
  payment_method: 'razorpay' | 'cod';
  payment_status: 'pending' | 'paid' | 'failed';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  order_status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  tracking_number?: string;
  created_at: string;
}

export interface Review {
  id: string;
  product_slug: string;
  author_name: string;
  rating: number;
  title?: string;
  comment: string;
  verified: boolean;
  created_at: string;
}
