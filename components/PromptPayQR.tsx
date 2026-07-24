'use client';

import React from 'react';
import { QrCode, ShieldCheck, CheckCircle, RefreshCw } from 'lucide-react';

interface PromptPayQRProps {
  amount: number;
  promptPayId?: string;
  onSimulateSuccess?: () => void;
}

export const PromptPayQR: React.FC<PromptPayQRProps> = ({
  amount,
  promptPayId = '0812345678',
  onSimulateSuccess,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4">
      {/* PromptPay Header Banner */}
      <div className="flex items-center gap-2 bg-blue-950/80 border border-blue-800/80 px-3 py-1.5 rounded-full text-blue-300 text-xs font-semibold">
        <QrCode className="w-4 h-4 text-blue-400" />
        <span>สแกนชำระผ่าน PromptPay (พร้อมเพย์)</span>
      </div>

      {/* Simulated QR Box */}
      <div className="relative p-4 bg-white rounded-2xl shadow-2xl border-4 border-blue-600/30 flex flex-col items-center">
        {/* PromptPay Header Logo */}
        <div className="mb-2 flex items-center gap-1">
          <span className="text-[11px] font-bold tracking-widest text-blue-900 uppercase">PROMPTPAY</span>
        </div>

        {/* QR Pattern SVG */}
        <div className="w-48 h-48 bg-slate-900 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Decorative QR Lines */}
          <div className="absolute inset-2 border-2 border-dashed border-blue-500/30 rounded-lg" />
          <QrCode className="w-36 h-36 text-white" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/10 to-transparent pointer-events-none" />
        </div>

        {/* Store Name & Amount */}
        <div className="mt-3 text-center">
          <p className="text-xs font-bold text-slate-800">ร้าน Nightning (Nightning Meat Shop)</p>
          <p className="text-[11px] text-slate-500 font-mono">ID: {promptPayId}</p>
          <div className="mt-1 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">ยอดชำระ: </span>
            <span className="text-base font-black text-blue-900 font-mono">
              ฿{amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Instruction & Simulation Button */}
      <div className="space-y-2 w-full max-w-xs">
        <p className="text-[11px] text-slate-400">
          สแกนผ่านแอปพลิเคชันธนาคารทุกแห่ง รองรับระบบชำระเงินอัตโนมัติ
        </p>

        {onSimulateSuccess && (
          <button
            onClick={onSimulateSuccess}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all duration-200 active:scale-95"
          >
            <CheckCircle className="w-4 h-4" />
            <span>จำลองชำระเงินสำเร็จ (Simulate Success)</span>
          </button>
        )}
      </div>
    </div>
  );
};
