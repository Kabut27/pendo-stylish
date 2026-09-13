// app/api/products/[id]/route.js
import { NextResponse } from "next/server";
import { query, withTransaction } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { isValidUuid, toCleanString, toMoney, ValidationError, parseJsonBody } from "@/lib/validators";
import { deleteImageIfExists } from "@/lib/imageProcessing";
import { attachProductImages } from "@/lib/products";

function cleanImageList(images) {
  if (!Array.isArray(images)) return [];
  return images
    .filter((u) => typeof u === "string" && u.trim())
    .map((u) => u.trim())
    .slice(0, 8);
}

export async function PUT(req, { params }) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isValidUuid(params.id)) return NextResponse.json({ error: "ID si sahihi." }, { status: 400 });

  const { rows: existingRows } = await query(`SELECT * FROM products WHERE id = $1`, [params.id]);
  const existing = existingRows[0];
  if (!existing) return NextResponse.json({ error: "Bidhaa haipo." }, { status: 404 });

  const { rows: oldImageRows } = await query(
    `SELECT image_url FROM product_images WHERE product_id = $1`,
    [params.id]
  );
  const oldImageUrls = oldImageRows.map((r) => r.image_url);

  try {
    const body = await parseJsonBody(req);
    const name = toCleanString(body.name, { maxLen: 200, required: true });
    const price = toMoney(body.price, { fieldName: "Bei" });
    const description = toCleanString(body.description, { maxLen: 4000 });
    const images = body.images !== undefined ? cleanImageList(body.images) : oldImageUrls;
    const video_url = body.video_url !== undefined ? toCleanString(body.video_url, { maxLen: 500 }) : existing.video_url;
    const badge = body.badge === "mpya" || body.badge === "inayopendwa" ? body.badge : null;
    const active = body.active !== false;
    const image_url = images[0] || null;

    const removedImageUrls = oldImageUrls.filter((u) => !images.includes(u));

    const product = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `UPDATE products SET name=$1, price=$2, description=$3, image_url=$4, video_url=$5, badge=$6, active=$7, updated_at=now()
         WHERE id=$8 RETURNING *`,
        [name, price, description, image_url, video_url, badge, active, params.id]
      );
      await client.query(`DELETE FROM product_images WHERE product_id = $1`, [params.id]);
      for (let i = 0; i < images.length; i++) {
        await client.query(
          `INSERT INTO product_images (product_id, image_url, sort_order) VALUES ($1,$2,$3)`,
          [params.id, images[i], i]
        );
      }
      return rows[0];
    });

    // Futa faili za picha/video za zamani ambazo hazitumiki tena (usalama wa nafasi ya VPS)
    for (const url of removedImageUrls) await deleteImageIfExists(url);
    if (existing.video_url && existing.video_url !== video_url) {
      await deleteImageIfExists(existing.video_url);
    }

    await logAudit({
      user: auth.user,
      action: "PRODUCT_UPDATE",
      entityType: "product",
      entityId: params.id,
      details: { before: existing, after: product },
      ip: getClientIp(req),
    });

    const [withImages] = await attachProductImages([product]);
    return NextResponse.json({ product: withImages });
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Hitilafu ya server. Jaribu tena." }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isValidUuid(params.id)) return NextResponse.json({ error: "ID si sahihi." }, { status: 400 });

  const { rows: existingRows } = await query(`SELECT * FROM products WHERE id = $1`, [params.id]);
  const existing = existingRows[0];
  if (!existing) return NextResponse.json({ error: "Bidhaa haipo." }, { status: 404 });

  const { rows: imageRows } = await query(
    `SELECT image_url FROM product_images WHERE product_id = $1`,
    [params.id]
  );

  await query(`DELETE FROM products WHERE id = $1`, [params.id]); // hii inafuta product_images kiotomatiki (CASCADE)

  const allImageUrls = new Set(imageRows.map((r) => r.image_url));
  if (existing.image_url) allImageUrls.add(existing.image_url);
  for (const url of allImageUrls) await deleteImageIfExists(url);
  if (existing.video_url) await deleteImageIfExists(existing.video_url);

  await logAudit({
    user: auth.user,
    action: "PRODUCT_DELETE",
    entityType: "product",
    entityId: params.id,
    details: { name: existing.name },
    ip: getClientIp(req),
  });

  return NextResponse.json({ ok: true });
}
