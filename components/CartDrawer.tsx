'use client';

import React from 'react';
import { CartItem } from '@/lib/types';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Sparkles, AlertCircle } from 'lucide-react';

interface CartDrawerProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, newKg: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  discount: number;
  onSetDiscount: (discount: number) => void;
  includeVat: boolean;
  onToggleVat: (include: boolean) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  discount,
  onSetDiscount,
  includeVat,
  onToggleVat,
  onProceedToCheckout,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const vatAmount = includeVat ? Math.round(subtotal * 0.07) : 0;
  const finalTotal = Math.max(0, subtotal - discount + vatAmount);

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 flex flex-col h-[calc(100vh-6.5rem)] sticky top-20 shadow-2xl backdrop-blur-md">
      
      {/* Cart Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-base">รายการสั่งซื้อ (Cart)</h2>
            <p className="text-xs text-slate-400 font-mono">
              {items.length} รายการ ({items.reduce((s, i) => s + i.quantity_kg, 0).toFixed(1)} kg)
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-red-950/40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ล้างตะกร้า</span>
          </button>
        )}
      </div>

      {/* Cart Item List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 custom-scrollbar pr-1">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-3">
              <ShoppingCart className="w-8 h-8 text-slate-600" />
            </div>
            <p className="font-semibold text-slate-400 text-sm">ยังไม่มีสินค้าในตะกร้า</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              เลือกเนื้อพรีเมียมจากรายการทางซ้ายมือเพื่อเพิ่มเข้าสู่รายการขาย
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.product.id}
              className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              {/* Meat Info */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="text-xl p-1.5 bg-slate-900 rounded-lg border border-slate-800">
                  {item.product.icon_emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-slate-200 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-[11px] text-amber-400 font-mono">
                    ฿{item.product.price_per_kg}/kg
                  </p>
                </div>
              </div>

              {/* Weight Modifier Controls */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity_kg - 0.1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={item.quantity_kg}
                    onChange={(e) =>
                      onUpdateQuantity(item.product.id, parseFloat(e.target.value) || 0.1)
                    }
                    className="w-12 text-center bg-transparent text-xs font-bold font-mono text-amber-300 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 pr-1">kg</span>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity_kg + 0.1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="text-right min-w-[70px]">
                  <p className="font-bold text-sm text-slate-100 font-mono">
                    ฿{item.total_price.toLocaleString('th-TH')}
                  </p>
                </div>

                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                  title="ลบรายการ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Calculations */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        {/* Discount & VAT Toggles */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-slate-400 text-[11px] mb-1 block">ส่วนลด (THB)</label>
            <input
              type="number"
              min="0"
              value={discount || ''}
              placeholder="0"
              onChange={(e) => onSetDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 text-[11px] mb-1 block">ภาษีมูลค่าเพิ่ม (VAT)</label>
            <button
              type="button"
              onClick={() => onToggleVat(!includeVat)}
              className={`w-full py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors ${
                includeVat
                  ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <span>VAT 7%</span>
              <span className="font-mono">{includeVat ? 'เปิด' : 'ปิด'}</span>
            </button>
          </div>
        </div>

        {/* Calculation Table */}
        <div className="space-y-1.5 text-xs text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800 font-mono">
          <div className="flex justify-between">
            <span>ยอดรวมสินค้า (Subtotal)</span>
            <span>฿{subtotal.toLocaleString('th-TH')}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>ส่วนลด (Discount)</span>
              <span>-฿{discount.toLocaleString('th-TH')}</span>
            </div>
          )}
          {includeVat && (
            <div className="flex justify-between text-slate-300">
              <span>ภาษี (VAT 7%)</span>
              <span>+฿{vatAmount.toLocaleString('th-TH')}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 text-base font-bold text-white">
            <span className="font-sans text-sm">ยอดสุทธิ (Total)</span>
            <span className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-400">
              ฿{finalTotal.toLocaleString('th-TH')}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          disabled={items.length === 0}
          onClick={onProceedToCheckout}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all duration-200 ${
            items.length > 0
              ? 'bg-gradient-to-r from-amber-500 via-red-600 to-amber-500 hover:from-amber-600 hover:to-red-700 text-white shadow-red-950/60 active:scale-98 cursor-pointer animate-gradient'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span>ชำระเงิน (฿{finalTotal.toLocaleString('th-TH')})</span>
        </button>
      </div>

    </div>
  );
};
