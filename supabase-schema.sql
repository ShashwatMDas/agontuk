-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'customer',
  created_at timestamptz DEFAULT now()
);

-- Products table  
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  price real NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id) NOT NULL,
  messages jsonb NOT NULL,
  is_escalated boolean DEFAULT false,
  escalated_at timestamptz,
  avg_confidence real,
  created_at timestamptz DEFAULT now()
);

-- Escalations table
CREATE TABLE IF NOT EXISTS escalations (
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

-- RLS Policies for users table
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for products table (public read)
CREATE POLICY "Products are publicly readable" ON products
  FOR SELECT TO anon, authenticated USING (true);

-- RLS Policies for chats table
CREATE POLICY "Users can view own chats" ON chats
  FOR ALL USING (auth.uid()::text = user_id::text);

-- RLS Policies for escalations table
CREATE POLICY "Users can view own escalations" ON escalations
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Allow anonymous access for demo purposes (you may want to restrict this in production)
CREATE POLICY "Anonymous can create users" ON users
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anonymous can read products" ON products
  FOR SELECT TO anon USING (true);

CREATE POLICY "Anonymous can manage chats" ON chats
  FOR ALL TO anon USING (true);

CREATE POLICY "Anonymous can manage escalations" ON escalations
  FOR ALL TO anon USING (true);