// lib/validators.js
// Vidogo vya kuthibitisha data - hutumika kwenye API routes zote kuzuia data mbovu
// kufika kwenye database (jina refu mno, bei hasi, n.k).

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(id) {
  return typeof id === "string" && UUID_RE.test(id);
}

export function toCleanString(value, { maxLen = 500, required = false } = {}) {
  if (value === undefined || value === null) {
    if (required) throw new ValidationError("Sehemu hii inahitajika.");
    return null;
  }
  const str = String(value).trim();
  if (required && !str) throw new ValidationError("Sehemu hii inahitajika.");
  if (str.length > maxLen) throw new ValidationError(`Maandishi ni marefu mno (upeo herufi ${maxLen}).`);
  return str || null;
}

export function toMoney(value, { fieldName = "Bei", required = true } = {}) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new ValidationError(`${fieldName} inahitajika.`);
    return 0;
  }
  const num = Number(value);
  if (Number.isNaN(num) || !Number.isFinite(num) || num < 0) {
    throw new ValidationError(`${fieldName} si sahihi.`);
  }
  return Math.round(num * 100) / 100;
}

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

export async function parseJsonBody(req) {
  try {
    return await req.json();
  } catch {
    throw new ValidationError("Ombi si sahihi (JSON haikusomeka).");
  }
}
