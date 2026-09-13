// lib/saleLocks.js
// Kuangalia kama tarehe fulani ya mauzo imefungwa (siku mahususi AU
// mwezi mzima unaoihusisha). Inatumika kuzuia WAFANYAKAZI kuhariri/
// kufuta mauzo ya vipindi vilivyofungwa - Admin bado anapita bila kizuizi.

import { query } from "@/lib/db";

/**
 * @param {string|Date} saleDate - tarehe ya mauzo (Date object kutoka DB, au "YYYY-MM-DD")
 * @returns {Promise<boolean>}
 */
export async function isSaleDateLocked(saleDate) {
  if (!saleDate) return false;
  const dateStr =
    saleDate instanceof Date ? saleDate.toISOString().slice(0, 10) : String(saleDate).slice(0, 10);
  const month = dateStr.slice(0, 7);

  const { rows } = await query(
    `SELECT 1 FROM sale_locks
     WHERE (lock_type = 'day' AND period_value = $1)
        OR (lock_type = 'month' AND period_value = $2)
     LIMIT 1`,
    [dateStr, month]
  );
  return rows.length > 0;
}

export const SALE_LOCK_MESSAGE =
  "Kipindi hiki cha mauzo kimefungwa na Admin. Wasiliana na Admin kama unahitaji mabadiliko.";
