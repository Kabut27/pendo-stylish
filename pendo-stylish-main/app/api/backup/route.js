// app/api/backup/route.js
// Kitufe kimoja "Pakua Backup Kamili" - hutengeneza ZIP yenye database (JSON +
// schema.sql), folder ya picha zote, na README ya jinsi ya kurudisha (restore)
// kwenye server nyingine. Lengo: mmiliki aweze "kuchukua kila kitu na kuondoka"
// wakati wowote bila kutegemea IT.
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import { PassThrough } from "stream";
import { requireUser } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { dumpDatabaseAsJson } from "@/lib/backup";

const README = `PENDO STYLISH — MAELEKEZO YA KURUDISHA (RESTORE) BACKUP
========================================================

Faili hii ina kila kitu unachohitaji kuhamisha mfumo kwenda server nyingine
(VPS nyingine, DigitalOcean, Hetzner, n.k) - hakuna "vendor lock-in".

MAUDHUI YA BACKUP HII:
  - schema.sql          -> muundo wa database (tables zote)
  - data/*.json          -> data halisi ya kila jedwali (users, products, sales, n.k)
  - uploads/              -> picha zote (bidhaa, wafanyakazi, gallery)

HATUA ZA KURUDISHA KWENYE SERVER MPYA:
  1. Weka Ubuntu 24.04, Node.js 20+, na PostgreSQL kwenye server mpya (angalia
     deploy/setup-vps.sh kwenye code ya mradi kwa amri kamili).
  2. Tengeneza database mpya tupu:
       sudo -u postgres createdb pendo_stylish
       sudo -u postgres psql -d pendo_stylish -f schema.sql
  3. Rudisha data kutoka data/*.json kwenye database (tumia script
     "scripts/restore.js" iliyopo kwenye code ya mradi:
       node scripts/restore.js /njia/ya/backup-folder
  4. Nakili folder ya "uploads" kuingia kwenye "public/uploads" ya mradi mpya.
  5. Weka .env mpya (nakili kutoka .env.example), jaza DATABASE_URL na
     SESSION_SECRET mpya.
  6. Endesha "npm install" kisha "npm run build" kisha "pm2 start ecosystem.config.js".
  7. Weka Nginx + Certbot (HTTPS) kama ilivyoelezwa kwenye README.md kuu.

Ukikwama, muulize fundi wa IT afuate hatua hizi hizi - hakuna siri yoyote
iliyofichwa; mfumo mzima umejengwa kwa teknolojia za kawaida (PostgreSQL +
Node.js/Next.js).
`;

export async function GET(req) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const dump = await dumpDatabaseAsJson();
    const schemaPath = path.join(process.cwd(), "db", "schema.sql");
    const schemaSql = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, "utf8") : "-- schema.sql haikupatikana";

    const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || "public/uploads");

    const passthrough = new PassThrough();
    const archive = archiver("zip", { zlib: { level: 6 } });
    const chunks = [];

    passthrough.on("data", (chunk) => chunks.push(chunk));
    archive.pipe(passthrough);

    archive.append(README, { name: "README.txt" });
    archive.append(schemaSql, { name: "schema.sql" });

    for (const [table, rows] of Object.entries(dump)) {
      archive.append(JSON.stringify(rows, null, 2), { name: `data/${table}.json` });
    }

    if (fs.existsSync(uploadDir)) {
      archive.directory(uploadDir, "uploads");
    }

    const finished = new Promise((resolve, reject) => {
      passthrough.on("end", resolve);
      archive.on("error", reject);
    });

    await archive.finalize();
    await finished;

    const zipBuffer = Buffer.concat(chunks);
    const filename = `pendo-stylish-backup-${new Date().toISOString().slice(0, 10)}.zip`;

    await logAudit({
      user: auth.user,
      action: "BACKUP_DOWNLOAD",
      details: { sizeKb: Math.round(zipBuffer.length / 1024) },
      ip: getClientIp(req),
    });

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (err) {
    console.error("Hitilafu ya kutengeneza backup:", err);
    return NextResponse.json({ error: "Imeshindwa kutengeneza backup. Jaribu tena." }, { status: 500 });
  }
}
