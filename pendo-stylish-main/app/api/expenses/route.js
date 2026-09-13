import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { toCleanString, toMoney, ValidationError, parseJsonBody } from "@/lib/validators";

export async function GET(req) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const conditions = [];
  const values = [];
  if (from) {
    values.push(from);
    conditions.push(`expense_date >= $${values.length}`);
  }
  if (to) {
    values.push(to);
    conditions.push(`expense_date <= $${values.length}`);
  }
  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await query(
    `SELECT * FROM business_expenses ${whereSql} ORDER BY expense_date DESC, created_at DESC LIMIT 500`,
    values
  );
  return NextResponse.json({ expenses: rows });
}

export async function POST(req) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await parseJsonBody(req);
    const category = toCleanString(body.category, { maxLen: 100, required: true });
    const amount = toMoney(body.amount, { fieldName: "Kiasi" });
    const description = toCleanString(body.description, { maxLen: 1000 });
    const expense_date = body.expense_date ? toCleanString(body.expense_date, { maxLen: 10 }) : null;

    const { rows } = await query(
      `INSERT INTO business_expenses (category, amount, description, entered_by, expense_date)
       VALUES ($1,$2,$3,$4, COALESCE($5, CURRENT_DATE)) RETURNING *`,
      [category, amount, description, auth.user.id, expense_date]
    );

    await logAudit({
      user: auth.user,
      action: "EXPENSE_CREATE",
      entityType: "expense",
      entityId: rows[0].id,
      details: { category, amount },
      ip: getClientIp(req),
    });

    return NextResponse.json({ expense: rows[0] }, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Hitilafu ya server. Jaribu tena." }, { status: 500 });
  }
}
