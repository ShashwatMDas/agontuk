-- Complete Supabase setup for customer support app
-- Run this entire script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS escalations CASCADE;
DROP TABLE IF EXISTS chats CASCADE;  
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'customer',
  created_at timestamptz DEFAULT now()
);

-- Products table  
CREATE TABLE products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  price real NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL
);

-- Chats table
CREATE TABLE chats (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id) NOT NULL,
  messages jsonb NOT NULL,
  is_escalated boolean DEFAULT false,
  escalated_at timestamptz,
  avg_confidence real,
  created_at timestamptz DEFAULT now()
);

-- Escalations table
CREATE TABLE escalations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id uuid REFERENCES chats(id) NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  user_email text NOT NULL,
  last_message text NOT NULL,
  confidence real NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow all operations for demo" ON users;
DROP POLICY IF EXISTS "Allow all operations for demo" ON products;
DROP POLICY IF EXISTS "Allow all operations for demo" ON chats;
DROP POLICY IF EXISTS "Allow all operations for demo" ON escalations;

-- Simple permissive policies for demo
CREATE POLICY "Allow all operations for demo" ON users
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for demo" ON products
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for demo" ON chats
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for demo" ON escalations
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Insert demo users
INSERT INTO users (email, password, role) VALUES
  ('customer@demo.com', 'password', 'customer'),
  ('admin@demo.com', 'password', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert demo products
INSERT INTO products (name, description, price, image_url, category) VALUES
  ('Premium Wireless Headphones', 'Active noise cancellation, 30hr battery', 199.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 'Electronics'),
  ('Ultra-thin Laptop', 'Intel i7, 16GB RAM, 512GB SSD', 1299.99, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 'Computers'),
  ('Smart Fitness Watch', 'Heart rate monitor, GPS, waterproof', 299.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 'Wearables'),
  ('Professional Camera', '24MP, 4K video, weather sealed', 899.99, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 'Photography'),
  ('Gaming Mouse Pro', 'RGB lighting, 12000 DPI, wireless', 89.99, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 'Gaming'),
  ('Flagship Smartphone', '128GB, Triple camera, 5G ready', 799.99, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 'Mobile');