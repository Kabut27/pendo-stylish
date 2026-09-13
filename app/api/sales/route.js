// app/api/sales/route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { isValidUuid, toCleanString, toMoney, ValidationError, parseJsonBody } from "@/lib/validators";
import { touchLoyalty } from "@/lib/loyalty";

export async function GET(req) {
  const auth = await requireUser(["admin", "staff"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from"); // YYYY-MM-DD
  const to = searchParams.get("to");
  const staffIdParam = searchParams.get("staff_id");
  const limit = Math.min(Number(searchParams.get("limit")) || 200, 500);

  const conditions = [];
  const values = [];

  // Mfanyakazi anaona: (a) mauzo aliyofanya YEYE (staff_id = yeye), NA
  // (b) mauzo ALIYOINGIZA yeye kwa niaba ya mwenzake (entered_by = yeye) - mfano keshia
  // anayeingiza huduma iliyofanywa na msusi mwingine. Admin anaweza kuchuja kwa staff_id yeyote.
  if (auth.user.role === "staff") {
    values.push(auth.user.id);
    conditions.push(`(staff_id = $${values.length} OR entered_by = $${values.length})`);
  } else if (staffIdParam && isValidUuid(staffIdParam)) {
    values.push(staffIdParam);
    conditions.push(`staff_id = $${values.length}`);
  }

  if (from) {
    values.push(from);
    conditions.push(`sale_date >= $${values.length}`);
  }
  if (to) {
    values.push(to);
    conditions.push(`sale_date <= $${values.length}`);
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  values.push(limit);

  const { rows } = await query(
    `SELECT s.*, u.full_name AS staff_name, eb.full_name AS entered_by_name
     FROM sales s
     JOIN users u ON u.id = s.staff_id
     LEFT JOIN users eb ON eb.id = s.entered_by
     ${whereSql}
     ORDER BY s.sale_date DESC, s.created_at DESC
     LIMIT $${values.length}`,
    values
  );

  return NextResponse.json({ sales: rows });
}

export async function POST(req) {
  const auth = await requireUser(["admin", "staff"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await parseJsonBody(req);

    // Aliyefanya huduma (staff_id) anaweza kuwa mfanyakazi mwingine, si tu aliyeingiza (entered_by).
    // Hii inaruhusu, mfano, keshia/msaidizi anayepokea malipo kuingiza mauzo kwa niaba ya msusi
    // aliyefanya kazi hiyo. Iwapo hakuna staff_id iliyotolewa, tunachukulia aliyeingiza ndiye
    // aliyefanya huduma (kesi ya kawaida - msusi anayeingiza mauzo yake mwenyewe).
    let staff_id = auth.user.id;
    if (body.staff_id) {
      if (!isValidUuid(body.staff_id)) throw new ValidationError("Mfanyakazi si sahihi.");
      staff_id = body.staff_id;
    }

    const { rows: staffRows } = await query(`SELECT id, active FROM users WHERE id = $1`, [staff_id]);
    if (!staffRows[0] || !staffRows[0].active) throw new ValidationError("Mfanyakazi huyu hayupo/hafanyi kazi.");

    const item_type = body.item_type === "bidhaa" ? "bidhaa" : "huduma";
    const item_name = toCleanString(body.item_name, { maxLen: 200, required: true });
    const service_detail = toCleanString(body.service_detail, { maxLen: 300 });
    const revenue = toMoney(body.revenue, { fieldName: "Mapato" });
    const cost = toMoney(body.cost, { fieldName: "Matumizi", required: false });
    const customer_name = toCleanString(body.customer_name, { maxLen: 150 });
    const notes = toCleanString(body.notes, { maxLen: 1000 });
    const sale_date = body.sale_date ? toCleanString(body.sale_date, { maxLen: 10 }) : null;

    const { rows } = await query(
      `INSERT INTO sales (item_type, item_name, service_detail, staff_id, customer_name, revenue, cost, entered_by, notes, sale_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, COALESCE($10, CURRENT_DATE))
       RETURNING *`,
      [item_type, item_name, service_detail, staff_id, customer_name, revenue, cost, auth.user.id, notes, sale_date]
    );

    if (customer_name) {
      await touchLoyalty(customer_name);
    }

    await logAudit({
      user: auth.user,
      action: "SALE_CREATE",
      entityType: "sale",
      entityId: rows[0].id,
      details: { item_name, revenue, cost, staff_id, entered_by: auth.user.id },
      ip: getClientIp(req),
    });

    return NextResponse.json({ sale: rows[0] }, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Hitilafu ya server. Jaribu tena." }, { status: 500 });
  }
}
