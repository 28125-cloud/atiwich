export type ProductCategory = 
  | 'all'
  | 'red_meat' // เนื้อหมู, เนื้อวัว, เนื้อแกะ
  | 'poultry'  // เนื้อไก่, เนื้อเป็ด
  | 'seafood'  // เนื้อปลา, เนื้อปู, เนื้อกุ้ง, เนื้อปลาหมึก
  | 'premium_exotic'; // เนื้อวากิว, เนื้อโกเบ, เนื้อจระเข้, เนื้อกระต่าย

export interface Product {
  id: string;
  name: string;
  name_en: string;
  category: ProductCategory;
  price_per_kg: number;
  stock_kg: number;
  unit: string; // e.g. "kg"
  image_url: string;
  description: string;
  icon_emoji: string;
  is_popular?: boolean;
  code: string;
}

export interface CartItem {
  product: Product;
  quantity_kg: number; // weight or quantity
  total_price: number;
}

export type PaymentMethod = 'cash' | 'promptpay' | 'credit_card';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  price_per_kg: number;
  quantity_kg: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  created_at: string;
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  payment_method: PaymentMethod;
  cash_received?: number;
  change?: number;
  customer_name?: string;
  items: OrderItem[];
  status: 'completed' | 'cancelled';
}

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  name_en: string;
  icon: string;
}
