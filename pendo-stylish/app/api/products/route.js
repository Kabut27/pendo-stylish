// app/api/products/route.js
import { NextResponse } from "next/server";
import { query, withTransaction } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { toCleanString, toMoney, ValidationError, parseJsonBody } from "@/lib/validators";
import { attachProductImages } from "@/lib/products";

function cleanImageList(images) {
  if (!Array.isArray(images)) return [];
  return images
    .filter((u) => typeof u === "string" && u.trim())
    .map((u) => u.trim())
    .slice(0, 8); // upeo picha 8 kwa bidhaa moja
}

// GET: umma anaona bidhaa "active" tu; admin akiwa ameingia na ?all=1 anaona zote.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const wantAll = searchParams.get("all") === "1";

  let onlyActive = true;
  if (wantAll) {
    const auth = await requireUser(["admin", "staff"]);
    if (!auth.error) onlyActive = false;
  }

  const { rows } = await query(
    onlyActive
      ? `SELECT * FROM products WHERE active = true ORDER BY sort_order ASC, created_at DESC`
      : `SELECT * FROM products ORDER BY sort_order ASC, created_at DESC`
  );

  const products = await attachProductImages(rows);
  return NextResponse.json({ products });
}

export async function POST(req) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await parseJsonBody(req);
    const name = toCleanString(body.name, { maxLen: 200, required: true });
    const price = toMoney(body.price, { fieldName: "Bei" });
    const description = toCleanString(body.description, { maxLen: 4000 });
    const images = cleanImageList(body.images);
    const video_url = toCleanString(body.video_url, { maxLen: 500 });
    const badge = body.badge === "mpya" || body.badge === "inayopendwa" ? body.badge : null;
    const active = body.active !== false;
    const image_url = images[0] || null; // picha kuu, kwa nafasi zinazohitaji picha 1 tu

    const product = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO products (name, price, description, image_url, video_url, badge, active)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [name, price, description, image_url, video_url, badge, active]
      );
      const created = rows[0];
      for (let i = 0; i < images.length; i++) {
        await client.query(
          `INSERT INTO product_images (product_id, image_url, sort_order) VALUES ($1,$2,$3)`,
          [created.id, images[i], i]
        );
      }
      return created;
    });

    await logAudit({
      user: auth.user,
      action: "PRODUCT_CREATE",
      entityType: "product",
      entityId: product.id,
      details: { name, price, imageCount: images.length, hasVideo: !!video_url },
      ip: getClientIp(req),
    });

    const [withImages] = await attachProductImages([product]);
    return NextResponse.json({ product: withImages }, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Hitilafu ya server. Jaribu tena." }, { status: 500 });
  }
}
