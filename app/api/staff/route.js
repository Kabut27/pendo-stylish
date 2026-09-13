// app/api/staff/route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser, hashPassword, isStrongPassword } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { toCleanString, ValidationError, parseJsonBody } from "@/lib/validators";

export async function GET() {
  const auth = await requireUser(["admin", "staff"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  // Mfanyakazi (staff) anaona majina tu ya wenzake (kuchagua "nani alifanya huduma" -
  // mfano keshia anayeingiza mauzo kwa niaba ya msusi) - si taarifa nyeti (username/phone/skills).
  if (auth.user.role === "staff") {
    const { rows } = await query(
      `SELECT id, full_name, active FROM users WHERE role = 'staff' AND active = true ORDER BY full_name ASC`
    );
    return NextResponse.json({ staff: rows });
  }

  const { rows } = await query(
    `SELECT id, username, role, full_name, phone, skills, profile_image, active, created_at
     FROM users ORDER BY created_at DESC`
  );
  return NextResponse.json({ staff: rows });
}

export async function POST(req) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await parseJsonBody(req);
    const full_name = toCleanString(body.full_name, { maxLen: 150, required: true });
    const username = toCleanString(body.username, { maxLen: 60, required: true })?.toLowerCase();
    const phone = toCleanString(body.phone, { maxLen: 30 });
    const password = String(body.password || "");
    const role = body.role === "admin" ? "admin" : "staff";
    const skills = Array.isArray(body.skills)
      ? body.skills.map((s) => String(s).trim()).filter(Boolean).slice(0, 20)
      : [];
    const profile_image = toCleanString(body.profile_image, { maxLen: 500 });

    if (!/^[a-z0-9._-]{3,60}$/.test(username)) {
      throw new ValidationError("Jina la kuingia liwe herufi/namba pekee (bila nafasi), angalau herufi 3.");
    }
    if (!isStrongPassword(password)) {
      throw new ValidationError(
        "Password lazima iwe angalau herufi 8, ikiwa na herufi kubwa, ndogo, na namba."
      );
    }

    const { rows: dup } = await query(`SELECT id FROM users WHERE username = $1`, [username]);
    if (dup.length) throw new ValidationError("Jina hili la kuingia tayari linatumika.");

    const password_hash = await hashPassword(password);

    const { rows } = await query(
      `INSERT INTO users (username, password_hash, role, full_name, phone, skills, profile_image)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, username, role, full_name, phone, skills, profile_image, active, created_at`,
      [username, password_hash, role, full_name, phone, skills, profile_image]
    );

    await logAudit({
      user: auth.user,
      action: "STAFF_CREATE",
      entityType: "user",
      entityId: rows[0].id,
      details: { username, full_name, role },
      ip: getClientIp(req),
    });

    return NextResponse.json({ staff: rows[0] }, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Hitilafu ya server. Jaribu tena." }, { status: 500 });
  }
}
