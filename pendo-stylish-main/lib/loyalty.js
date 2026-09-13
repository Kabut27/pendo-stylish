// lib/loyalty.js
// Mteja anayerudi mara kwa mara (kwa jina/namba aliyotoa wakati wa mauzo)
// anafuatiliwa hapa - baada ya idadi fulani ya huduma (loyalty_threshold
// kwenye settings) anastahili punguzo maalum.

import { query } from "./db";

export async function touchLoyalty(customerIdentifier) {
  const id = String(customerIdentifier || "").trim();
  if (!id) return;
  try {
    await query(
      `INSERT INTO loyalty_customers (customer_identifier, visit_count, last_visit)
       VALUES ($1, 1, CURRENT_DATE)
       ON CONFLICT (customer_identifier)
       DO UPDATE SET visit_count = loyalty_customers.visit_count + 1, last_visit = CURRENT_DATE`,
      [id]
    );
  } catch (err) {
    console.error("Imeshindwa kusasisha loyalty:", err.message);
  }
}

export async function getLoyaltyStatus(customerIdentifier) {
  const id = String(customerIdentifier || "").trim();
  if (!id) return null;
  const { rows } = await query(
    `SELECT * FROM loyalty_customers WHERE customer_identifier = $1`,
    [id]
  );
  return rows[0] || null;
}
