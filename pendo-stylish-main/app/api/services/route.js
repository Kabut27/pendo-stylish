import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { toCleanString, toMoney, ValidationError, parseJsonBody } from "@/lib/validators";

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
      ? `SELECT * FROM services WHERE active = true ORDER BY sort_order ASC, created_at DESC`
      : `SELECT * FROM services ORDER BY sort_order ASC, created_at DESC`
  );

  return NextResponse.json({ services: rows });
}

export async function POST(req) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await parseJsonBody(req);
    const name = toCleanString(body.name, { maxLen: 200, required: true });
    const price = toMoney(body.price, { fieldName: "Bei" });
    const description = toCleanString(body.description, { maxLen: 2000 });
    const active = body.active !== false;

    const { rows } = await query(
      `INSERT INTO services (name, price, description, active) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, price, description, active]
    );

    await logAudit({
      user: auth.user,
      action: "SERVICE_CREATE",
      entityType: "service",
      entityId: rows[0].id,
      details: { name, price },
      ip: getClientIp(req),
    });

    return NextResponse.json({ service: rows[0] }, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Hitilafu ya server. Jaribu tena." }, { status: 500 });
  }
}
