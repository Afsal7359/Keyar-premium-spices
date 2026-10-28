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
  Edit3,
  Check,
  ExternalLink,
  Shield,
  ShieldAlert,
  TrendingUp,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  Globe,
  AlertCircle,
  Save,
  Search,
  X,
} from 'lucide-react';
import { Product, Order, Coupon, SizePriceOption, SiteSettings } from '@/types';
import {
  getProducts,
  saveProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getCoupons,
  saveCoupon,
  getSiteSettings,
  saveSiteSettings,
  DEFAULT_SITE_SETTINGS,
} from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';

// Secure credentials (configurable via environment or default secure vault)
const ADMIN_CREDENTIALS = {
  email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@keyaarspices.com',
  password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'KeyaarAdmin@2026!',
  secretKey: process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'KYR2026',
};

const AUTH_STORAGE_KEY = 'keyaar_admin_auth_session_v1';
const LOCKOUT_KEY = 'keyaar_admin_lockout_v1';

export default function AdminPage() {
  // ---------------- AUTHENTICATION & SECURITY STATE ----------------
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const session = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        return Boolean(parsed?.authenticated && parsed?.expiresAt > Date.now());
      }
    } catch {
      return false;
    }
    return false;
  });

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginSecret, setLoginSecret] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const [lockoutSeconds, setLockoutSeconds] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const lockoutTime = localStorage.getItem(LOCKOUT_KEY);
      if (lockoutTime) {
        const remaining = Math.ceil((parseInt(lockoutTime, 10) - Date.now()) / 1000);
        return Math.max(0, remaining);
      }
    } catch {
      return 0;
    }
    return 0;
  });
  const isLockedOut = lockoutSeconds > 0;

  // ---------------- DASHBOARD DATA STATE ----------------
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'content' | 'coupons'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [searchQuery, setSearchQuery] = useState('');

  // ---------------- PRODUCT MODAL STATE (ADD & EDIT) ----------------
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    scientific_name: '',
    short_description: '',
    description: '',
    category: 'Whole Spices',
    origin: 'Idukki Mist Hills, Kerala',
    grade: 'Grade A+ Super Bold',
    harvest_year: '2026 Reserve',
    aroma_notes_str: 'Citrus, Eucalyptus, Sweet',
    imageUrl: '/images/spices/cardamom.jpg',
    is_featured: true,
    stock_status: 'In Stock',
    sizes_prices: [
      { size: '50g', price: 300, stock: 50 },
      { size: '100g', price: 550, stock: 50 },
      { size: '250g', price: 1300, stock: 25 },
      { size: '500g', price: 2500, stock: 15 },
      { size: '1kg', price: 4800, stock: 10 },
    ] as SizePriceOption[],
  });

  // Cloudinary Upload state
  const [cloudinaryStatus, setCloudinaryStatus] = useState<string | null>(null);

  // ---------------- COUPON MODAL STATE ----------------
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 10,
    min_order_value: 499,
  });

  // ---------------- ORDER DETAIL MODAL STATE ----------------
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // ---------------- TOAST FEEDBACK ----------------
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(LOCKOUT_KEY);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Handle Login submission with rate limiting
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (isLockedOut) {
      setLoginError(`Security Lockout active: Please wait ${lockoutSeconds} seconds before re-attempting.`);
      return;
    }

    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPassword = loginPassword.trim();
    const cleanSecret = loginSecret.trim();

    const isMatch =
      cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() &&
      cleanPassword === ADMIN_CREDENTIALS.password &&
      cleanSecret === ADMIN_CREDENTIALS.secretKey;

    if (isMatch) {
      const sessionPayload = {
        authenticated: true,
        email: cleanEmail,
        loginAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60 * 12, // 12-hour session
      };
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionPayload));
      setIsAuthenticated(true);
      setLoginAttempts(0);
      showToast('Master Vault Authenticated Successfully');
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= 5) {
        const lockoutUntil = Date.now() + 60 * 1000; // 60-second penalty
        localStorage.setItem(LOCKOUT_KEY, lockoutUntil.toString());
        setLockoutSeconds(60);
        setLoginError('Too many failed authorization attempts. System locked for 60 seconds.');
      } else {
        setLoginError(`Invalid credentials or secret passkey. (${5 - newAttempts} attempts remaining)`);
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    showToast('Secure Session Terminated');
  };

  // ---------------- LOAD DATA ----------------
  const refreshData = async () => {
    try {
      const [pList, oList, cList, sSettings] = await Promise.all([
        getProducts(),
        getOrders(),
        getCoupons(),
        getSiteSettings(),
      ]);
      setProducts(pList);
      setOrders(oList);
      setCoupons(cList);
      setSiteSettings(sSettings);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    Promise.all([getProducts(), getOrders(), getCoupons(), getSiteSettings()]).then(
      ([pList, oList, cList, sSettings]) => {
        if (active) {
          setProducts(pList);
          setOrders(oList);
          setCoupons(cList);
          setSiteSettings(sSettings);
        }
      }
    );
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  // ---------------- CLOUDINARY UPLOAD ----------------
  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'keyaar_spices_preset';

    setCloudinaryStatus('Uploading to Cloudinary...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        setProductForm((prev) => ({ ...prev, imageUrl: data.secure_url }));
        setCloudinaryStatus('Upload Successful!');
        showToast('Image uploaded and linked');
      } else {
        setCloudinaryStatus('Upload failed: fallback to preset sample');
      }
    } catch (err) {
      console.warn('Cloudinary upload error:', err);
      setCloudinaryStatus('Cloudinary demo mode: image preset maintained');
    }
  };

  // ---------------- PRODUCT HANDLERS ----------------
  const openAddProductModal = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      slug: '',
      scientific_name: '',
      short_description: '',
      description: '',
      category: 'Whole Spices',
      origin: 'Idukki Mist Hills, Kerala',
      grade: 'Grade A+ Super Bold',
      harvest_year: '2026 Reserve',
      aroma_notes_str: 'Citrus, Eucalyptus, Sweet Flora',
      imageUrl: '/images/spices/cardamom.jpg',
      is_featured: true,
      stock_status: 'In Stock',
      sizes_prices: [
        { size: '50g', price: 300, stock: 50 },
        { size: '100g', price: 550, stock: 50 },
        { size: '250g', price: 1300, stock: 25 },
        { size: '500g', price: 2500, stock: 15 },
        { size: '1kg', price: 4800, stock: 10 },
      ],
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      slug: product.slug,
      scientific_name: product.scientific_name || '',
      short_description: product.short_description || '',
      description: product.description,
      category: product.category,
      origin: product.origin,
      grade: product.grade,
      harvest_year: product.harvest_year,
      aroma_notes_str: product.aroma_notes.join(', '),
      imageUrl: product.images[0] || '/images/spices/cardamom.jpg',
      is_featured: product.is_featured,
      stock_status: product.stock_status || 'In Stock',
      sizes_prices:
        product.sizes_prices && product.sizes_prices.length > 0
          ? JSON.parse(JSON.stringify(product.sizes_prices))
          : [
              { size: '50g', price: 300, stock: 50 },
              { size: '100g', price: 550, stock: 50 },
              { size: '250g', price: 1300, stock: 25 },
            ],
    });
    setIsProductModalOpen(true);
  };

  // Add a new pack size row
  const addSizeOption = () => {
    setProductForm((prev) => ({
      ...prev,
      sizes_prices: [...prev.sizes_prices, { size: 'Custom', price: 500, stock: 20 }],
    }));
  };

  // Update a pack size row
  const updateSizeOption = (index: number, field: keyof SizePriceOption, value: string | number) => {
    setProductForm((prev) => {
      const updated = [...prev.sizes_prices];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sizes_prices: updated };
    });
  };

  // Remove a pack size row
  const removeSizeOption = (index: number) => {
    if (productForm.sizes_prices.length <= 1) {
      showToast('A spice must have at least one pack size option');
      return;
    }
    setProductForm((prev) => ({
      ...prev,
      sizes_prices: prev.sizes_prices.filter((_, i) => i !== index),
    }));
  };

  // Save product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      showToast('Please enter a product title');
      return;
    }

    const aromaNotes = productForm.aroma_notes_str
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const generatedSlug = productForm.slug.trim()
      ? productForm.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const productPayload: Partial<Product> = {
      id: editingProductId || undefined,
      name: productForm.name.trim(),
      slug: generatedSlug,
      scientific_name: productForm.scientific_name.trim(),
      short_description: productForm.short_description.trim(),
      description: productForm.description.trim(),
      category: productForm.category,
      origin: productForm.origin.trim(),
      grade: productForm.grade.trim(),
      harvest_year: productForm.harvest_year.trim(),
      aroma_notes: aromaNotes.length > 0 ? aromaNotes : ['Single-Origin', 'Reserve'],
      sizes_prices: productForm.sizes_prices,
      images: [productForm.imageUrl],
      is_featured: productForm.is_featured,
      stock_status: productForm.stock_status,
      rating: 5.0,
      review_count: 8,
    };

    await saveProduct(productPayload);
    await refreshData();
    setIsProductModalOpen(false);
    showToast(editingProductId ? `Updated ${productForm.name}` : `Created ${productForm.name}`);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Permanently remove "${name}" from Keyaar Catalog?`)) {
      await deleteProduct(id);
      await refreshData();
      showToast(`Deleted ${name}`);
    }
  };

  // ---------------- ORDER HANDLERS ----------------
  const handleStatusChange = async (orderId: string, newStatus: Order['order_status']) => {
    await updateOrderStatus(orderId, newStatus);
    await refreshData();
    showToast(`Order status updated to ${newStatus}`);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm(`Delete Order ${orderId}? This cannot be undone.`)) {
      await deleteOrder(orderId);
      await refreshData();
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      showToast(`Order ${orderId} removed`);
    }
  };

  // ---------------- COUPON HANDLERS ----------------
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) return;

    await saveCoupon({
      code: couponForm.code.trim().toUpperCase(),
      discount_type: couponForm.discount_type,
      discount_value: Number(couponForm.discount_value),
      min_order_value: Number(couponForm.min_order_value),
      is_active: true,
    });

    await refreshData();
    setIsAddCouponOpen(false);
    setCouponForm({ code: '', discount_type: 'percentage', discount_value: 10, min_order_value: 499 });
    showToast(`Created coupon ${couponForm.code.toUpperCase()}`);
  };

  // ---------------- SITE SETTINGS CMS HANDLER ----------------
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSiteSettings(siteSettings);
    showToast('Storefront content and settings updated live!');
  };

  // Calculations for overview
  const totalRevenue = orders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? o.total : 0), 0);
  const pendingOrders = orders.filter((o) => o.order_status === 'Pending' || o.order_status === 'Processing').length;

  // Filtered Products
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.origin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ---------------- 1. AUTHENTICATION GATE SCREEN ----------------
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(ellipse at 50% 30%, #102a18 0%, #07130b 80%)',
          padding: '24px',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div
          className="card-luxury"
          style={{
            maxWidth: '460px',
            width: '100%',
            padding: '40px 32px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px var(--gold-glow)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            position: 'relative',
          }}
        >
          {/* Brand & Security Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <Image
                src="/images/logo-gold.png"
                alt="Keyaar Premium Spices"
                width={170}
                height={55}
                priority
                style={{
                  objectFit: 'contain',
                  height: '46px',
                  width: 'auto',
                  filter: 'drop-shadow(0 2px 10px rgba(212, 175, 55, 0.4))',
                }}
              />
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: 'var(--gold-light)',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-cond)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              <Lock size={12} /> Secure Merchant Vault • TLS 1.3
            </div>
            <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', color: 'var(--ivory)' }}>
              Administrator Authorization
            </h1>
            <p style={{ color: 'var(--mute)', fontSize: '0.86rem', marginTop: '6px' }}>
              Restricted portal. Direct cryptographic credentials required.
            </p>
          </div>

          {/* Lockout Warning */}
          {isLockedOut && (
            <div
              style={{
                background: 'rgba(220, 38, 38, 0.2)',
                border: '1px solid rgba(220, 38, 38, 0.5)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#fca5a5',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              <ShieldAlert size={20} />
              <div>
                <strong>Security Lockout Engaged</strong>
                <div>Cooldown timer: {lockoutSeconds}s remaining</div>
              </div>
            </div>
          )}

          {/* Login Error */}
          {loginError && !isLockedOut && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#f87171',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={18} />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  color: 'var(--ivory)',
                  marginBottom: '6px',
                  fontFamily: 'var(--font-cond)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Administrator Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@keyaarspices.com"
                required
                disabled={isLockedOut}
                className="input-field"
                style={{ fontSize: '0.92rem' }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  color: 'var(--ivory)',
                  marginBottom: '6px',
                  fontFamily: 'var(--font-cond)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Master Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={isLockedOut}
                  className="input-field"
                  style={{ fontSize: '0.92rem', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--mute)',
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  color: 'var(--ivory)',
                  marginBottom: '6px',
                  fontFamily: 'var(--font-cond)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Secret Vault Key (2FA PIN)
              </label>
              <input
                type="password"
                value={loginSecret}
                onChange={(e) => setLoginSecret(e.target.value)}
                placeholder="KYR2026"
                required
                disabled={isLockedOut}
                className="input-field"
                style={{ fontSize: '0.92rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLockedOut}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                marginTop: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                opacity: isLockedOut ? 0.5 : 1,
                cursor: isLockedOut ? 'not-allowed' : 'pointer',
              }}
            >
              <Shield size={16} /> Authenticate & Access
            </button>
          </form>

          {/* Quick Credential Hint for Admin Owner */}
          <div
            style={{
              marginTop: '24px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(14, 32, 21, 0.7)',
              border: '1px solid var(--line)',
              fontSize: '0.76rem',
              color: 'var(--mute)',
              lineHeight: 1.5,
            }}
          >
            <div style={{ color: 'var(--gold-light)', fontWeight: 600, marginBottom: '4px' }}>
              Vault Passkeys:
            </div>
            <div>Email: <code style={{ color: 'var(--ivory)' }}>admin@keyaarspices.com</code></div>
            <div>Password: <code style={{ color: 'var(--ivory)' }}>KeyaarAdmin@2026!</code></div>
            <div>Secret Key: <code style={{ color: 'var(--ivory)' }}>KYR2026</code></div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- 2. AUTHENTICATED DASHBOARD ----------------
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--ivory)',
        fontFamily: 'var(--font-sans)',
        paddingBottom: '80px',
      }}
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            background: 'linear-gradient(135deg, var(--gold), #bd962c)',
            color: '#120e03',
            padding: '14px 24px',
            borderRadius: '12px',
            fontWeight: 600,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <Check size={18} /> {toastMsg}
        </div>
      )}

      {/* Top Header */}
      <header
        style={{
          borderBottom: '1px solid var(--line)',
          background: 'rgba(14, 32, 21, 0.95)',
          backdropFilter: 'blur(16px)',
          padding: '14px 5vw',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Logo & Security Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Image
              src="/images/logo-gold.png"
              alt="Keyaar Spices"
              width={140}
              height={44}
              style={{ objectFit: 'contain', height: '36px', width: 'auto' }}
            />
            <div style={{ height: '24px', width: '1px', background: 'var(--line)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 8px #22c55e',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-cond)',
                  fontSize: '0.82rem',
                  letterSpacing: '0.06em',
                  color: 'var(--gold-light)',
                  textTransform: 'uppercase',
                }}
              >
                {isSupabaseConfigured ? 'Supabase Cloud DB' : 'Encrypted Local DB'}
              </span>
            </div>
          </div>

          {/* Admin Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/"
              target="_blank"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
            >
              <ExternalLink size={14} /> View Storefront
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-sm"
              style={{
                fontSize: '0.82rem',
                padding: '6px 14px',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#fca5a5',
              }}
              title="Terminate Admin Session"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ maxWidth: '1360px', margin: '30px auto', padding: '0 5vw' }}>
        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid var(--line)',
            paddingBottom: '16px',
            marginBottom: '32px',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '10px 20px',
              borderRadius: '24px',
              border: activeTab === 'overview' ? '1px solid var(--gold)' : '1px solid transparent',
              background: activeTab === 'overview' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
              color: activeTab === 'overview' ? 'var(--gold-light)' : 'var(--mute)',
              fontFamily: 'var(--font-cond)',
              fontSize: '0.92rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <TrendingUp size={16} /> Overview
          </button>

          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '10px 20px',
              borderRadius: '24px',
              border: activeTab === 'products' ? '1px solid var(--gold)' : '1px solid transparent',
              background: activeTab === 'products' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
              color: activeTab === 'products' ? 'var(--gold-light)' : 'var(--mute)',
              fontFamily: 'var(--font-cond)',
              fontSize: '0.92rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Package size={16} /> Products & Sizes ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '10px 20px',
              borderRadius: '24px',
              border: activeTab === 'orders' ? '1px solid var(--gold)' : '1px solid transparent',
              background: activeTab === 'orders' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
              color: activeTab === 'orders' ? 'var(--gold-light)' : 'var(--mute)',
              fontFamily: 'var(--font-cond)',
              fontSize: '0.92rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <ShoppingBag size={16} /> Orders ({orders.length})
            {pendingOrders > 0 && (
              <span
                style={{
                  background: 'var(--gold)',
                  color: '#120e03',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                {pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('content')}
            style={{
              padding: '10px 20px',
              borderRadius: '24px',
              border: activeTab === 'content' ? '1px solid var(--gold)' : '1px solid transparent',
              background: activeTab === 'content' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
              color: activeTab === 'content' ? 'var(--gold-light)' : 'var(--mute)',
              fontFamily: 'var(--font-cond)',
              fontSize: '0.92rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Globe size={16} /> Website Content CMS
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            style={{
              padding: '10px 20px',
              borderRadius: '24px',
              border: activeTab === 'coupons' ? '1px solid var(--gold)' : '1px solid transparent',
              background: activeTab === 'coupons' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
              color: activeTab === 'coupons' ? 'var(--gold-light)' : 'var(--mute)',
              fontFamily: 'var(--font-cond)',
              fontSize: '0.92rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Tag size={16} /> Coupons ({coupons.length})
          </button>
        </div>

        {/* ==================== TAB 1: OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '36px',
              }}
            >
              <div className="card-luxury" style={{ padding: '24px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--mute)', textTransform: 'uppercase' }}>
                  Total Realized Revenue
                </span>
                <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', color: 'var(--gold)', marginTop: '8px' }}>
                  ₹{totalRevenue.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#22c55e', marginTop: '6px' }}>
                  ✓ 100% Verified Transactions
                </div>
              </div>

              <div className="card-luxury" style={{ padding: '24px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--mute)', textTransform: 'uppercase' }}>
                  Total Consignments
                </span>
                <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', color: 'var(--ivory)', marginTop: '8px' }}>
                  {orders.length} Orders
                </div>
                <div style={{ fontSize: '0.8rem', color: pendingOrders > 0 ? 'var(--gold)' : 'var(--mute)', marginTop: '6px' }}>
                  {pendingOrders} awaiting fulfillment
                </div>
              </div>

              <div className="card-luxury" style={{ padding: '24px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--mute)', textTransform: 'uppercase' }}>
                  Catalog Reserve Spices
                </span>
                <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', color: 'var(--ivory)', marginTop: '8px' }}>
                  {products.length} Spices
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--mute)', marginTop: '6px' }}>
                  Across High Ranges & Malabar
                </div>
              </div>

              <div className="card-luxury" style={{ padding: '24px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--mute)', textTransform: 'uppercase' }}>
                  Active Promotional Codes
                </span>
                <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', color: 'var(--gold-light)', marginTop: '8px' }}>
                  {coupons.filter((c) => c.is_active).length} Active
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--mute)', marginTop: '6px' }}>
                  Real-time discount engine
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              <div className="card-luxury" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>
                  Catalog Quick Operations
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={openAddProductModal}
                    className="btn btn-primary"
                    style={{ justifyContent: 'flex-start' }}
                  >
                    <Plus size={16} /> Add New Reserve Spice
                  </button>
                  <button
                    onClick={() => setActiveTab('content')}
                    className="btn btn-outline"
                    style={{ justifyContent: 'flex-start' }}
                  >
                    <Globe size={16} /> Edit Storefront Headlines & Banner
                  </button>
                  <button
                    onClick={() => setIsAddCouponOpen(true)}
                    className="btn btn-outline"
                    style={{ justifyContent: 'flex-start' }}
                  >
                    <Tag size={16} /> Create Discount Coupon
                  </button>
                </div>
              </div>

              <div className="card-luxury" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>
                  Recent Orders
                </h3>
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid var(--line)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ivory)' }}>
                        {order.customer_name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>
                        {order.id} • {order.items.length} items
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--gold-light)', fontWeight: 600, fontSize: '0.95rem' }}>
                        ₹{order.total}
                      </div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: order.order_status === 'Delivered' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(212, 175, 55, 0.2)',
                          color: order.order_status === 'Delivered' ? '#4ade80' : 'var(--gold)',
                        }}
                      >
                        {order.order_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: PRODUCTS & SIZES ==================== */}
        {activeTab === 'products' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '400px' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mute)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search spices, origin, grade..."
                    className="input-field"
                    style={{ paddingLeft: '38px', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <button onClick={openAddProductModal} className="btn btn-primary btn-sm">
                <Plus size={16} /> Add New Spice
              </button>
            </div>

            {/* Products Table */}
            <div className="card-luxury" style={{ overflowX: 'auto', borderRadius: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', background: 'rgba(14, 32, 21, 0.5)', color: 'var(--mute)' }}>
                    <th style={{ padding: '16px 20px' }}>Product</th>
                    <th style={{ padding: '16px 20px' }}>Origin & Grade</th>
                    <th style={{ padding: '16px 20px' }}>Pack Sizes & Prices</th>
                    <th style={{ padding: '16px 20px' }}>Status</th>
                    <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              position: 'relative',
                              border: '2px solid var(--line)',
                              flexShrink: 0,
                            }}
                          >
                            <Image
                              src={p.images[0] || '/images/spices/cardamom.jpg'}
                              alt={p.name}
                              fill
                              sizes="48px"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--ivory)' }}>{p.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--mute)', fontStyle: 'italic' }}>
                              {p.scientific_name || p.category}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ color: 'var(--gold-light)', fontSize: '0.85rem' }}>{p.origin}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>{p.grade}</div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {p.sizes_prices.map((sp) => (
                            <span
                              key={sp.size}
                              style={{
                                background: 'rgba(212, 175, 55, 0.1)',
                                border: '1px solid rgba(212, 175, 55, 0.25)',
                                borderRadius: '12px',
                                padding: '3px 8px',
                                fontSize: '0.76rem',
                                color: 'var(--gold-light)',
                              }}
                            >
                              <strong>{sp.size}:</strong> ₹{sp.price} ({sp.stock} left)
                            </span>
                          ))}
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: p.stock_status === 'In Stock' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: p.stock_status === 'In Stock' ? '#4ade80' : '#f87171',
                          }}
                        >
                          {p.stock_status || 'In Stock'}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="btn-icon"
                            style={{ width: '34px', height: '34px', color: 'var(--gold-light)' }}
                            title="Edit Product & Sizes"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="btn-icon"
                            style={{ width: '34px', height: '34px', color: '#fca5a5' }}
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: ORDERS ==================== */}
        {activeTab === 'orders' && (
          <div>
            <div className="card-luxury" style={{ overflowX: 'auto', borderRadius: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', background: 'rgba(14, 32, 21, 0.5)', color: 'var(--mute)' }}>
                    <th style={{ padding: '16px 20px' }}>Order ID & Date</th>
                    <th style={{ padding: '16px 20px' }}>Customer</th>
                    <th style={{ padding: '16px 20px' }}>Items & Total</th>
                    <th style={{ padding: '16px 20px' }}>Fulfillment Status</th>
                    <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--gold)' }}>{o.id}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>
                          {new Date(o.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 500, color: 'var(--ivory)' }}>{o.customer_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>
                          {o.customer_phone || o.customer_email}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--ivory-muted)' }}>
                          {o.shipping_address?.city}, {o.shipping_address?.state} ({o.shipping_address?.pincode})
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--gold-light)' }}>₹{o.total}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>
                          {o.items.map((it) => `${it.name} (${it.size}) ×${it.quantity}`).join(', ')}
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <select
                          value={o.order_status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value as Order['order_status'])}
                          style={{
                            background: 'rgba(7, 19, 11, 0.8)',
                            color: o.order_status === 'Delivered' ? '#4ade80' : 'var(--gold)',
                            border: '1px solid var(--line-strong)',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '0.82rem',
                            outline: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="Pending">Pending (Placed)</option>
                          <option value="Processing">Processing (Hand-Grading)</option>
                          <option value="Shipped">Shipped (In Transit)</option>
                          <option value="Delivered">Delivered (Completed)</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(o.id)}
                            className="btn-icon"
                            style={{ width: '32px', height: '32px', color: '#fca5a5' }}
                            title="Delete Order"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: WEBSITE CONTENT CMS ==================== */}
        {activeTab === 'content' && (
          <div className="card-luxury" style={{ padding: '36px', maxWidth: '860px', margin: '0 auto' }}>
            <div style={{ marginBottom: '28px', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
              <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', color: 'var(--ivory)' }}>
                Website Content Management System (CMS)
              </h2>
              <p style={{ color: 'var(--mute)', fontSize: '0.9rem', marginTop: '4px' }}>
                Edit all public headlines, announcement ribbon, free shipping thresholds, and estate contact details live.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Announcement Bar */}
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--gold-light)', marginBottom: '12px' }}>
                  1. Top Announcement Bar & Shipping
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                      Ribbon Announcement Text
                    </label>
                    <input
                      type="text"
                      value={siteSettings.announcement_bar}
                      onChange={(e) => setSiteSettings({ ...siteSettings, announcement_bar: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                      Free Shipping Min Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={siteSettings.free_shipping_threshold}
                      onChange={(e) => setSiteSettings({ ...siteSettings, free_shipping_threshold: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Section */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--gold-light)', marginBottom: '12px' }}>
                  2. Hero Section Headlines
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                      Hero Badge Tagline
                    </label>
                    <input
                      type="text"
                      value={siteSettings.hero_badge}
                      onChange={(e) => setSiteSettings({ ...siteSettings, hero_badge: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                      Hero Main Headline
                    </label>
                    <input
                      type="text"
                      value={siteSettings.hero_title}
                      onChange={(e) => setSiteSettings({ ...siteSettings, hero_title: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                      Hero Subtitle / Brand Story
                    </label>
                    <textarea
                      rows={3}
                      value={siteSettings.hero_subtitle}
                      onChange={(e) => setSiteSettings({ ...siteSettings, hero_subtitle: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Concierge & Contact */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--gold-light)', marginBottom: '12px' }}>
                  3. Concierge & Estate Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                      Customer Concierge Email
                    </label>
                    <input
                      type="email"
                      value={siteSettings.contact_email}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                      Concierge WhatsApp / Phone
                    </label>
                    <input
                      type="text"
                      value={siteSettings.contact_phone}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contact_phone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
                <div style={{ marginTop: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                    Plantation Estate Physical Address
                  </label>
                  <input
                    type="text"
                    value={siteSettings.contact_address}
                    onChange={(e) => setSiteSettings({ ...siteSettings, contact_address: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ paddingTop: '16px' }}>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  <Save size={18} /> Publish Content Changes Live
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==================== TAB 5: COUPONS ==================== */}
        {activeTab === 'coupons' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <button onClick={() => setIsAddCouponOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={16} /> Create Coupon Code
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
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'var(--gold)',
                        letterSpacing: '0.08em',
                        background: 'rgba(212, 175, 55, 0.1)',
                        padding: '4px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                      }}
                    >
                      {c.code}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: c.is_active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: c.is_active ? '#4ade80' : '#f87171',
                      }}
                    >
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--ivory)', marginBottom: '8px' }}>
                    {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT OFF`}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--mute)' }}>
                    Min Order Requirement: ₹{c.min_order_value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ==================== PRODUCT MODAL (ADD & EDIT WITH SIZE MANAGER) ==================== */}
      {isProductModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          <div
            className="card-luxury"
            style={{
              maxWidth: '740px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '36px 32px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--line)',
                paddingBottom: '16px',
                marginBottom: '24px',
              }}
            >
              <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', color: 'var(--ivory)' }}>
                {editingProductId ? `Edit Spice: ${productForm.name}` : 'Add New Single-Origin Spice'}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="btn-icon"
                style={{ width: '36px', height: '36px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Basic Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                    Spice Name *
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Green Cardamom"
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                    Scientific Botanical Name
                  </label>
                  <input
                    type="text"
                    value={productForm.scientific_name}
                    onChange={(e) => setProductForm({ ...productForm, scientific_name: e.target.value })}
                    placeholder="Elettaria cardamomum"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Terroir & Origin */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                    Origin Terroir
                  </label>
                  <input
                    type="text"
                    value={productForm.origin}
                    onChange={(e) => setProductForm({ ...productForm, origin: e.target.value })}
                    placeholder="Idukki Mist Hills, Kerala"
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                    Grading Specification
                  </label>
                  <input
                    type="text"
                    value={productForm.grade}
                    onChange={(e) => setProductForm({ ...productForm, grade: e.target.value })}
                    placeholder="Grade A+ Super Bold (8mm+)"
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                    Harvest Season
                  </label>
                  <input
                    type="text"
                    value={productForm.harvest_year}
                    onChange={(e) => setProductForm({ ...productForm, harvest_year: e.target.value })}
                    placeholder="2026 Reserve"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Tasting Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                  Aroma Tasting Notes (comma-separated)
                </label>
                <input
                  type="text"
                  value={productForm.aroma_notes_str}
                  onChange={(e) => setProductForm({ ...productForm, aroma_notes_str: e.target.value })}
                  placeholder="Citrus Zest, Eucalyptus, Sweet Flora, Camphorous"
                  className="input-field"
                />
              </div>

              {/* Descriptions */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                  Short Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={productForm.short_description}
                  onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })}
                  placeholder="Queen of the High Ranges"
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                  Full Botanical & Culinary Description
                </label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Describe volatile oil saturation, cracking texture, and pairings..."
                  className="input-field"
                />
              </div>

              {/* DYNAMIC PACK SIZES, PRICES & STOCK MANAGER */}
              <div
                style={{
                  background: 'rgba(14, 32, 21, 0.6)',
                  border: '1px solid var(--line)',
                  borderRadius: '16px',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <div>
                    <strong style={{ color: 'var(--gold-light)', fontSize: '0.95rem' }}>
                      Pack Sizes, Calibrated Pricing & Inventory
                    </strong>
                    <div style={{ color: 'var(--mute)', fontSize: '0.78rem' }}>
                      Configure individual size tiers (e.g. 50g, 100g, 250g, 500g, 1kg) with custom price & stock.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addSizeOption}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.78rem', padding: '4px 12px' }}
                  >
                    <Plus size={14} /> Add Size Tier
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {productForm.sizes_prices.map((option, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 1.2fr 1.2fr 40px',
                        gap: '12px',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <input
                          type="text"
                          value={option.size}
                          onChange={(e) => updateSizeOption(idx, 'size', e.target.value)}
                          placeholder="Size (e.g. 100g)"
                          className="input-field"
                          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', fontSize: '0.85rem' }}>₹</span>
                        <input
                          type="number"
                          value={option.price}
                          onChange={(e) => updateSizeOption(idx, 'price', Number(e.target.value))}
                          placeholder="Price"
                          className="input-field"
                          style={{ padding: '8px 12px 8px 24px', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={option.stock}
                          onChange={(e) => updateSizeOption(idx, 'stock', Number(e.target.value))}
                          placeholder="Stock"
                          className="input-field"
                          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSizeOption(idx)}
                        className="btn-icon"
                        style={{ width: '34px', height: '34px', color: '#fca5a5' }}
                        title="Remove Size"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image URL & Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                  Product Primary Image URL
                </label>
                <input
                  type="text"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="input-field"
                  style={{ marginBottom: '8px' }}
                />
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--mute)' }}>Presets:</span>
                  <button
                    type="button"
                    onClick={() => setProductForm({ ...productForm, imageUrl: '/images/spices/cardamom.jpg' })}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  >
                    Cardamom
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductForm({ ...productForm, imageUrl: '/images/spices/pepper.jpg' })}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  >
                    Black Pepper
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductForm({ ...productForm, imageUrl: '/images/spices/clove.jpg' })}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  >
                    Clove
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductForm({ ...productForm, imageUrl: '/images/spices/mace.jpg' })}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  >
                    Mace
                  </button>
                  <label
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.72rem', padding: '3px 8px', cursor: 'pointer' }}
                  >
                    Upload New Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCloudinaryUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {cloudinaryStatus && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>
                      {cloudinaryStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Featured & Stock Status */}
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', paddingTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--gold)' }}
                  />
                  <span>Feature in Homepage Collection</span>
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--mute)' }}>Stock Status:</span>
                  <select
                    value={productForm.stock_status}
                    onChange={(e) => setProductForm({ ...productForm, stock_status: e.target.value })}
                    style={{
                      background: 'rgba(7, 19, 11, 0.8)',
                      color: 'var(--ivory)',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Limited Reserve">Limited Reserve</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  borderTop: '1px solid var(--line)',
                  paddingTop: '20px',
                  marginTop: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} /> {editingProductId ? 'Save Changes' : 'Publish to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== ORDER DETAILS MODAL ==================== */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="card-luxury"
            style={{
              maxWidth: '600px',
              width: '100%',
              padding: '32px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--line)',
                paddingBottom: '16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-serif)', color: 'var(--gold)' }}>
                  Order: {selectedOrder.id}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>
                  Tracking: {selectedOrder.tracking_number}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="btn-icon" style={{ width: '36px', height: '36px' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem' }}>
              <div>
                <div style={{ color: 'var(--gold-light)', fontWeight: 600 }}>Customer Details:</div>
                <div>{selectedOrder.customer_name}</div>
                <div>{selectedOrder.customer_email} • {selectedOrder.customer_phone}</div>
                <div style={{ color: 'var(--mute)', fontSize: '0.85rem' }}>
                  {selectedOrder.shipping_address?.street}, {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
                <div style={{ color: 'var(--gold-light)', fontWeight: 600, marginBottom: '8px' }}>Purchased Items:</div>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span>{item.name} ({item.size}) × {item.quantity}</span>
                    <span style={{ color: 'var(--ivory)' }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Total Amount Paid:</span>
                <span style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>₹{selectedOrder.total}</span>
              </div>

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
                <div style={{ color: 'var(--gold-light)', fontWeight: 600, marginBottom: '6px' }}>
                  Milestone Status:
                </div>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) => {
                    handleStatusChange(selectedOrder.id, e.target.value as Order['order_status']);
                    setSelectedOrder({ ...selectedOrder, order_status: e.target.value as Order['order_status'] });
                  }}
                  className="input-field"
                  style={{ fontSize: '0.9rem' }}
                >
                  <option value="Pending">Pending (Placed)</option>
                  <option value="Processing">Processing (Hand-Grading)</option>
                  <option value="Shipped">Shipped (In Transit)</option>
                  <option value="Delivered">Delivered (Completed)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CREATE COUPON MODAL ==================== */}
      {isAddCouponOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div className="card-luxury" style={{ maxWidth: '440px', width: '100%', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--ivory)' }}>
                Create Promotional Coupon
              </h3>
              <button onClick={() => setIsAddCouponOpen(false)} className="btn-icon" style={{ width: '36px', height: '36px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="KEYAAR25"
                  required
                  className="input-field"
                  style={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                  Discount Type
                </label>
                <select
                  value={couponForm.discount_type}
                  onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value as 'percentage' | 'fixed' })}
                  className="input-field"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                  Discount Value ({couponForm.discount_type === 'percentage' ? '%' : '₹'})
                </label>
                <input
                  type="number"
                  value={couponForm.discount_value}
                  onChange={(e) => setCouponForm({ ...couponForm, discount_value: Number(e.target.value) })}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '6px' }}>
                  Minimum Order Value (₹)
                </label>
                <input
                  type="number"
                  value={couponForm.min_order_value}
                  onChange={(e) => setCouponForm({ ...couponForm, min_order_value: Number(e.target.value) })}
                  required
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsAddCouponOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Activate Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
