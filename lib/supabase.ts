import { createClient } from '@supabase/supabase-js';
import { Product, Order } from './types';
import { INITIAL_PRODUCTS } from './initialData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const STORAGE_KEYS = {
  PRODUCTS: 'nightning_pos_products_v1',
  ORDERS: 'nightning_pos_orders_v1',
};

// --- DATA ACCESS LAYER ---

export async function fetchProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('code', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch (e) {
      console.warn('Supabase fetch error, falling back to local data:', e);
    }
  }

  // Fallback to LocalStorage or Initial Seed Data
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse local products storage:', err);
      }
    }
    // Initialize LocalStorage with seed data
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }

  return INITIAL_PRODUCTS;
}

export async function updateProductStockInDB(productId: string, newStockKg: number): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_kg: newStockKg })
        .eq('id', productId);
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase update stock error:', e);
    }
  }

  // LocalStorage Fallback
  if (typeof window !== 'undefined') {
    const products = await fetchProducts();
    const updated = products.map((p) =>
      p.id === productId ? { ...p, stock_kg: Math.max(0, newStockKg) } : p
    );
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    return true;
  }
  return false;
}

export async function saveProductToDB(product: Product): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').upsert([product]);
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase upsert error:', e);
    }
  }

  // LocalStorage Fallback
  if (typeof window !== 'undefined') {
    const products = await fetchProducts();
    const existsIndex = products.findIndex((p) => p.id === product.id);
    let updated: Product[];
    if (existsIndex >= 0) {
      updated = [...products];
      updated[existsIndex] = product;
    } else {
      updated = [product, ...products];
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    return true;
  }
  return false;
}

export async function fetchOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Order[];
      }
    } catch (e) {
      console.warn('Supabase fetch orders error:', e);
    }
  }

  // LocalStorage Fallback
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
  }
  return [];
}

export async function saveOrderToDB(order: Order): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Insert order
      const { error: orderErr } = await supabase.from('orders').insert([{
        id: order.id,
        order_number: order.order_number,
        created_at: order.created_at,
        subtotal: order.subtotal,
        discount: order.discount,
        vat: order.vat,
        total: order.total,
        payment_method: order.payment_method,
        cash_received: order.cash_received,
        change: order.change,
        customer_name: order.customer_name || 'ลูกค้าทั่วไป',
        status: order.status,
      }]);

      if (!orderErr) {
        // 2. Insert order items
        const orderItemsPayload = order.items.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          price_per_kg: item.price_per_kg,
          quantity_kg: item.quantity_kg,
          total_price: item.total_price,
        }));
        await supabase.from('order_items').insert(orderItemsPayload);

        // 3. Deduct Stock
        for (const item of order.items) {
          const { data: prod } = await supabase.from('products').select('stock_kg').eq('id', item.product_id).single();
          if (prod) {
            const newStock = Math.max(0, (prod.stock_kg || 0) - item.quantity_kg);
            await supabase.from('products').update({ stock_kg: newStock }).eq('id', item.product_id);
          }
        }
        return true;
      }
    } catch (e) {
      console.warn('Supabase save order error:', e);
    }
  }

  // LocalStorage Fallback
  if (typeof window !== 'undefined') {
    const orders = await fetchOrders();
    const updatedOrders = [order, ...orders];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));

    // Deduct local stock
    const products = await fetchProducts();
    const updatedProducts = products.map((prod) => {
      const soldItem = order.items.find((i) => i.product_id === prod.id);
      if (soldItem) {
        return {
          ...prod,
          stock_kg: Math.max(0, Number((prod.stock_kg - soldItem.quantity_kg).toFixed(3))),
        };
      }
      return prod;
    });
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
    return true;
  }

  return false;
}

export function resetLocalStorageData() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
  }
}
