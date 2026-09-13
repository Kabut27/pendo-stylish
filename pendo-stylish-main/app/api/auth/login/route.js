// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { verifyPassword, createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req) {
  const ip = getClientIp(req);

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ombi si sahihi." }, { status: 400 });
  }

  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!username || !password) {
    return NextResponse.json({ error: "Jaza jina la mtumiaji na password." }, { status: 400 });
  }

  const rl = checkRateLimit(`login:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Majaribio mengi mno. Tafadhali subiri dakika chache kisha jaribu tena.` },
      { status: 429 }
    );
  }

  const { rows } = await query(
    `SELECT id, username, password_hash, role, full_name, active FROM users WHERE username = $1`,
    [username]
  );
  const user = rows[0];

  if (!user || !user.active) {
    await logAudit({ user: null, action: "LOGIN_FAILED", details: { username }, ip });
    return NextResponse.json({ error: "Jina la mtumiaji au password si sahihi." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    await logAudit({ user: { id: user.id, username: user.username }, action: "LOGIN_FAILED", ip });
    return NextResponse.json({ error: "Jina la mtumiaji au password si sahihi." }, { status: 401 });
  }

  const token = await createSessionToken(user);
  const cookieOpts = sessionCookieOptions();
  cookies().set(cookieOpts.name, token, cookieOpts);

  await logAudit({ user: { id: user.id, username: user.username }, action: "LOGIN_SUCCESS", ip });

  return NextResponse.json({
    user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
  });
}
