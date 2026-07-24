'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { ShoppingCart, Plus, Sparkles, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantityKg: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [selectedKg, setSelectedKg] = useState<number>(1);
  const isOutOfStock = product.stock_kg <= 0;
  const isLowStock = product.stock_kg > 0 && product.stock_kg <= 10;

  const handleQuickAdd = (kg: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onAddToCart(product, kg);
  };

  return (
    <div
      className={`group relative bg-slate-900/90 rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-2xl ${
        isOutOfStock
          ? 'border-slate-800 opacity-60'
          : 'border-slate-800 hover:border-amber-500/50 hover:shadow-red-950/30'
      }`}
    >
      {/* Product Image & Badges */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

        {/* Emojis & Badges Top Row */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 shadow-md">
            <span className="text-lg">{product.icon_emoji}</span>
            <span className="text-[11px] font-mono font-semibold text-slate-300 tracking-wider">
              {product.code}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {product.is_popular && (
              <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                <Sparkles className="w-3 h-3" />
                ยอดนิยม
              </span>
            )}

            {isOutOfStock ? (
              <span className="bg-red-950 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-800/80">
                หมด
              </span>
            ) : isLowStock ? (
              <span className="flex items-center gap-1 bg-amber-950 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-800/80">
                <AlertTriangle className="w-3 h-3" />
                เหลือน้อย
              </span>
            ) : null}
          </div>
        </div>

        {/* Stock status overlay text */}
        <div className="absolute bottom-2 right-3 font-mono text-xs text-slate-300 bg-slate-950/70 backdrop-blur-sm px-2 py-0.5 rounded-md border border-slate-800">
          คงเหลือ: <span className={isLowStock ? 'text-amber-400 font-bold' : 'text-slate-200'}>{product.stock_kg.toFixed(1)}</span> {product.unit}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-bold text-lg text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 font-mono line-clamp-1">{product.name_en}</p>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart Controls */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-400">ราคา / กก.</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-400">
                ฿{product.price_per_kg.toLocaleString('th-TH')}
              </span>
              <span className="text-xs text-slate-400">/kg</span>
            </div>
          </div>

          {/* Quick Weight Presets & Add Button */}
          {!isOutOfStock ? (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleQuickAdd(0.5, e)}
                className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="เพิ่ม 0.5 กก."
              >
                +0.5 kg
              </button>
              <button
                onClick={(e) => handleQuickAdd(1.0, e)}
                className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="เพิ่ม 1.0 กก."
              >
                +1 kg
              </button>
              <button
                onClick={(e) => handleQuickAdd(1.0, e)}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/40 transition-all duration-200 active:scale-95"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>ใส่ตะกร้า</span>
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full py-2 rounded-xl bg-slate-800 text-slate-500 font-semibold text-xs cursor-not-allowed border border-slate-800"
            >
              สินค้าหมดชั่วคราว
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
