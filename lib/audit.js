// lib/audit.js
// Kila kitendo muhimu (kuongeza/kuhariri/kufuta) kinarekodiwa hapa.
// Hii haipaswi ku-throw kamwe kiasi cha kuvunja kitendo kikuu - logging tu.

import { query } from "./db";

/**
 * @param {object} opts
 * @param {object|null} opts.user - { id, username } wa aliyefanya kitendo
 * @param {string} opts.action - mfano "PRODUCT_CREATE", "STAFF_DELETE", "LOGIN_FAILED"
 * @param {string} [opts.entityType]
 * @param {string} [opts.entityId]
 * @param {object} [opts.details]
 * @param {string} [opts.ip]
 */
export async function logAudit({ user, action, entityType, entityId, details, ip }) {
  try {
    await query(
      `INSERT INTO audit_log (user_id, username, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        user?.id || null,
        user?.username || null,
        action,
        entityType || null,
        entityId ? String(entityId) : null,
        details ? JSON.stringify(details) : null,
        ip || null,
      ]
    );
  } catch (err) {
    console.error("Imeshindwa kuandika audit log:", err.message);
  }
}

export function getClientIp(req) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
