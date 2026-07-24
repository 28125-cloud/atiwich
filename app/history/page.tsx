'use client';

import React, { useState, useEffect } from 'react';
import { Order } from '@/lib/types';
import { fetchOrders } from '@/lib/supabase';
import { ReceiptModal } from '@/components/ReceiptModal';
import { BarChart3, TrendingUp, ShoppingBag, DollarSign, Calendar, Eye, Printer, Search, RefreshCw } from 'lucide-react';

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

  const loadHistory = async () => {
    setLoading(true);
    const data = await fetchOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const q = (search || '').toLowerCase();
    return (
      (o.order_number || '').toLowerCase().includes(q) ||
      (o.customer_name || '').toLowerCase().includes(q)
    );
  });

  // Calculations for Sales Dashboard
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const handleViewReceipt = (o: Order) => {
    setSelectedOrder(o);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-black text-white">รายงานการขาย & ประวัติออเดอร์</h1>
          </div>
          <p className="text-xs text-slate-400">
            ดูสรุปยอดขายทั้งหมด ยอดสั่งซื้อรายวัน และดูใบเสร็จย้อนหลังของร้าน Nightning
          </p>
        </div>

        <button
          onClick={loadHistory}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรช</span>
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 font-medium">ยอดขายรวมทั้งหมด</span>
            <p className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-400 mt-1">
              ฿{totalRevenue.toLocaleString('th-TH')}
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 font-medium">จำนวนออเดอร์ทั้งหมด</span>
            <p className="text-2xl font-black font-mono text-slate-100 mt-1">
              {totalOrders} <span className="text-xs font-normal text-slate-400">รายการ</span>
            </p>
          </div>
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 font-medium">ยอดขายเฉลี่ย / ออเดอร์</span>
            <p className="text-2xl font-black font-mono text-emerald-400 mt-1">
              ฿{avgOrderValue.toLocaleString('th-TH')}
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
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
            placeholder="ค้นหาตามเลขที่ออเดอร์ หรือชื่อลูกค้า..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">เลขที่ออเดอร์</th>
                <th className="py-3 px-4">วันที่ / เวลา</th>
                <th className="py-3 px-4">ลูกค้า</th>
                <th className="py-3 px-4">จำนวนรายการ</th>
                <th className="py-3 px-4">ช่องทางชำระเงิน</th>
                <th className="py-3 px-4">ยอดรวมสุทธิ</th>
                <th className="py-3 px-4 text-right">ใบเสร็จ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    ยังไม่มีประวัติการขายในระบบ
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {o.order_number}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(o.created_at).toLocaleString('th-TH', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      {o.customer_name || 'ลูกค้าทั่วไป'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {o.items?.length || 0} รายการ
                    </td>
                    <td className="py-3 px-4 uppercase font-bold text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                        {o.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sm text-slate-100">
                      ฿{o.total.toLocaleString('th-TH')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleViewReceipt(o)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto border border-slate-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>ดูใบเสร็จ</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        order={selectedOrder}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />

    </div>
  );
}
