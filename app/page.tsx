'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, Order, ProductCategory } from '@/lib/types';
import { fetchProducts, saveOrderToDB } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/initialData';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { ReceiptModal } from '@/components/ReceiptModal';
import { Search, Flame, Sparkles, Filter, RefreshCw } from 'lucide-react';

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  
  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [includeVat, setIncludeVat] = useState<boolean>(false);

  // Modal Controls
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const query = (searchQuery || '').toLowerCase();
      const matchesSearch =
        (p.name || '').toLowerCase().includes(query) ||
        (p.name_en || '').toLowerCase().includes(query) ||
        (p.code || '').toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart Operations
  const handleAddToCart = (product: Product, quantityKg: number = 1.0) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newKg = Math.min(product.stock_kg, existing.quantity_kg + quantityKg);
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity_kg: Number(newKg.toFixed(3)),
                total_price: Math.round(newKg * product.price_per_kg),
              }
            : item
        );
      } else {
        const newKg = Math.min(product.stock_kg, quantityKg);
        return [
          ...prev,
          {
            product,
            quantity_kg: Number(newKg.toFixed(3)),
            total_price: Math.round(newKg * product.price_per_kg),
          },
        ];
      }
    });
  };

  const handleUpdateCartQuantity = (productId: string, newKg: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    if (newKg <= 0) {
      handleRemoveCartItem(productId);
      return;
    }

    const maxKg = Math.min(prod.stock_kg, newKg);
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity_kg: Number(maxKg.toFixed(3)),
              total_price: Math.round(maxKg * prod.price_per_kg),
            }
          : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setDiscount(0);
  };

  // Checkout Calculations
  const subtotal = cartItems.reduce((sum, i) => sum + i.total_price, 0);
  const vatAmount = includeVat ? Math.round(subtotal * 0.07) : 0;
  const finalTotal = Math.max(0, subtotal - discount + vatAmount);

  // Complete Order Callback
  const handleCompleteOrder = async (order: Order) => {
    await saveOrderToDB(order);
    setActiveOrder(order);
    setIsCheckoutOpen(false);
    setIsReceiptOpen(true);
    setCartItems([]);
    setDiscount(0);
    // Reload products to reflect deducted stock
    await loadData();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT 2 COLUMNS: PRODUCT LISTING & SEARCH */}
      <div className="lg:col-span-2 space-y-5">
        
        {/* Banner Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 border border-slate-800 p-6 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded-md bg-amber-500/20 text-amber-400">
                  <Flame className="w-5 h-5 animate-bounce" />
                </span>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  ร้าน NIGHTNING MEAT STORE
                </h1>
              </div>
              <p className="text-xs text-slate-300">
                จำหน่ายเนื้อสดเกรดพรีเมียม ตัดแต่งชิ้นต่อชิ้น ควบคุมคุณภาพมาตรฐานสูงสุด
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 text-xs font-mono">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>สินค้าพร้อมขาย: <strong className="text-amber-400">{products.length}</strong> ชนิด</span>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Filter Controls: Search & Categories */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อเนื้อ (หมู, วัว, วากิว, โกเบ, จระเข้ ฯลฯ) หรือรหัส..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white"
                >
                  ล้าง
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadData}
              className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-slate-700 transition-colors flex items-center gap-2 text-xs font-semibold"
              title="โหลดข้อมูลใหม่"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">รีเฟรช</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 border ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white border-amber-500 shadow-md shadow-red-950/40'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-72 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800/50"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500">
            <Filter className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="font-bold text-slate-400">ไม่พบรายการเนื้อตรงตามคำค้นหา</p>
            <p className="text-xs text-slate-500 mt-1">ลองเปลี่ยนคำค้นหา หรือสลับหมวดหมู่</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: ACTIVE CART DRAWER */}
      <div className="lg:col-span-1">
        <CartDrawer
          items={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onClearCart={handleClearCart}
          discount={discount}
          onSetDiscount={setDiscount}
          includeVat={includeVat}
          onToggleVat={setIncludeVat}
          onProceedToCheckout={() => setIsCheckoutOpen(true)}
        />
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        subtotal={subtotal}
        discount={discount}
        vat={vatAmount}
        total={finalTotal}
        onCompleteOrder={handleCompleteOrder}
      />

      {/* Receipt Printable Modal */}
      <ReceiptModal
        order={activeOrder}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />

    </div>
  );
}
