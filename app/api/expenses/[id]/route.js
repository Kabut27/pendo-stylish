import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { isValidUuid, toCleanString, toMoney, ValidationError, parseJsonBody } from "@/lib/validators";

export async function PUT(req, { params }) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isValidUuid(params.id)) return NextResponse.json({ error: "ID si sahihi." }, { status: 400 });

  const { rows: existingRows } = await query(`SELECT * FROM business_expenses WHERE id = $1`, [params.id]);
  const existing = existingRows[0];
  if (!existing) return NextResponse.json({ error: "Tumizi haipo." }, { status: 404 });

  try {
    const body = await parseJsonBody(req);
    const category = toCleanString(body.category, { maxLen: 100, required: true });
    const amount = toMoney(body.amount, { fieldName: "Kiasi" });
    const description = toCleanString(body.description, { maxLen: 1000 });

    const { rows } = await query(
      `UPDATE business_expenses SET category=$1, amount=$2, description=$3 WHERE id=$4 RETURNING *`,
      [category, amount, description, params.id]
    );

    await logAudit({
      user: auth.user,
      action: "EXPENSE_UPDATE",
      entityType: "expense",
      entityId: params.id,
      details: { before: existing, after: rows[0] },
      ip: getClientIp(req),
    });

    return NextResponse.json({ expense: rows[0] });
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

  const { rows: existingRows } = await query(`SELECT * FROM business_expenses WHERE id = $1`, [params.id]);
  const existing = existingRows[0];
  if (!existing) return NextResponse.json({ error: "Tumizi haipo." }, { status: 404 });

  await query(`DELETE FROM business_expenses WHERE id = $1`, [params.id]);

  await logAudit({
    user: auth.user,
    action: "EXPENSE_DELETE",
    entityType: "expense",
    entityId: params.id,
    details: { category: existing.category, amount: existing.amount },
    ip: getClientIp(req),
  });

  return NextResponse.json({ ok: true });
}
