// lib/db.js
// Muunganisho wa database (PostgreSQL) - pool moja inayotumika kote kwenye app.
// Idadi ya "max" connections imepunguzwa kwa sababu VPS ina RAM ndogo (2GB).

import { Pool } from "pg";

let pool;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL haijawekwa. Angalia faili la .env (nakili kutoka .env.example)."
      );
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 8, // idadi ndogo ya connections - inatosha kwa VPS 2vCPU/2GB
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on("error", (err) => {
      // Hitilafu ya connection iliyo "idle" isisababishe app kuanguka
      console.error("Hitilafu isiyotarajiwa ya database pool:", err);
    });
  }
  return pool;
}

/**
 * Fanya query moja kwenye database.
 * @param {string} text - SQL yenye $1, $2... placeholders
 * @param {Array} params
 */
export async function query(text, params = []) {
  const client = getPool();
  const start = Date.now();
  const res = await client.query(text, params);
  if (process.env.NODE_ENV !== "production") {
    const duration = Date.now() - start;
    if (duration > 200) {
      console.warn(`[db] query ilichukua ${duration}ms:`, text.slice(0, 120));
    }
  }
  return res;
}

/**
 * Pata client moja kwa ajili ya transaction (BEGIN/COMMIT/ROLLBACK).
 * Kumbuka: lazima uite client.release() mwishoni.
 */
export async function getClient() {
  const client = await getPool().connect();
  return client;
}

/**
 * Endesha kazi kadhaa ndani ya transaction moja salama.
 * @param {(client) => Promise<any>} fn
 */
export async function withTransaction(fn) {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export default { query, getClient, withTransaction };
