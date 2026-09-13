import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { isValidUuid, toCleanString, ValidationError, parseJsonBody } from "@/lib/validators";
import { deleteImageIfExists } from "@/lib/imageProcessing";

export async function PUT(req, { params }) {
  const auth = await requireUser(["admin", "staff"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isValidUuid(params.id)) return NextResponse.json({ error: "ID si sahihi." }, { status: 400 });

  const { rows: existingRows } = await query(`SELECT * FROM gallery WHERE id = $1`, [params.id]);
  const existing = existingRows[0];
  if (!existing) return NextResponse.json({ error: "Kipengele hakipo." }, { status: 404 });

  try {
    const body = await parseJsonBody(req);
    const description = toCleanString(body.description, { maxLen: 1000 });
    const active = body.active !== false;

    const { rows } = await query(
      `UPDATE gallery SET description=$1, active=$2 WHERE id=$3 RETURNING *`,
      [description, active, params.id]
    );

    await logAudit({
      user: auth.user,
      action: "GALLERY_UPDATE",
      entityType: "gallery",
      entityId: params.id,
      ip: getClientIp(req),
    });

    return NextResponse.json({ item: rows[0] });
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Hitilafu ya server. Jaribu tena." }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const auth = await requireUser(["admin", "staff"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isValidUuid(params.id)) return NextResponse.json({ error: "ID si sahihi." }, { status: 400 });

  const { rows: existingRows } = await query(`SELECT * FROM gallery WHERE id = $1`, [params.id]);
  const existing = existingRows[0];
  if (!existing) return NextResponse.json({ error: "Kipengele hakipo." }, { status: 404 });

  await query(`DELETE FROM gallery WHERE id = $1`, [params.id]);
  await deleteImageIfExists(existing.before_image);
  await deleteImageIfExists(existing.after_image);

  await logAudit({
    user: auth.user,
    action: "GALLERY_DELETE",
    entityType: "gallery",
    entityId: params.id,
    ip: getClientIp(req),
  });

  return NextResponse.json({ ok: true });
}
