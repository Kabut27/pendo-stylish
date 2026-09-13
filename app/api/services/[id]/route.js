import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { isValidUuid, toCleanString, toMoney, ValidationError, parseJsonBody } from "@/lib/validators";

export async function PUT(req, { params }) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isValidUuid(params.id)) return NextResponse.json({ error: "ID si sahihi." }, { status: 400 });

  const { rows: existingRows } = await query(`SELECT * FROM services WHERE id = $1`, [params.id]);
  const existing = existingRows[0];
  if (!existing) return NextResponse.json({ error: "Huduma haipo." }, { status: 404 });

  try {
    const body = await parseJsonBody(req);
    const name = toCleanString(body.name, { maxLen: 200, required: true });
    const price = toMoney(body.price, { fieldName: "Bei" });
    const description = toCleanString(body.description, { maxLen: 2000 });
    const active = body.active !== false;

    const { rows } = await query(
      `UPDATE services SET name=$1, price=$2, description=$3, active=$4, updated_at=now() WHERE id=$5 RETURNING *`,
      [name, price, description, active, params.id]
    );

    await logAudit({
      user: auth.user,
      action: "SERVICE_UPDATE",
      entityType: "service",
      entityId: params.id,
      details: { before: existing, after: rows[0] },
      ip: getClientIp(req),
    });

    return NextResponse.json({ service: rows[0] });
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

  const { rows: existingRows } = await query(`SELECT * FROM services WHERE id = $1`, [params.id]);
  const existing = existingRows[0];
  if (!existing) return NextResponse.json({ error: "Huduma haipo." }, { status: 404 });

  await query(`DELETE FROM services WHERE id = $1`, [params.id]);

  await logAudit({
    user: auth.user,
    action: "SERVICE_DELETE",
    entityType: "service",
    entityId: params.id,
    details: { name: existing.name },
    ip: getClientIp(req),
  });

  return NextResponse.json({ ok: true });
}
