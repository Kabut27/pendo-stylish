// app/api/sale-locks/[id]/route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const validId = (id) => typeof id === "string" && UUID_RE.test(id);

export async function DELETE(req, { params }) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!validId(params.id)) return NextResponse.json({ error: "ID si sahihi." }, { status: 400 });

  const { rows: existingRows } = await query(`SELECT * FROM sale_locks WHERE id = $1`, [params.id]);
  const existing = existingRows[0];
  if (!existing) return NextResponse.json({ error: "Kipindi hiki hakipo/tayari kimefunguliwa." }, { status: 404 });

  await query(`DELETE FROM sale_locks WHERE id = $1`, [params.id]);

  await logAudit({
    user: auth.user,
    action: "SALES_PERIOD_UNLOCK",
    entityType: "sale_lock",
    entityId: params.id,
    details: { lock_type: existing.lock_type, period_value: existing.period_value },
    ip: getClientIp(req),
  });

  return NextResponse.json({ ok: true });
}
