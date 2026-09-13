import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { toCleanString, ValidationError, parseJsonBody } from "@/lib/validators";

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
      ? `SELECT * FROM gallery WHERE active = true ORDER BY gallery_date DESC LIMIT 200`
      : `SELECT * FROM gallery ORDER BY gallery_date DESC LIMIT 200`
  );
  return NextResponse.json({ gallery: rows });
}

export async function POST(req) {
  const auth = await requireUser(["admin", "staff"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await parseJsonBody(req);
    const before_image = toCleanString(body.before_image, { maxLen: 500, required: true });
    const after_image = toCleanString(body.after_image, { maxLen: 500, required: true });
    const description = toCleanString(body.description, { maxLen: 1000 });
    const gallery_date = body.gallery_date ? toCleanString(body.gallery_date, { maxLen: 10 }) : null;
    const active = body.active !== false;

    const { rows } = await query(
      `INSERT INTO gallery (before_image, after_image, description, gallery_date, active, created_by)
       VALUES ($1,$2,$3, COALESCE($4, CURRENT_DATE), $5, $6) RETURNING *`,
      [before_image, after_image, description, gallery_date, active, auth.user.id]
    );

    await logAudit({
      user: auth.user,
      action: "GALLERY_CREATE",
      entityType: "gallery",
      entityId: rows[0].id,
      ip: getClientIp(req),
    });

    return NextResponse.json({ item: rows[0] }, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Hitilafu ya server. Jaribu tena." }, { status: 500 });
  }
}
