// scripts/restore.js
// Inarudisha (restore) data ya backup (folder yenye data/*.json) kwenye
// database mpya, tupu (ambayo tayari umeendesha schema.sql juu yake).
//
// MATUMIZI:
//   1. Hakikisha DATABASE_URL ipo (.env imejazwa) na umeshaendesha:
//        psql -d pendo_stylish -f schema.sql
//   2. node --env-file=.env scripts/restore.js /njia/ya/backup-folder-iliyofunguliwa
//
// Backup-folder inatakiwa iwe imefunguliwa (unzip) tayari na iwe na folder "data/".

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const ORDER = [
  "users",
  "products",
  "services",
  "sales",
  "business_expenses",
  "gallery",
  "settings",
  "loyalty_customers",
  "audit_log",
];

async function main() {
  const backupDir = process.argv[2];
  if (!backupDir) {
    console.error("Tumia hivi: node --env-file=.env scripts/restore.js /njia/ya/backup-folder");
    process.exit(1);
  }
  const dataDir = path.join(backupDir, "data");
  if (!fs.existsSync(dataDir)) {
    console.error(`Sikuona folder ya data: ${dataDir}`);
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL haijawekwa. Tumia: node --env-file=.env scripts/restore.js ...");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  for (const table of ORDER) {
    const filePath = path.join(dataDir, `${table}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`(ruka) ${table}.json haipo, naendelea...`);
      continue;
    }
    const rows = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!rows.length) {
      console.log(`(tupu) ${table}: hakuna data`);
      continue;
    }

    const columns = Object.keys(rows[0]);
    let inserted = 0;
    for (const row of rows) {
      const values = columns.map((c) => row[c]);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
      const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})
                   ON CONFLICT DO NOTHING`;
      try {
        await pool.query(sql, values);
        inserted += 1;
      } catch (err) {
        console.error(`Hitilafu kwenye ${table}:`, err.message);
      }
    }
    console.log(`✔ ${table}: safu ${inserted}/${rows.length} zimerudishwa.`);
  }

  await pool.end();
  console.log("\nRestore imekamilika. Angalia namba hapo juu zilingane na matarajio yako.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
