-- Pendo Stylish - Cloudflare D1 Database Schema
-- Run this in your Cloudflare D1 dashboard or wrangler

-- Workers / Wafanyakazi
CREATE TABLE IF NOT EXISTS workers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'fundi' CHECK(role IN ('admin', 'fundi')),
  pin TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Services / Huduma
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('nywele', 'nails', 'nyuso', 'mwili', 'engine')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Sales / Mauzo
CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'tigo_pesa', 'm_pesa', 'airtel_money')),
  customer_name TEXT,
  notes TEXT,
  date TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Expenses / Matumizi
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('bidhaa', 'kodi', 'meme', 'maji', 'mshahara', 'mikopo', 'nyingine')),
  date TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Todos / Vikumbusho
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK(category IN ('kodi', 'mikopo', 'mahitaji', 'mengine')),
  due_date TEXT,
  is_completed INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Loans / Mikopo
CREATE TABLE IF NOT EXISTS loans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lender_name TEXT NOT NULL,
  amount REAL NOT NULL,
  amount_paid REAL NOT NULL DEFAULT 0,
  interest_rate REAL DEFAULT 0,
  start_date TEXT NOT NULL,
  due_date TEXT,
  is_paid_off INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Vault / Private Vault
CREATE TABLE IF NOT EXISTS vault (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bank_balance REAL NOT NULL DEFAULT 0,
  cash_balance REAL NOT NULL DEFAULT 0,
  mobile_balance REAL NOT NULL DEFAULT 0,
  last_updated INTEGER DEFAULT (unixepoch()),
  pin TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_worker ON sales(worker_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(is_completed);
CREATE INDEX IF NOT EXISTS idx_loans_paid ON loans(is_paid_off);
