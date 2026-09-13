// scripts/seed.js
// Inatengeneza data ya mfano ili uweze kuona mfumo ukifanya kazi kabla ya
// kuweka data halisi. SALAMA: Weka password mpya kwa kila mtumiaji mara
// unapokwenda "live" - hizi ni za mfano tu.
//
// MATUMIZI:
//   node --env-file=.env scripts/seed.js

const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const STAFF = [
  { full_name: "Neema Mwakalinga", username: "neema", skills: ["Nywele", "Braids"] },
  { full_name: "Amina Said", username: "amina", skills: ["Kucha", "Pedicure"] },
  { full_name: "Zawadi John", username: "zawadi", skills: ["Nywele", "Rangi ya Nywele"] },
  { full_name: "Happiness Msigwa", username: "happiness", skills: ["Makeup", "Kope"] },
  { full_name: "Grace Mtei", username: "grace", skills: ["Kucha", "Nail Art"] },
  { full_name: "Faraja Kimaro", username: "faraja", skills: ["Braids", "Weaving"] },
];

const PRODUCTS = [
  { name: "Cream ya Ngozi - Glow", price: 15000, description: "Cream ya kuangazia ngozi, inafaa ngozi zote.", badge: "inayopendwa" },
  { name: "Mafuta ya Nywele - Silk", price: 12000, description: "Mafuta ya asili ya kulainisha na kuota nywele.", badge: "mpya" },
  { name: "Wig ya Human Hair 20\"", price: 180000, description: "Wig halisi ya nywele za asili, rangi nyeusi.", badge: null },
  { name: "Set ya Nail Polish (6pcs)", price: 20000, description: "Rangi mbalimbali za kisasa.", badge: null },
];

const SERVICES = [
  { name: "Kusuka Braids", price: 25000, description: "Muda: masaa 2-3" },
  { name: "Kupaka Rangi ya Nywele", price: 40000, description: "Inajumuisha rangi na huduma ya nywele" },
  { name: "Manicure na Pedicure", price: 20000, description: "Muda: dakika 60" },
  { name: "Makeup ya Harusi/Tukio", price: 60000, description: "Inajumuisha kope za bandia" },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL haijawekwa. Tumia: node --env-file=.env scripts/seed.js");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log("Natengeneza akaunti ya Mmiliki (admin)...");
  const adminPasswordHash = await bcrypt.hash("Pendo@2026", 10);
  await pool.query(
    `INSERT INTO users (username, password_hash, role, full_name, active)
     VALUES ('admin', $1, 'admin', 'Mmiliki Pendo Stylish', true)
     ON CONFLICT (username) DO NOTHING`,
    [adminPasswordHash]
  );

  console.log("Natengeneza wafanyakazi wa mfano...");
  const staffPasswordHash = await bcrypt.hash("Staff@2026", 10);
  for (const s of STAFF) {
    await pool.query(
      `INSERT INTO users (username, password_hash, role, full_name, skills, active)
       VALUES ($1, $2, 'staff', $3, $4, true)
       ON CONFLICT (username) DO NOTHING`,
      [s.username, staffPasswordHash, s.full_name, s.skills]
    );
  }

  console.log("Naongeza bidhaa za mfano...");
  for (const p of PRODUCTS) {
    await pool.query(
      `INSERT INTO products (name, price, description, badge, active) VALUES ($1,$2,$3,$4,true)`,
      [p.name, p.price, p.description, p.badge]
    );
  }

  console.log("Naongeza huduma za mfano...");
  for (const s of SERVICES) {
    await pool.query(
      `INSERT INTO services (name, price, description, active) VALUES ($1,$2,$3,true)`,
      [s.name, s.price, s.description]
    );
  }

  await pool.end();

  console.log("\n✅ Data ya mfano imekamilika.\n");
  console.log("Ingia kwa:");
  console.log("  Mmiliki   -> username: admin      password: Pendo@2026");
  console.log("  Mfanyakazi-> username: neema       password: Staff@2026");
  console.log("  (na wengine: amina, zawadi, happiness, grace, faraja — password ile ile)\n");
  console.log("⚠️  MUHIMU: Badilisha password hizi kwenye Dashibodi ya Mfanyakazi husika");
  console.log("   (au Admin -> Wafanyakazi -> Hariri) kabla ya kwenda 'live'.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
