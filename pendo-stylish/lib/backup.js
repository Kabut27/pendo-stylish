// lib/backup.js
// Inatoa nakala ya database kama JSON (jedwali kwa jedwali) - hii inatumika
// pamoja na schema.sql kutengeneza backup inayoweza kurudishwa (restore) kwenye
// server nyingine yoyote yenye PostgreSQL, bila "vendor lock-in".

import { query } from "./db";

const TABLES = [
  "users",
  "products",
  "services",
  "sales",
  "business_expenses",
  "gallery",
  "settings",
  "audit_log",
  "loyalty_customers",
];

export async function dumpDatabaseAsJson() {
  const dump = {};
  for (const table of TABLES) {
    const { rows } = await query(`SELECT * FROM ${table}`);
    dump[table] = rows;
  }
  return dump;
}
