import type { Metadata } from 'next';
import { Inter, Prompt } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['thai', 'latin'],
  variable: '--font-prompt',
});

export const metadata: Metadata = {
  title: 'Nightning POS - ระบบขายหน้าร้านเนื้อพรีเมียม',
  description: 'ระบบ Point of Sale สำหรับร้าน Nightning จำหน่ายเนื้อหมู เนื้อไก่ เนื้อปลา เนื้อวัว เนื้อจระเข้ เนื้อแกะ เนื้อวากิว เนื้อโกเบ เนื้อเป็ด เนื้อกระต่าย เนื้อปู เนื้อกุ้ง เนื้อปลาหมึก',
  keywords: ['Nightning', 'POS', 'Butchery', 'Meat Shop', 'Vercel', 'Supabase', 'ระบบขายหน้าร้าน'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${inter.variable} ${prompt.variable}`}>
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
