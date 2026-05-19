-- Pendo Stylish - Seed Data for Cloudflare D1
-- Run: npx wrangler d1 execute pendo-stylish-db --file=./seed.sql

-- Default Admin (PIN: 1234, bcrypt hash)
INSERT INTO workers (name, phone, role, pin, is_active) VALUES
  ('Admin', '0712345678', 'admin', '$2a$10$YourHashedPinHere123456789012345678901234567890', 1),
  ('Asha', '0711111111', 'fundi', '$2a$10$YourHashedPinHere111111111111111111111111111111', 1),
  ('Mwanaidi', '0722222222', 'fundi', '$2a$10$YourHashedPinHere222222222222222222222222222222', 1),
  ('Rehema', '0733333333', 'fundi', '$2a$10$YourHashedPinHere333333333333333333333333333333', 1);

-- Sample Services
INSERT INTO services (name, description, price, category, is_active) VALUES
  ('Sukuma Nywele', 'Kusukuma nywele za kawaida', 5000, 'nywele', 1),
  ('Sukuma Nywele (Box)', 'Kusukuma box braids', 15000, 'nywele', 1),
  ('Chana Nywele', 'Kuchana nywele', 3000, 'nywele', 1),
  ('Pedicure', 'Kutunza kucha za mguu', 8000, 'nails', 1),
  ('Manicure', 'Kutunza kucha za mkono', 7000, 'nails', 1),
  ('Nail Art', 'Sanaa ya kucha', 12000, 'nails', 1),
  ('Facial', 'Kusafisha na kutunza ngozi ya uso', 10000, 'nyuso', 1),
  ('Makeup', 'Kupakia makeup kamili', 20000, 'nyuso', 1),
  ('Massage', 'Massage ya mwili mzima', 25000, 'mwili', 1),
  ('Waxing', 'Kuondoa nywele za mwili', 15000, 'mwili', 1),
  ('Hair Treatment', 'Matibabu ya nywele', 18000, 'engine', 1),
  ('Hair Coloring', 'Kupaka rangi nywele', 22000, 'engine', 1);

-- Sample Todos
INSERT INTO todos (title, description, category, due_date, is_completed) VALUES
  ('Lipa Kodi ya Mwezi', 'Kodi ya duka mwezi Mei', 'kodi', '2026-05-31', 0),
  ('Nunua Shampoo', 'Shampoo 5 za salon', 'mahitaji', '2026-05-25', 0),
  ('Lipa Mkopo wa Benki', 'Marejesho ya mkopo', 'mikopo', '2026-05-28', 0);

-- Setup Vault (PIN: 0000)
INSERT INTO vault (bank_balance, cash_balance, mobile_balance, pin) VALUES
  (2500000, 150000, 450000, '$2a$10$YourHashedPinHere000000000000000000000000000000');
