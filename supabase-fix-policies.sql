-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Products are publicly readable" ON products;
DROP POLICY IF EXISTS "Users can view own chats" ON chats;
DROP POLICY IF EXISTS "Users can view own escalations" ON escalations;

-- Allow anonymous access for demo purposes (since we're not using Supabase Auth)
CREATE POLICY "Allow all operations for demo" ON users
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for demo" ON products
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for demo" ON chats
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for demo" ON escalations
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);