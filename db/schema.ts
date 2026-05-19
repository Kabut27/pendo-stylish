import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

// Workers / Wafanyakazi
export const workers = sqliteTable("workers", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role", { enum: ["admin", "fundi"] }).default("fundi").notNull(),
  pin: text("pin").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Worker = typeof workers.$inferSelect;
export type InsertWorker = typeof workers.$inferInsert;

// Services / Huduma
export const services = sqliteTable("services", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  category: text("category", { enum: ["nywele", "nails", "nyuso", "mwili", "engine"] }).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

// Sales / Mauzo
export const sales = sqliteTable("sales", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  workerId: integer("worker_id").notNull(),
  serviceId: integer("service_id").notNull(),
  amount: real("amount").notNull(),
  paymentMethod: text("payment_method", { enum: ["cash", "tigo_pesa", "m_pesa", "airtel_money"] }).notNull(),
  customerName: text("customer_name"),
  notes: text("notes"),
  date: text("date").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

// Expenses / Matumizi
export const expenses = sqliteTable("expenses", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  category: text("category", { enum: ["bidhaa", "kodi", "meme", "maji", "mshahara", "mikopo", "nyingine"] }).notNull(),
  date: text("date").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

// Todos / Vikumbusho
export const todos = sqliteTable("todos", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category", { enum: ["kodi", "mikopo", "mahitaji", "mengine"] }).notNull(),
  dueDate: text("due_date"),
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Todo = typeof todos.$inferSelect;
export type InsertTodo = typeof todos.$inferInsert;

// Loans / Mikopo marejesho
export const loans = sqliteTable("loans", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  lenderName: text("lender_name").notNull(),
  amount: real("amount").notNull(),
  amountPaid: real("amount_paid").default(0).notNull(),
  interestRate: real("interest_rate").default(0),
  startDate: text("start_date").notNull(),
  dueDate: text("due_date"),
  isPaidOff: integer("is_paid_off", { mode: "boolean" }).default(false).notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Loan = typeof loans.$inferSelect;
export type InsertLoan = typeof loans.$inferInsert;

// Vault / Private Vault
export const vault = sqliteTable("vault", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  bankBalance: real("bank_balance").default(0).notNull(),
  cashBalance: real("cash_balance").default(0).notNull(),
  mobileBalance: real("mobile_balance").default(0).notNull(),
  lastUpdated: integer("last_updated", { mode: "timestamp" }).$defaultFn(() => new Date()),
  pin: text("pin").notNull(),
});

export type Vault = typeof vault.$inferSelect;
export type InsertVault = typeof vault.$inferInsert;

// Sessions / Login sessions
export const sessions = sqliteTable("sessions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  workerId: integer("worker_id").notNull(),
  token: text("token").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;
