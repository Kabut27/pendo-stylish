import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import bcrypt from "bcryptjs";

const client = new Database("local.db");
const db = drizzle(client, { schema });

async function seed() {
  console.log("Seeding Pendo Stylish...");

  // Create default admin
  const hashedPin = await bcrypt.hash("1234", 10);
  await db.insert(schema.workers).values({
    name: "Admin",
    phone: "0712345678",
    role: "admin",
    pin: hashedPin,
    isActive: true,
  });

  // Create sample fundis
  await db.insert(schema.workers).values([
    { name: "Asha", phone: "0711111111", role: "fundi", pin: await bcrypt.hash("1111", 10), isActive: true },
    { name: "Mwanaidi", phone: "0722222222", role: "fundi", pin: await bcrypt.hash("2222", 10), isActive: true },
    { name: "Rehema", phone: "0733333333", role: "fundi", pin: await bcrypt.hash("3333", 10), isActive: true },
  ]);

  // Create sample services
  await db.insert(schema.services).values([
    { name: "Sukuma Nywele", description: "Kusukuma nywele za kawaida", price: 5000, category: "nywele", isActive: true },
    { name: "Sukuma Nywele (Box)", description: "Kusukuma box braids", price: 15000, category: "nywele", isActive: true },
    { name: "Chana Nywele", description: "Kuchana nywele", price: 3000, category: "nywele", isActive: true },
    { name: "Pedicure", description: "Kutunza kucha za mguu", price: 8000, category: "nails", isActive: true },
    { name: "Manicure", description: "Kutunza kucha za mkono", price: 7000, category: "nails", isActive: true },
    { name: "Nail Art", description: "Sanaa ya kucha", price: 12000, category: "nails", isActive: true },
    { name: "Facial", description: "Kusafisha na kutunza ngozi ya uso", price: 10000, category: "nyuso", isActive: true },
    { name: "Makeup", description: "Kupakia makeup kamili", price: 20000, category: "nyuso", isActive: true },
    { name: "Massage", description: "Massage ya mwili mzima", price: 25000, category: "mwili", isActive: true },
    { name: "Waxing", description: "Kuondoa nywele za mwili", price: 15000, category: "mwili", isActive: true },
    { name: "Hair Treatment", description: "Matibabu ya nywele", price: 18000, category: "engine", isActive: true },
    { name: "Hair Coloring", description: "Kupaka rangi nywele", price: 22000, category: "engine", isActive: true },
  ]);

  // Create sample todos
  await db.insert(schema.todos).values([
    { title: "Lipa Kodi ya Mwezi", description: "Kodi ya duka mwezi Mei", category: "kodi", dueDate: "2026-05-31", isCompleted: false },
    { title: "Nunua Shampoo", description: "Shampoo 5 za salon", category: "mahitaji", dueDate: "2026-05-25", isCompleted: false },
    { title: "Lipa Mkopo wa Benki", description: "Marejesho ya mkopo", category: "mikopo", dueDate: "2026-05-28", isCompleted: false },
  ]);

  // Setup vault
  await db.insert(schema.vault).values({
    bankBalance: 2500000,
    cashBalance: 150000,
    mobileBalance: 450000,
    pin: await bcrypt.hash("0000", 10),
  });

  console.log("Seed completed successfully!");
  console.log("Default Admin: name='Admin', pin='1234'");
  console.log("Default Fundis: Asha/1111, Mwanaidi/2222, Rehema/3333");
  console.log("Default Vault PIN: 0000");
  client.close();
}

seed().catch(console.error);
