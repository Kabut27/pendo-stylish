// app/api/sales/[id]/route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const validId = (id) => typeof id === "string" && UUID_RE.test(id);

function staffCanTouch(user, existing) {
  // Mfanyakazi anaweza kuhariri/kufuta rekodi kama YEYE ndiye aliyefanya huduma (staff_id)
  // AU YEYE ndiye aliyeiingiza mfumoni (entered_by) - mfano keshia anayerekebisha alichoingiza.
  return existing.staff_id === user.id || existing.entered_by === user.id;
}

export async function PUT(req, { params }) {
  const auth = await requireUser(["admin", "staff"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!validId(params.id)) return NextResponse.json({ error: "ID si sahihi." }, { status: 400 });

  const { rows: existingRows } = await query(`SELECT * FROM sales WHERE id = $1`, [params.id]);
  const existing = existingRows[0];
  if (!existing) return NextResponse.json({ error: "Mauzo hayapo." }, { status: 404 });

  if (auth.user.role === "staff" && !staffCanTouch(auth.user, existing)) {
    return NextResponse.json({ error: "Huruhusiwi kuhariri mauzo haya." }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ombi si sahihi." }, { status: 400 });
  }

  const revenue = body.revenue !== undefined ? Number(body.revenue) : existing.revenue;
  const cost = body.cost !== undefined ? Number(body.cost) : existing.cost;
  if (Number.isNaN(revenue) || revenue < 0 || Number.isNaN(cost) || cost < 0) {
    return NextResponse.json({ error: "Namba za fedha si sahihi." }, { status: 400 });
  }
  const item_name = body.item_name?.trim() || existing.item_name;
  const service_detail = body.service_detail !== undefined ? (body.service_detail?.trim() || null) : existing.service_detail;
  const customer_name = body.customer_name !== undefined ? body.customer_name : existing.customer_name;
  const notes = body.notes !== undefined ? body.notes : existing.notes;

  const { rows } = await query(
    `UPDATE sales SET item_name=$1, service_detail=$2, customer_name=$3, revenue=$4, cost=$5, notes=$6 WHERE id=$7 RETURNING *`,
    [item_name, service_detail, customer_name, revenue, cost, notes, params.id]
  );

  await logAudit({
    user: auth.user,
    action: "SALE_UPDATE",
    entityType: "sale",
    entityId: params.id,
    details: { before: existing, after: rows[0] },
    ip: getClientIp(req),
  });

  return NextResponse.json({ sale: rows[0] });
}

export async function DELETE(req, { params }) {
  const auth = await requireUser(["admin", "staff"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!validId(params.id)) return NextResponse.json({ error: "ID si sahihi." }, { status: 400 });

  const { rows: existingRows } = await query(`SELECT * FROM sales WHERE id = $1`, [params.id]);
  const existing = existingRows[0];
  if (!existing) return NextResponse.json({ error: "Mauzo hayapo." }, { status: 404 });

  if (auth.user.role === "staff" && !staffCanTouch(auth.user, existing)) {
    return NextResponse.json({ error: "Huruhusiwi kufuta mauzo haya." }, { status: 403 });
  }

  await query(`DELETE FROM sales WHERE id = $1`, [params.id]);

  await logAudit({
    user: auth.user,
    action: "SALE_DELETE",
    entityType: "sale",
    entityId: params.id,
    details: { item_name: existing.item_name, revenue: existing.revenue },
    ip: getClientIp(req),
  });

  return NextResponse.json({ ok: true });
}
