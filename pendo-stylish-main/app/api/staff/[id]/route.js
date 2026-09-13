// app/api/staff/[id]/route.js
// KUMBUKA: Hatufuti mfanyakazi kabisa kwenye database (kwa sababu mauzo yake
// yanamhitaji kwa historia - ON DELETE RESTRICT). Badala yake tunamzima
// (active=false) - hawezi kuingia tena lakini historia ya mauzo inabaki salama.
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser, hashPassword, isStrongPassword } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { isValidUuid, toCleanString, ValidationError, parseJsonBody } from "@/lib/validators";
import { deleteImageIfExists } from "@/lib/imageProcessing";

export async function PUT(req, { params }) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isValidUuid(params.id)) return NextResponse.json({ error: "ID si sahihi." }, { status: 400 });

  const { rows: existingRows } = await query(`SELECT * FROM users WHERE id = $1`, [params.id]);
  const existing = existingRows[0];
  if (!existing) return NextResponse.json({ error: "Mfanyakazi hayupo." }, { status: 404 });

  try {
    const body = await parseJsonBody(req);
    const full_name = toCleanString(body.full_name, { maxLen: 150, required: true });
    const phone = toCleanString(body.phone, { maxLen: 30 });
    const skills = Array.isArray(body.skills)
      ? body.skills.map((s) => String(s).trim()).filter(Boolean).slice(0, 20)
      : existing.skills;
    const profile_image =
      body.profile_image !== undefined ? toCleanString(body.profile_image, { maxLen: 500 }) : existing.profile_image;

    if (existing.profile_image && profile_image !== existing.profile_image) {
      await deleteImageIfExists(existing.profile_image);
    }

    let active = existing.active;
    if (typeof body.active === "boolean") {
      if (existing.id === auth.user.id && body.active === false) {
        throw new ValidationError("Huwezi kuzima akaunti yako mwenyewe ukiwa umeingia.");
      }
      active = body.active;
    }

    let password_hash = existing.password_hash;
    if (body.password) {
      if (!isStrongPassword(body.password)) {
        throw new ValidationError("Password mpya lazima iwe angalau herufi 8, herufi kubwa, ndogo, na namba.");
      }
      password_hash = await hashPassword(body.password);
    }

    const { rows } = await query(
      `UPDATE users SET full_name=$1, phone=$2, skills=$3, profile_image=$4, active=$5, password_hash=$6, updated_at=now()
       WHERE id=$7
       RETURNING id, username, role, full_name, phone, skills, profile_image, active, created_at`,
      [full_name, phone, skills, profile_image, active, password_hash, params.id]
    );

    await logAudit({
      user: auth.user,
      action: "STAFF_UPDATE",
      entityType: "user",
      entityId: params.id,
      details: { full_name, active, password_changed: !!body.password },
      ip: getClientIp(req),
    });

    return NextResponse.json({ staff: rows[0] });
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

  if (params.id === auth.user.id) {
    return NextResponse.json({ error: "Huwezi kufuta/kuzima akaunti yako mwenyewe." }, { status: 400 });
  }

  const { rows: existingRows } = await query(`SELECT * FROM users WHERE id = $1`, [params.id]);
  const existing = existingRows[0];
  if (!existing) return NextResponse.json({ error: "Mfanyakazi hayupo." }, { status: 404 });

  await query(`UPDATE users SET active = false, updated_at = now() WHERE id = $1`, [params.id]);

  await logAudit({
    user: auth.user,
    action: "STAFF_DELETE",
    entityType: "user",
    entityId: params.id,
    details: { username: existing.username, full_name: existing.full_name },
    ip: getClientIp(req),
  });

  return NextResponse.json({ ok: true, note: "Akaunti imezimwa (historia ya mauzo imehifadhiwa)." });
}
