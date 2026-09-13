// app/api/audit/route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET(req) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 100, 300);

  const { rows } = await query(
    `SELECT id, username, action, entity_type, entity_id, details, ip_address, created_at
     FROM audit_log ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );

  return NextResponse.json({ logs: rows });
}
