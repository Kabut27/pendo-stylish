// lib/getSettings.js
// Mipangilio yote (namba ya WhatsApp, lat/long, social links n.k) inatoka kwenye
// jedwali la "settings" - hivyo mmiliki anaweza kuzibadilisha bila kugusa code.

import { query } from "./db";

const DEFAULTS = {
  business_name: "Pendo Stylish",
  whatsapp_number: "255753834960",
  phone_number: "+255753834960",
  address_text: "Iringa Plaza, Ghorofa ya Pili, Iringa",
  latitude: "-7.782665",
  longitude: "35.696247",
  instagram_salon_url: "https://www.instagram.com/pendo_stylish_saloon",
  instagram_makeup_url: "https://www.instagram.com/pendo_stylish",
  tiktok_url: "https://www.tiktok.com/@pendo_stylish",
  hero_tagline: "Urembo wa Kiwango cha Juu, Iringa",
  announcement_text: "Punguzo Maalum kwa Wateja Wapya",
  loyalty_threshold: "5",
  loyalty_reward_text: "Punguzo maalum baada ya huduma 5",
};

/**
 * Soma settings zote kama object rahisi { key: value }.
 * Haina throw hata database ikishindwa - inarudisha DEFAULTS badala yake
 * ili website ya umma isivunjike kwa mtumiaji.
 */
export async function getSettings() {
  try {
    const { rows } = await query(`SELECT key, value FROM settings`);
    const map = { ...DEFAULTS };
    for (const row of rows) {
      if (row.value !== null && row.value !== undefined) map[row.key] = row.value;
    }
    return map;
  } catch (err) {
    console.error("Imeshindwa kusoma settings, natumia default:", err.message);
    return DEFAULTS;
  }
}

export async function updateSettings(updates) {
  const entries = Object.entries(updates).filter(([k]) => k in DEFAULTS);
  for (const [key, value] of entries) {
    await query(
      `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [key, value === null || value === undefined ? "" : String(value)]
    );
  }
  return getSettings();
}

export const SETTINGS_KEYS = Object.keys(DEFAULTS);
