// lib/products.js
// Bidhaa moja inaweza kuwa na picha nyingi (jedwali product_images). Function hii
// inaongeza array ya "images" kwenye kila bidhaa, ikitumika sehemu zote zinazoonyesha
// bidhaa (homepage, API ya /api/products, admin).
import { query } from "./db";

export async function attachProductImages(products) {
  if (!products.length) return products;
  const ids = products.map((p) => p.id);
  const { rows: images } = await query(
    `SELECT id, product_id, image_url, sort_order
     FROM product_images
     WHERE product_id = ANY($1::uuid[])
     ORDER BY sort_order ASC, created_at ASC`,
    [ids]
  );

  const byProduct = {};
  for (const img of images) {
    (byProduct[img.product_id] ||= []).push({
      id: img.id,
      url: img.image_url,
      sort_order: img.sort_order,
    });
  }

  return products.map((p) => {
    const list = byProduct[p.id];
    return {
      ...p,
      images: list && list.length ? list : p.image_url ? [{ url: p.image_url }] : [],
    };
  });
}
