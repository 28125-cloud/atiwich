'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { fetchProducts, updateProductStockInDB, saveProductToDB, resetLocalStorageData } from '@/lib/supabase';
import { Package, Plus, Search, Edit2, Save, RefreshCw, AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  // New Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newMeat, setNewMeat] = useState<Partial<Product>>({
    name: '',
    name_en: '',
    category: 'red_meat',
    price_per_kg: 200,
    stock_kg: 20,
    unit: 'kg',
    icon_emoji: '🥩',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80',
  });

  const loadInventory = async () => {
    setLoading(true);
    const data = await fetchProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleStartEdit = (p: Product) => {
    setEditingId(p.id);
    setEditPrice(p.price_per_kg);
    setEditStock(p.stock_kg);
  };

  const handleSaveEdit = async (p: Product) => {
    const updated: Product = {
      ...p,
      price_per_kg: editPrice,
      stock_kg: editStock,
    };
    await saveProductToDB(updated);
    setEditingId(null);
    await loadInventory();
  };

  const handleQuickAddStock = async (p: Product, addKg: number) => {
    const newStock = Math.max(0, p.stock_kg + addKg);
    await updateProductStockInDB(p.id, newStock);
    await loadInventory();
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeat.name) return;

    const newProd: Product = {
      id: `p-${Date.now()}`,
      code: `NM-${Math.floor(100 + Math.random() * 900)}`,
      name: newMeat.name,
      name_en: newMeat.name_en || newMeat.name,
      category: newMeat.category || 'red_meat',
      price_per_kg: Number(newMeat.price_per_kg) || 100,
      stock_kg: Number(newMeat.stock_kg) || 10,
      unit: newMeat.unit || 'kg',
      icon_emoji: newMeat.icon_emoji || '🥩',
      description: newMeat.description || '',
      image_url: newMeat.image_url || 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80',
      is_popular: false,
    };

    await saveProductToDB(newProd);
    setIsAddModalOpen(false);
    await loadInventory();
  };

  const handleResetData = async () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลสต็อกกลับไปเป็นค่าเริ่มต้น (13 รายการ) หรือไม่?')) {
      resetLocalStorageData();
      await loadInventory();
    }
  };

  const filtered = products.filter((p) => {
    const q = (search || '').toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.code || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-black text-white">จัดการคลังสินค้า & สต็อก (Inventory)</h1>
          </div>
          <p className="text-xs text-slate-400">
            ปรับเปลี่ยนราคาต่อกิโลกรัม เติมสต็อกสินค้า และเพิ่มรายการเนื้อชนิดใหม่ในร้าน Nightning
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetData}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="รีเซ็ตกลับเป็นข้อมูลเริ่มต้น"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>รีเซ็ตสต็อก</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-950/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มเนื้อชนิดใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาสินค้าในสต็อก..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <span className="text-xs text-slate-400 font-mono">
          รวม {filtered.length} รายการ
        </span>
      </div>

      {/* Products Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">รหัส / รูป</th>
                <th className="py-3 px-4">ชื่อรายการเนื้อ</th>
                <th className="py-3 px-4">หมวดหมู่</th>
                <th className="py-3 px-4">ราคา / กก.</th>
                <th className="py-3 px-4">สต็อกคงเหลือ</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((p) => {
                const isEditing = editingId === p.id;
                const isLow = p.stock_kg > 0 && p.stock_kg <= 10;
                const isOut = p.stock_kg <= 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Code & Image */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-800 bg-slate-950"
                        />
                        <div>
                          <span className="font-mono text-xs font-bold text-amber-400 block">{p.code}</span>
                          <span className="text-lg">{p.icon_emoji}</span>
                        </div>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-100 text-sm">{p.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{p.name_en}</p>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
                        {p.category}
                      </span>
                    </td>

                    {/* Price per Kg */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                          className="w-24 bg-slate-950 border border-amber-500 rounded px-2 py-1 font-mono text-xs text-amber-300"
                        />
                      ) : (
                        <span className="font-bold font-mono text-sm text-slate-100">
                          ฿{p.price_per_kg.toLocaleString('th-TH')}
                        </span>
                      )}
                    </td>

                    {/* Stock Kg & Quick Controls */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.5"
                          value={editStock}
                          onChange={(e) => setEditStock(parseFloat(e.target.value) || 0)}
                          className="w-24 bg-slate-950 border border-amber-500 rounded px-2 py-1 font-mono text-xs text-amber-300"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-sm text-slate-100">
                            {p.stock_kg.toFixed(1)} {p.unit}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleQuickAddStock(p, 5)}
                              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-emerald-400 border border-slate-700"
                              title="+5 kg"
                            >
                              +5kg
                            </button>
                            <button
                              onClick={() => handleQuickAddStock(p, 10)}
                              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-emerald-400 border border-slate-700"
                              title="+10 kg"
                            >
                              +10kg
                            </button>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {isOut ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-950 text-red-400 text-[10px] font-bold border border-red-800">
                          หมด
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-800">
                          เหลือน้อย
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                          พร้อมขาย
                        </span>
                      )}
                    </td>

                    {/* Edit Actions */}
                    <td className="py-3 px-4 text-right">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(p)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 ml-auto"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>บันทึก</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto border border-slate-700 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>แก้ไข</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-white">เพิ่มรายการเนื้อชนิดใหม่</h3>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">ชื่อเนื้อ (ภาษาไทย)</label>
                <input
                  type="text"
                  required
                  value={newMeat.name}
                  onChange={(e) => setNewMeat({ ...newMeat, name: e.target.value })}
                  placeholder="เช่น เนื้อนกกระจอกเทศ"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">ชื่อภาษาอังกฤษ</label>
                <input
                  type="text"
                  value={newMeat.name_en}
                  onChange={(e) => setNewMeat({ ...newMeat, name_en: e.target.value })}
                  placeholder="เช่น Ostrich Meat Cut"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">ราคาต่อกิโลกรัม (THB)</label>
                  <input
                    type="number"
                    required
                    value={newMeat.price_per_kg}
                    onChange={(e) => setNewMeat({ ...newMeat, price_per_kg: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">จำนวนสต็อกตั้งต้น (kg)</label>
                  <input
                    type="number"
                    required
                    value={newMeat.stock_kg}
                    onChange={(e) => setNewMeat({ ...newMeat, stock_kg: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold"
                >
                  บันทึกสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
