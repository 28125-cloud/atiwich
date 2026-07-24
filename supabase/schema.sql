-- =======================================================
-- SQL MIGRATION FOR NIGHTNING POS (SUPABASE DATABASE)
-- Copy and paste this script into Supabase SQL Editor
-- =======================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price_per_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stock_kg NUMERIC(10, 3) NOT NULL DEFAULT 0.000,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    icon_emoji VARCHAR(10) DEFAULT '🥩',
    image_url TEXT,
    description TEXT,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    vat NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
    cash_received NUMERIC(10, 2),
    change NUMERIC(10, 2),
    customer_name VARCHAR(255) DEFAULT 'ลูกค้าทั่วไป',
    status VARCHAR(50) NOT NULL DEFAULT 'completed'
);

-- 4. Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    price_per_kg NUMERIC(10, 2) NOT NULL,
    quantity_kg NUMERIC(10, 3) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Row Level Security (RLS) Policies (Enable public access for POS operations)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update products" ON public.products FOR ALL USING (true);

CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);

-- 6. Insert Initial Meat Items (13 Types for Nightning POS)
INSERT INTO public.products (id, code, name, name_en, category, price_per_kg, stock_kg, unit, icon_emoji, description, image_url, is_popular)
VALUES
('p-01', 'NM-001', 'เนื้อหมูสันคอ', 'Pork Collar Cut', 'red_meat', 180.00, 45.500, 'kg', '🐖', 'เนื้อหมูส่วนสันคอ แทรกไขมันนุ่ม ละมุน เหมาะสำหรับชาบู ย่าง และผัด', 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80', true),
('p-02', 'NM-002', 'เนื้อไก่อกนุ่ม', 'Tender Chicken Breast', 'poultry', 120.00, 60.000, 'kg', '🐓', 'เนื้ออกไก่สด ไร้หนัง โปรตีนสูง เหมาะสำหรับสายสุขภาพและอาหารคลีน', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80', false),
('p-03', 'NM-003', 'เนื้อปลาแซลมอนสด', 'Fresh Salmon Fillet', 'seafood', 490.00, 25.000, 'kg', '🐟', 'เนื้อปลาแซลมอนเกรดพรีเมียม แล่สดวันต่อวัน หวานมัน มันแทรกกำลังดี', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80', true),
('p-04', 'NM-004', 'เนื้อวัวริบอาย', 'Ribeye Beef Steak', 'red_meat', 420.00, 30.000, 'kg', '🐂', 'เนื้อวัวส่วนริบอาย นุ่มฉ่ำ ลายไขมันสวย ชิ้นหนากำลังดีสำหรับสเต๊ก', 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80', true),
('p-05', 'NM-005', 'เนื้อจระเข้ส่วนหาง', 'Crocodile Tail Meat', 'premium_exotic', 450.00, 18.000, 'kg', '🐊', 'เนื้อจระเข้ส่วนบ้องหาง คอเลสเตอรอลต่ำ เนื้อแน่นนุ่มคล้ายเนื้อไก่ผสมปลา', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', false),
('p-06', 'NM-006', 'เนื้อแกะช็อปพรีเมียม', 'Premium Lamb Chop', 'red_meat', 680.00, 15.500, 'kg', '🐑', 'ซี่โครงแกะนำเข้า เนื้อนุ่ม ไร้กลิ่นสาบ เหมาะสำหรับการย่างโรสแมรี่', 'https://images.unsplash.com/photo-1602881917760-7379db593981?auto=format&fit=crop&w=800&q=80', false),
('p-07', 'NM-007', 'เนื้อวากิว A5', 'Japanese Wagyu A5 Steak', 'premium_exotic', 2800.00, 10.000, 'kg', '🥩', 'เนื้อวากิวเกรด A5 ลายหินอ่อนละลายในปาก คุณภาพอันดับหนึ่งจากญี่ปุ่น', 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=800&q=80', true),
('p-08', 'NM-008', 'เนื้อโกเบพรีเมียม', 'Authentic Kobe Beef', 'premium_exotic', 3500.00, 8.000, 'kg', '🥩', 'สุดยอดเนื้อโกเบแท้ นุ่มละมุน ละลายในลิ้น รสชาติเข้มข้นเป็นเอกลักษณ์', 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=800&q=80', true),
('p-09', 'NM-009', 'เนื้อเป็ดอกเชอร์รี่', 'Cherry Duck Breast', 'poultry', 190.00, 35.000, 'kg', '🦆', 'อกเป็ดเชอร์รี่สด หนังบาง เนื้อแน่น รสชาติเข้มข้น เหมาะสำหรับอบย่าง', 'https://images.unsplash.com/photo-1514944288352-fffac99f0bdf?auto=format&fit=crop&w=800&q=80', false),
('p-10', 'NM-010', 'เนื้อกระต่ายอบเครื่องเทศ', 'Tender Rabbit Meat', 'premium_exotic', 390.00, 12.000, 'kg', '🐇', 'เนื้อกระต่ายอนามัย ไขมันต่ำ โปรตีนสูง นิยมในเมนูสไตล์ฝรั่งเศสและอิตาเลียน', 'https://images.unsplash.com/photo-1579631542720-3a87824fff86?auto=format&fit=crop&w=800&q=80', false),
('p-11', 'NM-011', 'เนื้อปูม้าก้อนแกะสด', 'Fresh Crab Jumbo Lump', 'seafood', 850.00, 14.000, 'kg', '🦀', 'เนื้อปูม้าแกะสำเร็จรูป ก้อนใหญ่ สดหวาน รสชาติธรรมชาติโดยตรงจากทะเล', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80', true),
('p-12', 'NM-012', 'เนื้อกุ้งลายเสือสด', 'Tiger Prawn Meat', 'seafood', 380.00, 28.000, 'kg', '🦐', 'เนื้อกุ้งลายเสือไซส์ใหญ่ เด้ง กรอบ หวาน สด สะอาด พร้อมปรุงทันที', 'https://images.unsplash.com/photo-1559737113-5a15775ae7be?auto=format&fit=crop&w=800&q=80', true),
('p-13', 'NM-013', 'เนื้อปลาหมึกหอมสด', 'Fresh Cut Squid', 'seafood', 290.00, 32.000, 'kg', '🦑', 'ปลาหมึกหอมเนื้อหนา นุ่มเด้ง หั่นชิ้นสวยงาม เหมาะสำหรับปิ้งย่างและผัด', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', false)
ON CONFLICT (code) DO UPDATE SET
name = EXCLUDED.name,
price_per_kg = EXCLUDED.price_per_kg,
stock_kg = EXCLUDED.stock_kg;
