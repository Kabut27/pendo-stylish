// app/api/sale-locks/route.js
// Kusimamia "kufunga" siku/mwezi za mauzo. Admin PEKEE anaweza kufunga au
// kuona orodha ya vipindi vilivyofungwa. Baada ya kufungwa, mfanyakazi
// hawezi tena kuhariri/kufuta mauzo ya kipindi hicho (angalia
// app/api/sales/route.js na app/api/sales/[id]/route.js).
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { ValidationError, parseJsonBody } from "@/lib/validators";

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;

export async function GET() {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { rows } = await query(
    `SELECT sl.*, u.full_name AS locked_by_name
     FROM sale_locks sl
     LEFT JOIN users u ON u.id = sl.locked_by
     ORDER BY period_value DESC, lock_type ASC`
  );
  return NextResponse.json({ locks: rows });
}

export async function POST(req) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await parseJsonBody(req);

    const lock_type = body.lock_type === "month" ? "month" : body.lock_type === "day" ? "day" : null;
    if (!lock_type) throw new ValidationError("Chagua aina ya kufunga: siku au mwezi.");

    const period_value = typeof body.period_value === "string" ? body.period_value.trim() : "";
    if (lock_type === "day" && !DAY_RE.test(period_value)) {
      throw new ValidationError("Tarehe si sahihi (mfano: 2026-09-13).");
    }
    if (lock_type === "month" && !MONTH_RE.test(period_value)) {
      throw new ValidationError("Mwezi si sahihi (mfano: 2026-09).");
    }

    const { rows } = await query(
      `INSERT INTO sale_locks (lock_type, period_value, locked_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (lock_type, period_value) DO NOTHING
       RETURNING *`,
      [lock_type, period_value, auth.user.id]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: "Kipindi hiki tayari kimefungwa." }, { status: 409 });
    }

    await logAudit({
      user: auth.user,
      action: "SALES_PERIOD_LOCK",
      entityType: "sale_lock",
      entityId: rows[0].id,
      details: { lock_type, period_value },
      ip: getClientIp(req),
    });

    return NextResponse.json({ lock: rows[0] }, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Hitilafu ya server. Jaribu tena." }, { status: 500 });
  }
}
