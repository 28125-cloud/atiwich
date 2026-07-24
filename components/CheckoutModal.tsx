'use client';

import React, { useState } from 'react';
import { CartItem, PaymentMethod, Order } from '@/lib/types';
import { X, Banknote, QrCode, CreditCard, CheckCircle2, DollarSign, User, FileText } from 'lucide-react';
import { PromptPayQR } from './PromptPayQR';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  onCompleteOrder: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  discount,
  vat,
  total,
  onCompleteOrder,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('ลูกค้าทั่วไป');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const cashNum = parseFloat(cashReceived) || 0;
  const change = Math.max(0, cashNum - total);
  const isCashInsufficient = paymentMethod === 'cash' && cashNum < total;

  const handleSelectPresetCash = (amount: number) => {
    setCashReceived(amount.toString());
  };

  const handleExactCash = () => {
    setCashReceived(total.toString());
  };

  const handleConfirmPayment = () => {
    if (paymentMethod === 'cash' && isCashInsufficient) {
      return;
    }

    setIsProcessing(true);

    const orderNumber = `NM-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      created_at: new Date().toISOString(),
      subtotal,
      discount,
      vat,
      total,
      payment_method: paymentMethod,
      cash_received: paymentMethod === 'cash' ? cashNum : total,
      change: paymentMethod === 'cash' ? change : 0,
      customer_name: customerName || 'ลูกค้าทั่วไป',
      status: 'completed',
      items: items.map((i) => ({
        product_id: i.product.id,
        product_name: i.product.name,
        price_per_kg: i.product.price_per_kg,
        quantity_kg: i.quantity_kg,
        total_price: i.total_price,
      })),
    };

    setTimeout(() => {
      setIsProcessing(false);
      onCompleteOrder(newOrder);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-bold text-xl text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              <span>ชำระเงิน (Checkout)</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              ร้าน Nightning Meat Shop | ยอดสุทธิ ฿{total.toLocaleString('th-TH')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Name Input */}
        <div className="my-4">
          <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>ชื่อลูกค้า / หมายเลขโต๊ะ (Optional)</span>
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="ลูกค้าทั่วไป"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <button
            onClick={() => setPaymentMethod('cash')}
            className={`py-3 px-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1.5 border transition-all ${
              paymentMethod === 'cash'
                ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white border-amber-500 shadow-lg shadow-red-950/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            <Banknote className="w-5 h-5" />
            <span>เงินสด (Cash)</span>
          </button>

          <button
            onClick={() => setPaymentMethod('promptpay')}
            className={`py-3 px-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1.5 border transition-all ${
              paymentMethod === 'promptpay'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-lg shadow-blue-950/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span>PromptPay QR</span>
          </button>

          <button
            onClick={() => setPaymentMethod('credit_card')}
            className={`py-3 px-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1.5 border transition-all ${
              paymentMethod === 'credit_card'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-500 shadow-lg shadow-purple-950/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>บัตรเครดิต</span>
          </button>
        </div>

        {/* Dynamic Payment Content View */}
        {paymentMethod === 'cash' && (
          <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">จำนวนเงินที่รับมา (THB)</label>
                <button
                  onClick={handleExactCash}
                  className="text-xs text-amber-400 hover:underline font-mono"
                >
                  พอดีเป๊ะ (฿{total})
                </button>
              </div>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder={`ป้อนจำนวนเงิน (อย่างน้อย ฿${total})`}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xl font-bold font-mono text-amber-300 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Cash Presets */}
            <div>
              <span className="text-[11px] text-slate-400 mb-1.5 block">ปุ่มลัดธนบัตร:</span>
              <div className="flex flex-wrap gap-2">
                {[100, 500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleSelectPresetCash(amt)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-mono font-semibold transition-colors"
                  >
                    ฿{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Change Display */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">เงินทอน (Change):</span>
              <span
                className={`text-xl font-black font-mono ${
                  isCashInsufficient ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {isCashInsufficient
                  ? `ขาดอีก ฿${(total - cashNum).toLocaleString('th-TH')}`
                  : `฿${change.toLocaleString('th-TH')}`}
              </span>
            </div>
          </div>
        )}

        {paymentMethod === 'promptpay' && (
          <PromptPayQR
            amount={total}
            onSimulateSuccess={handleConfirmPayment}
          />
        )}

        {paymentMethod === 'credit_card' && (
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-950/80 border border-purple-800 text-purple-400 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-200">พร้อมแตะ / เสียบบัตรเครดิตที่เครื่อง EDC</h4>
            <p className="text-xs text-slate-400">
              ยอดชำระ <span className="text-amber-400 font-bold font-mono">฿{total.toLocaleString('th-TH')}</span>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 font-bold text-sm transition-colors"
          >
            ยกเลิก
          </button>
          
          <button
            disabled={isProcessing || (paymentMethod === 'cash' && isCashInsufficient)}
            onClick={handleConfirmPayment}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
              isProcessing || (paymentMethod === 'cash' && isCashInsufficient)
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                : 'bg-gradient-to-r from-amber-500 via-red-600 to-amber-500 text-white hover:opacity-95 shadow-red-950/50 active:scale-95'
            }`}
          >
            {isProcessing ? (
              <span>กำลังบันทึกข้อมูล...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>ยืนยันการชำระเงิน</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
