'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  ShoppingBag,
  Tag,
  Plus,
  Trash2,
  Check,
  ExternalLink,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { Product, Order, Coupon, SizePriceOption } from '@/types';
import {
  getProducts,
  saveProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  getCoupons,
  saveCoupon,
} from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'coupons'>('overview');

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    scientific_name: '',
    short_description: '',
    description: '',
    category: 'Whole Spices',
    origin: 'Idukki, Kerala',
    grade: 'Grade A+ Super Bold',
    harvest_year: '2026 Reserve',
    aroma_notes_str: 'Citrus, Eucalyptus, Sweet',
    imageUrl: '/images/spices/cardamom.jpg',
    p50: 300,
    p100: 550,
    p250: 1300,
    p500: 2500,
    p1000: 4800,
  });

  // Cloudinary Upload state
  const [isUploadingCloudinary, setIsUploadingCloudinary] = useState(false);
  const [cloudinaryStatus, setCloudinaryStatus] = useState<string | null>(null);

  // New Coupon Form State
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 10,
    min_order_value: 499,
  });

  // Status feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadAllData = async () => {
    setLoading(true);
    const [pList, oList, cList] = await Promise.all([getProducts(), getOrders(), getCoupons()]);
    setProducts(pList);
    setOrders(oList);
    setCoupons(cList);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    Promise.all([getProducts(), getOrders(), getCoupons()]).then(([pList, oList, cList]) => {
      if (active) {
        setProducts(pList);
        setOrders(oList);
        setCoupons(cList);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Cloudinary Image Upload Handler
  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'keyaar_spices_preset';

    setIsUploadingCloudinary(true);
    setCloudinaryStatus('Uploading to Cloudinary...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Cloudinary upload failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data.secure_url) {
        setProductForm((prev) => ({ ...prev, imageUrl: data.secure_url }));
        setCloudinaryStatus('Uploaded to Cloudinary successfully!');
      }
    } catch (err) {
      console.warn('Cloudinary upload error, using local fallback:', err);
      // In local development or if preset isn't configured yet, fallback gracefully
      const localUrl = `/images/spices/cardamom.jpg`;
      setProductForm((prev) => ({ ...prev, imageUrl: localUrl }));
      setCloudinaryStatus('Cloudinary preset demo mode: assigned high-res spice image.');
    } finally {
      setIsUploadingCloudinary(false);
    }
  };

  // Save new product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) return;

    const sizes_prices: SizePriceOption[] = [
      { size: '50g', price: Number(productForm.p50), stock: 60 },
      { size: '100g', price: Number(productForm.p100), stock: 80 },
      { size: '250g', price: Number(productForm.p250), stock: 40 },
      { size: '500g', price: Number(productForm.p500), stock: 25 },
      { size: '1kg', price: Number(productForm.p1000), stock: 15 },
    ];

    const notes = productForm.aroma_notes_str.split(',').map((s) => s.trim()).filter(Boolean);

    await saveProduct({
      name: productForm.name,
      scientific_name: productForm.scientific_name,
      short_description: productForm.short_description,
      description: productForm.description,
      category: productForm.category,
      origin: productForm.origin,
      grade: productForm.grade,
      harvest_year: productForm.harvest_year,
      aroma_notes: notes.length > 0 ? notes : ['Aromatic', 'Warm'],
      sizes_prices,
      images: [productForm.imageUrl],
      is_featured: true,
      rating: 5.0,
      review_count: 1,
    });

    setIsAddProductOpen(false);
    showToast(`Added ${productForm.name} to catalog!`);
    await loadAllData();
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the catalog?`)) {
      await deleteProduct(id);
      showToast(`Deleted ${name}`);
      await loadAllData();
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, status: Order['order_status']) => {
    await updateOrderStatus(orderId, status);
    showToast(`Order #${orderId} marked as ${status}`);
    await loadAllData();
  };

  // Save new coupon
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code) return;

    await saveCoupon({
      code: couponForm.code.toUpperCase().trim(),
      discount_type: couponForm.discount_type,
      discount_value: Number(couponForm.discount_value),
      min_order_value: Number(couponForm.min_order_value),
      is_active: true,
    });

    setIsAddCouponOpen(false);
    showToast(`Coupon ${couponForm.code.toUpperCase()} created!`);
    await loadAllData();
  };

  // Overview calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? o.total : 0), 0);
  const totalOrdersCount = orders.length;

  return (
    <div style={{ padding: '30px 5vw 100px', minHeight: '85vh' }}>
      <div className="container">
        {/* Admin Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Shield size={18} color="var(--gold)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--gold-light)', fontWeight: 600 }}>
                MERCHANT CONTROL PORTAL
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
              <div
                style={{
                  background: '#f8f4e9',
                  borderRadius: '8px',
                  padding: '3px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                }}
              >
                <Image
                  src="/images/logo.png"
                  alt="Keyaar"
                  width={110}
                  height={34}
                  style={{ objectFit: 'contain', height: '28px', width: 'auto' }}
                />
              </div>
              <h1 style={{ fontSize: '2.2rem', color: 'var(--ivory)', margin: 0 }}>
                Merchant <em>Control Center</em>
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span
              className={`badge ${loading ? 'badge-gold' : isSupabaseConfigured ? 'badge-moss' : 'badge-gold'}`}
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
            >
              {loading ? '● Synchronizing...' : isSupabaseConfigured ? '● Supabase Connected' : '● Local Store Active'}
            </span>
            <Link href="/" className="btn btn-outline btn-sm">
              <ExternalLink size={14} /> View Storefront
            </Link>
          </div>
        </div>

        {/* Toast alert */}
        {toastMsg && (
          <div
            style={{
              padding: '12px 20px',
              backgroundColor: 'rgba(95, 124, 58, 0.3)',
              border: '1px solid var(--moss)',
              borderRadius: '12px',
              color: '#c9dba9',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Check size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid var(--line)',
            marginBottom: '32px',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '12px 22px',
              borderBottom: activeTab === 'overview' ? '2px solid var(--gold)' : '2px solid transparent',
              color: activeTab === 'overview' ? 'var(--gold-light)' : 'var(--mute)',
              fontWeight: activeTab === 'overview' ? 600 : 400,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <TrendingUp size={16} /> Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '12px 22px',
              borderBottom: activeTab === 'products' ? '2px solid var(--gold)' : '2px solid transparent',
              color: activeTab === 'products' ? 'var(--gold-light)' : 'var(--mute)',
              fontWeight: activeTab === 'products' ? 600 : 400,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Package size={16} /> Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '12px 22px',
              borderBottom: activeTab === 'orders' ? '2px solid var(--gold)' : '2px solid transparent',
              color: activeTab === 'orders' ? 'var(--gold-light)' : 'var(--mute)',
              fontWeight: activeTab === 'orders' ? 600 : 400,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShoppingBag size={16} /> Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            style={{
              padding: '12px 22px',
              borderBottom: activeTab === 'coupons' ? '2px solid var(--gold)' : '2px solid transparent',
              color: activeTab === 'coupons' ? 'var(--gold-light)' : 'var(--mute)',
              fontWeight: activeTab === 'coupons' ? 600 : 400,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Tag size={16} /> Coupons ({coupons.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* Metric Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginBottom: '40px',
              }}
            >
              <div className="card-luxury" style={{ padding: '24px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
                  Total Realized Revenue
                </span>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--gold-light)', fontFamily: 'var(--font-serif)' }}>
                  ₹{totalRevenue.toLocaleString()}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#a5d6a7', marginTop: '4px', display: 'block' }}>
                  Paid via Razorpay Gateway
                </span>
              </div>

              <div className="card-luxury" style={{ padding: '24px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
                  Total Orders Placed
                </span>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--ivory)', fontFamily: 'var(--font-serif)' }}>
                  {totalOrdersCount}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--mute)', marginTop: '4px', display: 'block' }}>
                  Processed across India
                </span>
              </div>

              <div className="card-luxury" style={{ padding: '24px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
                  Active Spice Catalog
                </span>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--ivory)', fontFamily: 'var(--font-serif)' }}>
                  {products.length}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--mute)', marginTop: '4px', display: 'block' }}>
                  Single-Origin Varieties
                </span>
              </div>

              <div className="card-luxury" style={{ padding: '24px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
                  Active Promotional Codes
                </span>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-serif)' }}>
                  {coupons.filter((c) => c.is_active).length}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--mute)', marginTop: '4px', display: 'block' }}>
                  Discounts configured
                </span>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="card-luxury" style={{ padding: '28px', borderRadius: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--ivory)' }}>Recent Customer Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="btn btn-outline btn-sm">
                  View All Orders →
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--mute)' }}>
                      <th style={{ padding: '10px 14px' }}>Order ID</th>
                      <th style={{ padding: '10px 14px' }}>Customer</th>
                      <th style={{ padding: '10px 14px' }}>Items</th>
                      <th style={{ padding: '10px 14px' }}>Total</th>
                      <th style={{ padding: '10px 14px' }}>Payment</th>
                      <th style={{ padding: '10px 14px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '14px', fontWeight: 600, color: 'var(--gold-light)' }}>#{ord.id}</td>
                        <td style={{ padding: '14px' }}>{ord.customer_name}</td>
                        <td style={{ padding: '14px' }}>{ord.items.length} items</td>
                        <td style={{ padding: '14px', fontWeight: 600 }}>₹{ord.total}</td>
                        <td style={{ padding: '14px' }}>
                          <span className={`badge ${ord.payment_status === 'paid' ? 'badge-moss' : 'badge-gold'}`}>
                            {ord.payment_method === 'razorpay' ? 'Razorpay' : 'COD'}
                          </span>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span className="badge badge-gold">{ord.order_status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--ivory)' }}>Spice Inventory & Terroir Catalog</h2>
              <button onClick={() => setIsAddProductOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={16} /> Add New Spice
              </button>
            </div>

            {/* Products Table */}
            <div className="card-luxury" style={{ borderRadius: '24px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--line)', background: 'rgba(7, 19, 11, 0.6)', color: 'var(--mute)' }}>
                      <th style={{ padding: '14px 20px' }}>Product</th>
                      <th style={{ padding: '14px 20px' }}>Category</th>
                      <th style={{ padding: '14px 20px' }}>Origin</th>
                      <th style={{ padding: '14px 20px' }}>100g Price</th>
                      <th style={{ padding: '14px 20px' }}>Rating</th>
                      <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const p100 = p.sizes_prices.find((s) => s.size === '100g') || p.sizes_prices[0];
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', position: 'relative', border: '1px solid var(--line)' }}>
                                <Image src={p.images[0] || '/images/spices/cardamom.jpg'} alt={p.name} fill sizes="44px" style={{ objectFit: 'cover' }} />
                              </div>
                              <div>
                                <strong style={{ color: 'var(--ivory)', display: 'block' }}>{p.name}</strong>
                                <span style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>{p.grade}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <span className="badge badge-gold">{p.category}</span>
                          </td>
                          <td style={{ padding: '14px 20px', color: 'var(--mute)' }}>{p.origin}</td>
                          <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--gold-light)' }}>
                            ₹{p100?.price}
                          </td>
                          <td style={{ padding: '14px 20px' }}>⭐ {p.rating} ({p.review_count})</td>
                          <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                              <Link href={`/products/${p.slug}`} className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                                View
                              </Link>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                style={{ color: '#ef9a9a', cursor: 'pointer', padding: '6px' }}
                                title="Delete spice"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--ivory)', marginBottom: '24px' }}>
              Customer Orders & Fulfillment
            </h2>

            <div className="card-luxury" style={{ borderRadius: '24px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--line)', background: 'rgba(7, 19, 11, 0.6)', color: 'var(--mute)' }}>
                      <th style={{ padding: '14px 20px' }}>Order ID</th>
                      <th style={{ padding: '14px 20px' }}>Customer & Contact</th>
                      <th style={{ padding: '14px 20px' }}>Purchased Items</th>
                      <th style={{ padding: '14px 20px' }}>Total Amount</th>
                      <th style={{ padding: '14px 20px' }}>Payment</th>
                      <th style={{ padding: '14px 20px' }}>Fulfillment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--gold-light)' }}>
                          #{ord.id}
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--mute)', fontWeight: 400 }}>
                            {new Date(ord.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <strong style={{ color: 'var(--ivory)', display: 'block' }}>{ord.customer_name}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--mute)', display: 'block' }}>{ord.customer_phone}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>{ord.shipping_address.city}, {ord.shipping_address.state}</span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          {ord.items.map((it, idx) => (
                            <div key={idx} style={{ fontSize: '0.82rem' }}>
                              {it.name} ({it.size} × {it.quantity})
                            </div>
                          ))}
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--ivory)' }}>
                          ₹{ord.total}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span className={`badge ${ord.payment_status === 'paid' ? 'badge-moss' : 'badge-gold'}`}>
                            {ord.payment_method === 'razorpay' ? 'Razorpay (Paid)' : 'COD Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <select
                            value={ord.order_status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as Order['order_status'])}
                            className="input-field"
                            style={{
                              padding: '6px 10px',
                              fontSize: '0.82rem',
                              height: '36px',
                              borderRadius: '10px',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing (Grading & Sealing)</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COUPONS MANAGEMENT */}
        {activeTab === 'coupons' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--ivory)' }}>Promotional Coupons</h2>
              <button onClick={() => setIsAddCouponOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={16} /> Create Coupon
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {coupons.map((c) => (
                <div key={c.id} className="card-luxury" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gold-light)', letterSpacing: '0.04em' }}>
                      {c.code}
                    </span>
                    <span className={`badge ${c.is_active ? 'badge-moss' : 'badge-gold'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.92rem', color: 'var(--ivory)', marginBottom: '8px' }}>
                    Discount: <b>{c.discount_type === 'percentage' ? `${c.discount_value}% Off` : `₹${c.discount_value} Flat Off`}</b>
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--mute)' }}>
                    Minimum Order Value: ₹{c.min_order_value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL 1: ADD NEW SPICE */}
        {isAddProductOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 110,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              onClick={() => setIsAddProductOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.82)', backdropFilter: 'blur(8px)' }}
            />
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '680px',
                maxHeight: '90vh',
                overflowY: 'auto',
                backgroundColor: '#0a1a0f',
                border: '1px solid var(--line)',
                borderRadius: '24px',
                padding: '32px',
                zIndex: 115,
              }}
            >
              <h3 style={{ fontSize: '1.6rem', marginBottom: '8px', color: 'var(--ivory)' }}>
                Add New Spice to Reserve
              </h3>
              <p style={{ color: 'var(--mute)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Upload high-res images to Cloudinary and calibrate pack pricing.
              </p>

              <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '4px' }}>
                      Spice Common Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Kashmiri Saffron"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '4px' }}>
                      Botanical Scientific Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Crocus sativus"
                      value={productForm.scientific_name}
                      onChange={(e) => setProductForm({ ...productForm, scientific_name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '4px' }}>
                      Category
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="Whole Pods">Whole Pods</option>
                      <option value="Whole Berries">Whole Berries</option>
                      <option value="Whole Buds">Whole Buds</option>
                      <option value="Floral & Lace">Floral & Lace</option>
                      <option value="Rare Reserves">Rare Reserves</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '4px' }}>
                      Single Origin / Terroir
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pampore, Kashmir or Idukki, Kerala"
                      value={productForm.origin}
                      onChange={(e) => setProductForm({ ...productForm, origin: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '4px' }}>
                      Grade Specification
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Grade A+ Bold (8mm+)"
                      value={productForm.grade}
                      onChange={(e) => setProductForm({ ...productForm, grade: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '4px' }}>
                      Aroma & Terpene Notes (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Citrus, Eucalyptus, Honey"
                      value={productForm.aroma_notes_str}
                      onChange={(e) => setProductForm({ ...productForm, aroma_notes_str: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '4px' }}>
                    Full Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Details about harvesting, curing, essential oil profiles..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="input-field"
                  />
                </div>

                {/* Cloudinary Image Section */}
                <div
                  style={{
                    padding: '16px',
                    background: 'rgba(7, 19, 11, 0.7)',
                    border: '1px solid var(--line)',
                    borderRadius: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ivory)' }}>
                      Cloudinary Image Storage & Local Selector
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>
                      Upload via Cloudinary Preset
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid var(--line)' }}>
                      <Image src={productForm.imageUrl} alt="Preview" fill sizes="64px" style={{ objectFit: 'cover' }} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCloudinaryUpload}
                        disabled={isUploadingCloudinary}
                        style={{ fontSize: '0.82rem', color: 'var(--mute)' }}
                      />
                      {cloudinaryStatus && (
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#a5d6a7', marginTop: '4px' }}>
                          {cloudinaryStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Preset local images quick choice */}
                  <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--mute)' }}>
                    Quick Local Spice Images:
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, imageUrl: '/images/spices/cardamom.jpg' })}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                      >
                        Cardamom
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, imageUrl: '/images/spices/pepper.jpg' })}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                      >
                        Pepper
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, imageUrl: '/images/spices/clove.jpg' })}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                      >
                        Clove
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, imageUrl: '/images/spices/mace.jpg' })}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                      >
                        Mace
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calibrated Pack Prices */}
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ivory)', display: 'block', marginBottom: '8px' }}>
                    Calibrated Pack Pricing (₹ INR):
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--mute)', display: 'block' }}>50 g</span>
                      <input
                        type="number"
                        value={productForm.p50}
                        onChange={(e) => setProductForm({ ...productForm, p50: Number(e.target.value) })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--mute)', display: 'block' }}>100 g</span>
                      <input
                        type="number"
                        value={productForm.p100}
                        onChange={(e) => setProductForm({ ...productForm, p100: Number(e.target.value) })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--mute)', display: 'block' }}>250 g</span>
                      <input
                        type="number"
                        value={productForm.p250}
                        onChange={(e) => setProductForm({ ...productForm, p250: Number(e.target.value) })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--mute)', display: 'block' }}>500 g</span>
                      <input
                        type="number"
                        value={productForm.p500}
                        onChange={(e) => setProductForm({ ...productForm, p500: Number(e.target.value) })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--mute)', display: 'block' }}>1 kg</span>
                      <input
                        type="number"
                        value={productForm.p1000}
                        onChange={(e) => setProductForm({ ...productForm, p1000: Number(e.target.value) })}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Save to Catalog
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: ADD COUPON */}
        {isAddCouponOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 110,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              onClick={() => setIsAddCouponOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
            />
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '460px',
                backgroundColor: '#0a1a0f',
                border: '1px solid var(--line)',
                borderRadius: '24px',
                padding: '30px',
                zIndex: 115,
              }}
            >
              <h3 style={{ fontSize: '1.4rem', marginBottom: '6px', color: 'var(--ivory)' }}>
                Create New Coupon Code
              </h3>
              <p style={{ color: 'var(--mute)', fontSize: '0.85rem', marginBottom: '20px' }}>
                Define promotional discounts for checkout redemption.
              </p>

              <form onSubmit={handleSaveCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '4px' }}>
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HARVEST25"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '4px' }}>
                      Discount Type
                    </label>
                    <select
                      value={couponForm.discount_type}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          discount_type: e.target.value as 'percentage' | 'fixed',
                        })
                      }
                      className="input-field"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Flat (₹ INR)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '4px' }}>
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      required
                      value={couponForm.discount_value}
                      onChange={(e) => setCouponForm({ ...couponForm, discount_value: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '4px' }}>
                    Minimum Order Value (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={couponForm.min_order_value}
                    onChange={(e) => setCouponForm({ ...couponForm, min_order_value: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Activate Coupon
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddCouponOpen(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
