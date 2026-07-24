'use client';

import React, { useEffect } from 'react';
import { Order } from '@/lib/types';
import { Printer, CheckCircle, Flame, X, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen && order) {
      // Fire confetti burst upon successful receipt popup
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ef4444', '#10b981'],
      });
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.created_at).toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        
        {/* Header Action Row */}
        <div className="flex items-center justify-between no-print border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle className="w-5 h-5" />
            <span>ทำรายการสำเร็จ!</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRINTABLE RECEIPT CONTAINER */}
        <div
          id="printable-receipt"
          className="bg-white text-slate-900 p-6 rounded-2xl shadow-inner font-mono text-xs space-y-4 border border-slate-200 select-text"
        >
          {/* Receipt Store Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
            <div className="flex items-center justify-center gap-1 font-sans font-black text-lg text-slate-900">
              <Flame className="w-5 h-5 text-amber-600 inline" />
              <span>ร้าน NIGHTNING</span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              NIGHTNING PREMIUM MEAT & BUTCHERY
            </p>
            <p className="text-[10px] text-slate-500">โทร: 081-234-5678 | Tax ID: 010556599988</p>
          </div>

          {/* Receipt Meta Details */}
          <div className="space-y-1 text-[11px] text-slate-600 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span>เลขที่ออเดอร์:</span>
              <span className="font-bold text-slate-900">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span>วันที่:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span>ลูกค้า:</span>
              <span>{order.customer_name || 'ลูกค้าทั่วไป'}</span>
            </div>
            <div className="flex justify-between">
              <span>ชำระด้วย:</span>
              <span className="uppercase font-bold">
                {order.payment_method === 'cash'
                  ? 'เงินสด'
                  : order.payment_method === 'promptpay'
                  ? 'PromptPay'
                  : 'บัตรเครดิต'}
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2 py-1">
            <div className="grid grid-cols-12 font-bold border-b border-slate-300 pb-1 text-[10px] text-slate-500 uppercase">
              <span className="col-span-6">รายการสินค้า</span>
              <span className="col-span-3 text-right">น้ำหนัก</span>
              <span className="col-span-3 text-right">รวม (฿)</span>
            </div>

            {order.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 text-[11px] py-0.5">
                <div className="col-span-6 pr-1">
                  <p className="font-bold text-slate-800 line-clamp-1">{item.product_name}</p>
                  <p className="text-[9px] text-slate-400 font-sans">
                    ฿{item.price_per_kg}/kg
                  </p>
                </div>
                <span className="col-span-3 text-right text-slate-600">{item.quantity_kg} kg</span>
                <span className="col-span-3 text-right font-bold text-slate-900">
                  {item.total_price.toLocaleString('th-TH')}
                </span>
              </div>
            ))}
          </div>

          {/* Breakdown & Totals */}
          <div className="border-t border-dashed border-slate-300 pt-3 space-y-1 text-slate-700">
            <div className="flex justify-between">
              <span>ยอดรวม (Subtotal):</span>
              <span>฿{order.subtotal.toLocaleString('th-TH')}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>ส่วนลด (Discount):</span>
                <span>-฿{order.discount.toLocaleString('th-TH')}</span>
              </div>
            )}
            {order.vat > 0 && (
              <div className="flex justify-between">
                <span>VAT 7%:</span>
                <span>+฿{order.vat.toLocaleString('th-TH')}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline font-bold text-base text-slate-900 border-t border-slate-900 pt-1.5 mt-1">
              <span>ยอดสุทธิ (Total):</span>
              <span className="text-lg">฿{order.total.toLocaleString('th-TH')}</span>
            </div>

            {order.payment_method === 'cash' && (
              <div className="pt-2 text-[11px] space-y-0.5 border-t border-dashed border-slate-200">
                <div className="flex justify-between">
                  <span>รับเงินสด (Cash):</span>
                  <span>฿{(order.cash_received || order.total).toLocaleString('th-TH')}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900">
                  <span>เงินทอน (Change):</span>
                  <span>฿{(order.change || 0).toLocaleString('th-TH')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Thank You */}
          <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500 font-sans space-y-0.5">
            <p className="font-bold text-slate-700">ขอบคุณที่ใชับริการร้าน Nightning</p>
            <p>เนื้อสด คุณภาพดี ตัดใหม่วันต่อวัน</p>
          </div>
        </div>

        {/* Buttons for Action (No Print) */}
        <div className="flex items-center gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>พิมพ์ใบเสร็จ (Print)</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 hover:opacity-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>เริ่มรายการใหม่</span>
          </button>
        </div>

      </div>
    </div>
  );
};
